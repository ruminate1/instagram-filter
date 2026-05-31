// Route + feed-variant helpers — pure functions on URL inputs. Easy to
// unit-test, and the single source of truth for how we pin the chronological
// feed.

// Instagram's home feed is the site root, unlike x.com's /home.
export const HOME_PATHNAME = "/";

// Instagram desktop web exposes NO chronological-feed toggle in its UI (the
// "Following / Favourites" switcher is mobile-app only). It does, however,
// honor a URL parameter: https://www.instagram.com/?variant=following loads
// the Following feed in chronological order. It doesn't persist on its own —
// which is exactly what feed-enforcer.ts re-applies on every home navigation.
export const FOLLOWING_VARIANT_PARAM = "variant";
export const FOLLOWING_VARIANT_VALUE = "following";

function searchOf(url: string | URL | Location): string {
  if (typeof url === "string") return new URL(url).search;
  return url.search;
}

export function isHomeRoute(url: string | URL | Location): boolean {
  const pathname =
    typeof url === "string" ? new URL(url).pathname : url.pathname;
  return pathname === HOME_PATHNAME;
}

export function hasFollowingVariant(url: string | URL | Location): boolean {
  return (
    new URLSearchParams(searchOf(url)).get(FOLLOWING_VARIANT_PARAM) ===
    FOLLOWING_VARIANT_VALUE
  );
}

// Return `href` with ?variant=following set, preserving any other params
// (e.g. ?igf=debug). Used by the enforcer to redirect the home feed.
export function withFollowingVariant(href: string): string {
  const url = new URL(href);
  url.searchParams.set(FOLLOWING_VARIANT_PARAM, FOLLOWING_VARIANT_VALUE);
  return url.href;
}
