// Debug-mode helpers: floating badge with live per-feature counters,
// console logging, and a ?igf=debug query-param trigger that enables
// debug for one tab only (persisted in sessionStorage so SPA navigation
// keeps it on but new tabs get a fresh state).

const SESSION_KEY = "igf:debug";
const QUERY_PARAM = "igf";
const QUERY_VALUE = "debug";

export function isQueryParamDebug(): boolean {
  if (sessionStorage.getItem(SESSION_KEY) === "1") return true;
  const params = new URLSearchParams(location.search);
  if (params.get(QUERY_PARAM) === QUERY_VALUE) {
    sessionStorage.setItem(SESSION_KEY, "1");
    return true;
  }
  return false;
}

export type HideReason = "sponsored" | "suggested";

const counts: Record<HideReason, number> = {
  sponsored: 0,
  suggested: 0,
};

let badge: HTMLDivElement | null = null;
let active = false;

const BADGE_ID = "igf-debug-badge";
const BADGE_STYLE = [
  "position:fixed",
  "bottom:8px",
  "right:8px",
  "z-index:2147483647",
  "background:rgba(0,0,0,0.85)",
  "color:#fafafa",
  "font:11px/1.4 system-ui,-apple-system,Segoe UI,sans-serif",
  "padding:6px 10px",
  "border-radius:6px",
  "pointer-events:none",
].join(";");

function badgeText(): string {
  return `sponsored: ${counts.sponsored} | suggested: ${counts.suggested}`;
}

function ensureBadge(): void {
  if (badge) {
    badge.textContent = badgeText();
    return;
  }
  const el = document.createElement("div");
  el.id = BADGE_ID;
  el.style.cssText = BADGE_STYLE;
  el.textContent = badgeText();
  if (document.body) {
    document.body.appendChild(el);
  } else {
    document.addEventListener(
      "DOMContentLoaded",
      () => document.body.appendChild(el),
      { once: true },
    );
  }
  badge = el;
}

function removeBadge(): void {
  badge?.remove();
  badge = null;
}

export function setDebugActive(now: boolean): void {
  active = now;
  if (active) ensureBadge();
  else removeBadge();
}

export function isDebugActive(): boolean {
  return active;
}

export function bumpCount(reason: HideReason): void {
  counts[reason]++;
  if (active) ensureBadge();
}

export function debugLog(reason: HideReason, el: Element): void {
  if (!active) return;
  console.debug(`[igf] ${reason}`, el);
}
