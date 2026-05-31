// Single source of truth for every CSS selector and text-match regex used to
// identify instagram.com DOM elements. Every other module in src/ imports
// from this file — there must be no inline selector or class literal anywhere
// else.
//
// ⚠️ INSTAGRAM IS A HARDER TARGET THAN X. Where x.com exposes stable
// `data-testid` hooks, instagram.com ships hashed, atomic class names
// (`x1i10hfl`, `_ab1k`, …) that change without notice and almost no testids.
// The durable hooks we rely on, in rough order of stability:
//
//   1. Route-based `<a href="…">` links     — Explore/Reels nav, story tray.
//      Instagram's URL scheme is stable; class names are not.
//   2. Semantic `<article>` feed posts       — each feed item is an <article>.
//   3. Visible English text labels           — "Sponsored", "Suggested for you".
//      Localized, but English is the primary target.
//
// EVERY value below is a BEST GUESS that must be confirmed against the live
// DOM. Use debug mode (?igf=debug or the popup toggle) to see what each one
// actually matches, then correct it here. Entries marked `VERIFY` are the
// least certain. When a selector changes, update src/content/styles.css in the
// same commit if it mirrors a structural-hide key.

export const SELECTORS = {
  feed: {
    // The feed lives inside <main>; each post (real, sponsored, or suggested)
    // is an <article>. This is the most stable structural hook Instagram
    // gives us — analogous to x.com's article[data-testid="tweet"].
    main: "main",
    post: "article",
  },

  sponsored: {
    // A sponsored post carries a small "Sponsored" label in its header,
    // where a normal post shows a timestamp / "Follows you". There is no
    // testid; we match the visible label text on a LEAF element (see
    // isSponsoredPost) to avoid catching posts that merely quote the word.
    labelText: /^Sponsored$/i,
  },

  suggested: {
    // Instagram injects "Suggested for you" posts and account carousels into
    // the home feed, and a "Suggested Posts" section once you've caught up on
    // the Following feed. Matched by leaf-element label text inside a post.
    labelText: /^(Suggested for you|Suggested Posts?)$/i,
    // VERIFY: the in-feed section header that precedes injected suggestions.
    sectionHeadingText: /^(Suggested Posts?|Suggested for you)$/i,
  },

  nav: {
    // Left-hand navigation rail entries. Route-based, so these are among the
    // most reliable selectors here. Hidden structurally via styles.css to
    // remove the algorithmic rabbit-holes from the chrome. Remove a key here
    // (and in styles.css) if you'd rather keep that nav item.
    exploreLink: 'a[href="/explore/"]',
    reelsLink: 'a[href="/reels/"]',
  },

  sidebar: {
    // VERIFY: the right-hand column on the desktop home feed — current-user
    // card, "Suggested for you" follow list, footer nags. Instagram gives it
    // no stable id; the durable anchor is the header text, from which we'd
    // walk up to the column container at runtime. Left unhidden until the
    // container mapping is confirmed live (see HANDOFF.md).
    suggestionsHeaderText: /^Suggested for you$/i,
  },

  stories: {
    // VERIFY: the stories tray at the top of the feed. Each avatar is an
    // <a href="/stories/…">; the tray container has no stable hook. Provided
    // for future work — not hidden by default to avoid leaving an empty bar.
    trayLink: 'a[href^="/stories/"]',
  },

  // NOTE: there is no feed-switcher selector. Instagram desktop web exposes no
  // chronological-feed control in its DOM (the "Following / Favourites"
  // switcher is mobile-app only). The chronological feed is pinned via the
  // ?variant=following URL parameter instead — see src/lib/url.ts and
  // src/content/feed-enforcer.ts.
} as const;

export type SelectorKey = keyof typeof SELECTORS;
