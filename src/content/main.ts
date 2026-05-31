import { getSettings, onSettingsChanged, type Settings } from "../settings";
import { SELECTORS } from "../selectors";
import { isSponsoredPost, isSuggestedPost } from "../lib/filters";
import { startFeedEnforcer } from "./feed-enforcer";
import {
  isQueryParamDebug,
  setDebugActive,
  bumpCount,
  debugLog,
  type HideReason,
} from "../debug";

function effectiveDebug(settings: Settings): boolean {
  return settings.debug || isQueryParamDebug();
}

function applyMode(settings: Settings): void {
  const html = document.documentElement;
  const debug = effectiveDebug(settings);
  setDebugActive(settings.enabled && debug);

  if (!settings.enabled) {
    html.setAttribute("data-igf-mode", "off");
  } else if (debug) {
    html.setAttribute("data-igf-mode", "debug");
  } else {
    html.removeAttribute("data-igf-mode");
  }
}

function markHidden(el: Element, reason: HideReason): void {
  if (el.hasAttribute("data-igf-hidden")) return;
  el.setAttribute("data-igf-hidden", reason);
  bumpCount(reason);
  debugLog(reason, el);
}

function collectMatches(root: Element, selector: string): Element[] {
  const out: Element[] = [];
  if (root.matches(selector)) out.push(root);
  for (const el of root.querySelectorAll(selector)) out.push(el);
  return out;
}

function scan(root: Element): void {
  for (const post of collectMatches(root, SELECTORS.feed.post)) {
    // Sponsored takes precedence over suggested for accurate debug counts;
    // a post is only ever marked once (markHidden guards re-marking).
    if (isSponsoredPost(post)) markHidden(post, "sponsored");
    else if (isSuggestedPost(post)) markHidden(post, "suggested");
  }
}

function startObserver(): void {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof Element) scan(node);
      }
    }
  });
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
  });
}

function init(): void {
  scan(document.documentElement);
  startObserver();
}

// Run the feed enforcer immediately at document_start (not in init, which
// waits for DOMContentLoaded): a redirect to ?variant=following is cheapest
// before the algorithmic feed starts rendering.
startFeedEnforcer();

void getSettings().then(applyMode);
onSettingsChanged(applyMode);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}

console.debug("[igf] content script loaded");
