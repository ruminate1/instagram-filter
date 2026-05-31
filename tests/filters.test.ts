import { describe, expect, test } from "vitest";
import { isSponsoredPost, isSuggestedPost } from "../src/lib/filters";

// Each feed post on instagram.com is an <article>. The filters match the
// visible LEAF label ("Sponsored" / "Suggested for you"), so fixtures put the
// label in a bare element and the caption text in elements that also have
// children, mirroring how the real DOM distinguishes a chrome label from body
// copy that merely quotes the word.
function postFromHTML(html: string): Element {
  const a = document.createElement("article");
  a.innerHTML = html;
  return a;
}

describe("isSponsoredPost", () => {
  test("true when a leaf element's text is exactly 'Sponsored'", () => {
    const post = postFromHTML(`
      <header><a href="/brand/">brand</a><span>Sponsored</span></header>
      <div>Buy our thing</div>
    `);
    expect(isSponsoredPost(post)).toBe(true);
  });

  test("is case-insensitive on the Sponsored label", () => {
    const post = postFromHTML(`<span>SPONSORED</span>`);
    expect(isSponsoredPost(post)).toBe(true);
  });

  test("false on a normal post with no Sponsored label", () => {
    const post = postFromHTML(`
      <header><a href="/alice/">alice</a><time>2h</time></header>
      <div>Just a normal photo</div>
    `);
    expect(isSponsoredPost(post)).toBe(false);
  });

  test("false when 'Sponsored' is only a substring of a caption", () => {
    const post = postFromHTML(`
      <span>Sponsored by my dreams, not by a brand</span>
    `);
    expect(isSponsoredPost(post)).toBe(false);
  });

  test("false when the matching text sits on a non-leaf container", () => {
    // The outer div holds child elements, so it's a container, not the label;
    // the leaf children don't read 'Sponsored'.
    const post = postFromHTML(`
      <div>Sponsored<span>content ahead</span></div>
    `);
    expect(isSponsoredPost(post)).toBe(false);
  });
});

describe("isSuggestedPost", () => {
  test("matches a 'Suggested for you' label", () => {
    const post = postFromHTML(`
      <header><a href="/stranger/">stranger</a><span>Suggested for you</span></header>
    `);
    expect(isSuggestedPost(post)).toBe(true);
  });

  test("matches a 'Suggested Posts' section label", () => {
    const post = postFromHTML(`<div>Suggested Posts</div>`);
    expect(isSuggestedPost(post)).toBe(true);
  });

  test("false on a normal post", () => {
    const post = postFromHTML(`
      <header><a href="/bob/">bob</a><time>5m</time></header>
      <div>A real post from someone I follow</div>
    `);
    expect(isSuggestedPost(post)).toBe(false);
  });

  test("false when the phrase only appears inside caption prose", () => {
    const post = postFromHTML(`
      <span>Here are some suggested for you reads this week</span>
    `);
    expect(isSuggestedPost(post)).toBe(false);
  });

  test("does not flag a sponsored post as suggested", () => {
    const post = postFromHTML(`<span>Sponsored</span>`);
    expect(isSuggestedPost(post)).toBe(false);
  });
});
