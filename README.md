# Instagram Filter

A Firefox WebExtension that aggressively de-junks instagram.com — hides sponsored posts and "Suggested for you" injections, strips the Explore/Reels rabbit-holes from the nav, and makes a best effort to keep you on the chronological "Following" feed.

Sibling project to [twitter-filter](https://github.com/ruminate1/twitter-filter); same architecture, retargeted at Instagram.

Personal-use tool. Not on addons.mozilla.org; distributed as a Mozilla-signed XPI you install directly.

What it does, verified working on instagram.com:

- Hides **sponsored** posts and **"Suggested for you"** injections from the feed.
- Removes the **Explore** and **Reels** entries from the nav.
- Pins the chronological **Following** feed (via the `?variant=following` URL parameter — Instagram desktop web has no feed-switcher in its UI), re-applied on load and on the Home button.

Two inherent limits: the Following feed only goes back ~1 week (an Instagram-side cap), and clicking Home does a full reload. Instagram changes its DOM often and exposes few stable hooks, so expect occasional selector breakage — fixes are a one-file change to `src/selectors.ts`.

## Install (Firefox)

1. Open the latest signed `.xpi` from the **[Releases page](https://github.com/ruminate1/instagram-filter/releases/latest)** — direct link to v0.1.0: <https://github.com/ruminate1/instagram-filter/releases/download/v0.1.0/instagram-filter-0.1.0.xpi>.
2. Firefox prompts to add the extension and grant access to instagram.com — click **Add**.
3. Reload any open instagram.com tabs.

Auto-update is configured via [`updates.json`](https://ruminate1.github.io/instagram-filter/updates.json); Firefox checks periodically, or force a check via `about:addons` → gear icon → **Check for Updates**.

## Develop

Requires Node 22+ (developed on Node 24 LTS) and Git.

```sh
npm install
npm run dev             # vite build --watch
npm run start:firefox   # launches Firefox with dist/ loaded as a temporary add-on
```

`npm run build` produces the production `dist/`. `npm test` runs the vitest suite.

## Verifying / fixing selectors

Instagram changes its DOM frequently and gives us few durable hooks. When filtering misbehaves:

1. Open `https://www.instagram.com/?igf=debug` to enable debug mode for that tab (a counter badge appears bottom-right).
2. Open DevTools → Console; look for `[igf]` log lines, or their absence.
3. In debug mode, anything the filter *would* hide is shown outlined in red instead — so you can see false negatives (junk with no outline) and false positives (real content outlined).
4. Inspect the element that should have been hidden and update the matching key in `src/selectors.ts` (and `src/content/styles.css` if it's a structural-hide key).

Selector fixes are a one-file change to `src/selectors.ts` by design.
