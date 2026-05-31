import { getSettings, onSettingsChanged } from "../settings";
import {
  isHomeRoute,
  hasFollowingVariant,
  withFollowingVariant,
} from "../lib/url";

// Keep the home feed pinned to the chronological "Following" view.
//
// Instagram desktop web has NO feed-switcher in its UI (it's mobile-only), so
// there is no control to click. Instead the site honors a URL parameter —
// ?variant=following — which loads the Following feed chronologically. The
// param only affects a FRESH feed fetch; it does not persist, and once the
// feed is loaded Instagram freely strips it from the address bar.
//
// Two — and only two — moments matter, because they're the only times
// Instagram fetches the home feed afresh:
//
//   1. A real page load (typed URL, bookmark, refresh, new tab). Handled by
//      enforceInitialLoad(): at document_start, redirect a bare home route to
//      add the param before Instagram fetches.
//   2. Clicking the Home / logo link. Instagram does a client-side nav that
//      re-fetches the ALGORITHMIC feed. Handled by interceptHomeClicks():
//      catch the click on the <a href="/"> and force a load carrying the param.
//
// We deliberately do NOT hook history.pushState/replaceState. Instagram fires
// those constantly during normal use (scroll pagination, opening/closing a
// post) and strips the param as it does — reacting caused mid-scroll reloads
// that flickered and truncated infinite scroll. Scrolling does not re-fetch
// the feed, so the loaded chronological feed stays chronological; there is
// nothing to re-pin until the next real fetch, which (1) and (2) both cover.
//
// NOTE: the chronological feed itself only goes back ~1 week — that's an
// Instagram-side limit of the ?variant=following feed, not something the
// extension controls.

// Cached so the click handler can decide synchronously. Starts at the default
// (enabled) and is refined once storage resolves.
let filterEnabled = true;

function isPlainLeftClick(event: MouseEvent): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

// The Home icon and the Instagram wordmark are both <a href="/">. Resolve via
// the anchor's own pathname/host so we match only same-origin links to root.
function homeAnchorFrom(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null;
  const anchor = target.closest("a");
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.host !== location.host) return null;
  if (anchor.pathname !== "/") return null;
  return anchor;
}

function interceptHomeClicks(): void {
  document.addEventListener(
    "click",
    (event) => {
      if (!filterEnabled) return; // let Instagram's default nav happen
      if (!isPlainLeftClick(event)) return; // preserve cmd/ctrl-click etc.
      const anchor = homeAnchorFrom(event.target);
      if (!anchor) return;
      if (hasFollowingVariant(anchor.href)) return; // already correct
      // Take over the navigation: a full load with the param is the only way
      // to make Instagram fetch the chronological feed.
      event.preventDefault();
      event.stopPropagation();
      location.assign(withFollowingVariant(`${location.origin}/`));
    },
    true, // capture, so we beat Instagram's own click handler
  );
}

async function enforceInitialLoad(): Promise<void> {
  if (!isHomeRoute(location)) return;
  if (hasFollowingVariant(location)) return;
  const settings = await getSettings();
  if (!settings.enabled) return;
  // replace(), not assign(), so the param-less entry doesn't pollute history.
  location.replace(withFollowingVariant(location.href));
}

export function startFeedEnforcer(): void {
  void getSettings().then((s) => {
    filterEnabled = s.enabled;
  });
  onSettingsChanged((s) => {
    filterEnabled = s.enabled;
  });
  interceptHomeClicks();
  void enforceInitialLoad();
}
