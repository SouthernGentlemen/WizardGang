interface ClosestTarget {
  closest(selector: string): unknown;
}

export function isAnchorActivationTarget(target: unknown): boolean {
  if (!target || typeof target !== "object") return false;
  const closest = (target as Partial<ClosestTarget>).closest;
  return typeof closest === "function" && Boolean(closest.call(target, "a"));
}

export function setNavigationOpen(
  toggle: HTMLButtonElement | null,
  mobileNav: HTMLElement | null,
  open: boolean
): void {
  if (!toggle || !mobileNav) return;
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
  mobileNav.hidden = !open;
}

export function shouldCloseForEscape(key: string, open: boolean): boolean {
  return key === "Escape" && open;
}

function navigationIsOpen(toggle: HTMLButtonElement): boolean {
  return toggle.getAttribute("aria-expanded") === "true";
}

export function initializeNavigation(
  documentRoot: Document,
  matchMediaFn?: (query: string) => MediaQueryList
): boolean {
  const disclosure = documentRoot.querySelector<HTMLElement>(".nav-disclosure");
  if (!disclosure) return false;

  const toggle = disclosure.querySelector<HTMLButtonElement>(".nav-toggle");
  const mobileNav = disclosure.querySelector<HTMLElement>(".site-nav-mobile");
  if (!toggle || !mobileNav) return false;

  // Static HTML keeps the mobile navigation visible when JavaScript is unavailable.
  // Enhancement reveals the real button and collapses the duplicate mobile links.
  toggle.hidden = false;
  setNavigationOpen(toggle, mobileNav, false);

  toggle.addEventListener("click", () => {
    setNavigationOpen(toggle, mobileNav, !navigationIsOpen(toggle));
  });

  mobileNav.addEventListener("click", (event) => {
    if (isAnchorActivationTarget(event.target)) setNavigationOpen(toggle, mobileNav, false);
  });

  documentRoot.addEventListener("keydown", (event) => {
    if (!shouldCloseForEscape(event.key, navigationIsOpen(toggle))) return;
    setNavigationOpen(toggle, mobileNav, false);
    toggle.focus();
  });

  // The same 48rem boundary where the stylesheet swaps the menu button for
  // inline navigation: crossing it closes the phone menu.
  if (matchMediaFn) {
    const inlineNavigation = matchMediaFn("(min-width: 48rem)");
    inlineNavigation.addEventListener?.("change", (event) => {
      if (event.matches) setNavigationOpen(toggle, mobileNav, false);
    });
  }

  return true;
}
