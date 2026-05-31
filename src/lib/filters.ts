// Pure predicates: take an Element, return a boolean. No DOM mutation,
// no global state, no browser.* access — entirely so these are easy to
// unit-test with jsdom fixtures.
//
// Instagram gives us no testids, so unlike the Twitter version these match on
// the visible *label* text of a LEAF element (one with no child elements).
// Requiring a leaf avoids false positives where the word "Sponsored" or
// "Suggested for you" appears inside a caption or a quoted post body — those
// live in elements that also contain other markup, not bare labels.

import { SELECTORS } from "../selectors";

// The tags Instagram uses for these small chrome labels. Scoping the scan to
// these (rather than every descendant) keeps the per-post cost bounded.
const LABEL_TAGS = "span, a, div, time";

function hasLeafLabel(root: Element, pattern: RegExp): boolean {
  for (const el of root.querySelectorAll(LABEL_TAGS)) {
    if (el.childElementCount > 0) continue; // not a leaf — skip containers
    const text = (el.textContent ?? "").trim();
    if (pattern.test(text)) return true;
  }
  return false;
}

export function isSponsoredPost(post: Element): boolean {
  return hasLeafLabel(post, SELECTORS.sponsored.labelText);
}

export function isSuggestedPost(post: Element): boolean {
  return hasLeafLabel(post, SELECTORS.suggested.labelText);
}
