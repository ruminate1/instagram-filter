import { describe, expect, test } from "vitest";
import {
  isHomeRoute,
  HOME_PATHNAME,
  hasFollowingVariant,
  withFollowingVariant,
} from "../src/lib/url";

describe("isHomeRoute", () => {
  test("the home pathname is the site root", () => {
    expect(HOME_PATHNAME).toBe("/");
  });

  test("returns true for https://www.instagram.com/", () => {
    expect(isHomeRoute("https://www.instagram.com/")).toBe(true);
  });

  test("returns true for the www-less host", () => {
    expect(isHomeRoute("https://instagram.com/")).toBe(true);
  });

  test("returns true when the URL has no trailing slash", () => {
    expect(isHomeRoute("https://www.instagram.com")).toBe(true);
  });

  test("returns false for /explore/", () => {
    expect(isHomeRoute("https://www.instagram.com/explore/")).toBe(false);
  });

  test("returns false for /reels/", () => {
    expect(isHomeRoute("https://www.instagram.com/reels/")).toBe(false);
  });

  test("returns false for a profile path", () => {
    expect(isHomeRoute("https://www.instagram.com/zuck/")).toBe(false);
  });

  test("accepts a URL object", () => {
    expect(isHomeRoute(new URL("https://www.instagram.com/"))).toBe(true);
    expect(isHomeRoute(new URL("https://www.instagram.com/explore/"))).toBe(
      false,
    );
  });

  test("accepts a Location-shaped object", () => {
    const homeLike = { pathname: "/" } as Location;
    const notHomeLike = { pathname: "/direct/inbox/" } as Location;
    expect(isHomeRoute(homeLike)).toBe(true);
    expect(isHomeRoute(notHomeLike)).toBe(false);
  });

  test("ignores query strings and hashes", () => {
    expect(isHomeRoute("https://www.instagram.com/?igf=debug")).toBe(true);
    expect(isHomeRoute("https://www.instagram.com/#anchor")).toBe(true);
  });
});

describe("hasFollowingVariant", () => {
  test("true when ?variant=following is present", () => {
    expect(
      hasFollowingVariant("https://www.instagram.com/?variant=following"),
    ).toBe(true);
  });

  test("false on a bare home URL", () => {
    expect(hasFollowingVariant("https://www.instagram.com/")).toBe(false);
  });

  test("false for a different variant value", () => {
    expect(
      hasFollowingVariant("https://www.instagram.com/?variant=home"),
    ).toBe(false);
  });

  test("found alongside other params", () => {
    expect(
      hasFollowingVariant(
        "https://www.instagram.com/?igf=debug&variant=following",
      ),
    ).toBe(true);
  });

  test("accepts a Location-shaped object", () => {
    expect(hasFollowingVariant({ search: "?variant=following" } as Location)).toBe(
      true,
    );
    expect(hasFollowingVariant({ search: "" } as Location)).toBe(false);
  });
});

describe("withFollowingVariant", () => {
  test("adds the param to a bare home URL", () => {
    expect(withFollowingVariant("https://www.instagram.com/")).toBe(
      "https://www.instagram.com/?variant=following",
    );
  });

  test("preserves other params (e.g. igf=debug)", () => {
    expect(
      withFollowingVariant("https://www.instagram.com/?igf=debug"),
    ).toBe("https://www.instagram.com/?igf=debug&variant=following");
  });

  test("is idempotent when the param already exists", () => {
    const once = withFollowingVariant("https://www.instagram.com/");
    expect(withFollowingVariant(once)).toBe(once);
  });

  test("result satisfies hasFollowingVariant", () => {
    expect(
      hasFollowingVariant(withFollowingVariant("https://www.instagram.com/")),
    ).toBe(true);
  });
});
