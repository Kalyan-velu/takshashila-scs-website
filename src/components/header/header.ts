declare global {
  interface Window {
    __headerCleanup?: () => void;
  }
}

// 0. HMR / page-transition cleanup — prevents duplicate listeners on re-runs
if (window.__headerCleanup) window.__headerCleanup();

/* ==========================================================================
   Elements
   ========================================================================== */
const headerContainer = document.querySelector(
  ".js-header-container",
) as HTMLElement;
const header = document.querySelector(".js-header") as HTMLElement;
const logoOverlay = document.querySelector(
  ".js-logo-scroll-overlay",
) as HTMLElement;
const logos = document.querySelectorAll(
  ".js-header-logo",
) as NodeListOf<HTMLElement>;

const coursesMenu = document.querySelector(
  ".js-mega-menu-courses",
) as HTMLElement;
const aboutMenu = document.querySelector(".js-mega-menu-about") as HTMLElement;
const searchPanel = document.querySelector(
  ".js-search-dropdown",
) as HTMLElement;

const triggerCourses = document.querySelector(
  ".js-menu-trigger-courses",
) as HTMLElement;
const triggerAbout = document.querySelector(
  ".js-menu-trigger-about",
) as HTMLElement;
const triggerDirects = document.querySelectorAll(
  ".js-menu-trigger-direct",
) as NodeListOf<HTMLElement>;

const chevronCourses = document.querySelector(
  ".js-chevron-courses",
) as HTMLElement;
const chevronAbout = document.querySelector(".js-chevron-about") as HTMLElement;

// Search toggle button lives in HeaderActions
const searchToggle = document.querySelector(".js-search-toggle") as HTMLElement;
const searchIconOpen = document.querySelector(
  ".js-search-icon-search",
) as HTMLElement;
const searchIconClose = document.querySelector(
  ".js-search-icon-close",
) as HTMLElement;

/* ==========================================================================
   1. Scroll State Management
   ========================================================================== */
let handleScroll: (() => void) | null = null;

if (headerContainer && header && logos.length > 0) {
  const isHome = headerContainer.dataset.isHome === "true";
  let lastScrollY = 0;
  let isHidden = false;

  handleScroll = () => {
    const st = window.scrollY;
    const scrollingDown = st > lastScrollY && st > 300;

    if (isHome) {
      if (st > 20 && !headerContainer.classList.contains("is-scrolled")) {
        headerContainer.classList.add("is-scrolled");
      } else if (st <= 20 && headerContainer.classList.contains("is-scrolled")) {
        headerContainer.classList.remove("is-scrolled");
      }

      if (scrollingDown && !isHidden) {
        isHidden = true;
        headerContainer.classList.add("-translate-y-full");
        document.dispatchEvent(new CustomEvent("header:close-search"));
        document.dispatchEvent(new CustomEvent("header:close-mobile"));
        closeMegaMenus();
      } else if (!scrollingDown && isHidden) {
        isHidden = false;
        headerContainer.classList.remove("-translate-y-full");
      }
    } else {
      if (scrollingDown) {
        document.dispatchEvent(new CustomEvent("header:close-search"));
        document.dispatchEvent(new CustomEvent("header:close-mobile"));
        closeMegaMenus();
      }
    }

    lastScrollY = st <= 0 ? 0 : st;
  };
  window.addEventListener("scroll", handleScroll, { passive: true });

  const onLogoClick = () => window.scrollTo({ top: 0, behavior: "smooth" });
  logoOverlay?.addEventListener("click", onLogoClick);

  window.__headerCleanup = () => {
    handleScroll && window.removeEventListener("scroll", handleScroll);
    logoOverlay?.removeEventListener("click", onLogoClick);
  };
}

/* ==========================================================================
   2. Mega Menu — DesktopNav / MegaMenu components
   ========================================================================== */
let activeMenu: HTMLElement | null = null;

function openMenu(el: HTMLElement) {
  if (activeMenu === el) return;
  closeMegaMenus();
  el.classList.remove("opacity-0", "-translate-y-4", "pointer-events-none", "invisible");
  el.classList.add("opacity-100", "translate-y-0", "pointer-events-auto");
  activeMenu = el;

  if (el === coursesMenu) {
    chevronCourses?.classList.add("rotate-180", "text-primary-500");
    triggerCourses?.setAttribute("aria-expanded", "true");
  }
  if (el === aboutMenu) {
    chevronAbout?.classList.add("rotate-180", "text-primary-500");
    triggerAbout?.setAttribute("aria-expanded", "true");
  }
}

function closeMegaMenus() {
  [coursesMenu, aboutMenu].forEach((menu) => {
    if (!menu) return;
    menu.classList.remove(
      "opacity-100",
      "translate-y-0",
      "pointer-events-auto",
    );
    menu.classList.add("opacity-0", "-translate-y-4", "pointer-events-none", "invisible");
  });
  chevronCourses?.classList.remove("rotate-180", "text-primary-500");
  chevronAbout?.classList.remove("rotate-180", "text-primary-500");
  triggerCourses?.setAttribute("aria-expanded", "false");
  triggerAbout?.setAttribute("aria-expanded", "false");
  activeMenu = null;
}

// Mouse open & close
triggerCourses?.addEventListener(
  "mouseenter",
  () => coursesMenu && openMenu(coursesMenu),
);
triggerAbout?.addEventListener(
  "mouseenter",
  () => aboutMenu && openMenu(aboutMenu),
);

headerContainer?.addEventListener("mouseleave", closeMegaMenus);
triggerDirects.forEach((link) =>
  link.addEventListener("mouseenter", closeMegaMenus),
);

document
  .querySelectorAll(".js-mega-link")
  .forEach((link) => link.addEventListener("click", closeMegaMenus));

document.addEventListener("header:close-megamenus", closeMegaMenus);

// Keyboard Tab & Focus navigation logic
triggerCourses?.addEventListener("focus", () => {
  coursesMenu && openMenu(coursesMenu);
});

triggerAbout?.addEventListener("focus", () => {
  aboutMenu && openMenu(aboutMenu);
});

// Click toggle for buttons
triggerCourses?.addEventListener("click", (e) => {
  e.preventDefault();
  activeMenu === coursesMenu ? closeMegaMenus() : openMenu(coursesMenu);
});

triggerAbout?.addEventListener("click", (e) => {
  e.preventDefault();
  activeMenu === aboutMenu ? closeMegaMenus() : openMenu(aboutMenu);
});

// Focusout listener to close mega menus when tabbing outside the menu container & trigger
[
  { trigger: triggerCourses, menu: coursesMenu },
  { trigger: triggerAbout, menu: aboutMenu },
].forEach(({ trigger, menu }) => {
  const handleFocusOut = (e: FocusEvent) => {
    const nextFocused = e.relatedTarget as HTMLElement | null;
    if (!nextFocused) {
      setTimeout(() => {
        if (!headerContainer?.contains(document.activeElement)) {
          closeMegaMenus();
        }
      }, 50);
      return;
    }
    const insideTrigger = trigger?.contains(nextFocused);
    const insideMenu = menu?.contains(nextFocused);
    if (!insideTrigger && !insideMenu) {
      // If tabbing to the other trigger, openMenu will take care of closing
      if (nextFocused === triggerCourses && menu === aboutMenu) return;
      if (nextFocused === triggerAbout && menu === coursesMenu) return;
      closeMegaMenus();
    }
  };

  trigger?.addEventListener("focusout", handleFocusOut);
  menu?.addEventListener("focusout", handleFocusOut);
});

/* ==========================================================================
   3. Search Toggle — coordinates HeaderActions icon + SearchDropdown panel
   ========================================================================== */
let searchOpen = false;

function openSearch() {
  searchOpen = true;
  closeMegaMenus();
  document.dispatchEvent(new CustomEvent("header:close-mobile"));

  searchPanel?.classList.remove(
    "opacity-0",
    "-translate-y-4",
    "pointer-events-none",
    "invisible",
  );
  searchPanel?.classList.add(
    "opacity-100",
    "translate-y-0",
    "pointer-events-auto",
  );
  searchIconOpen?.classList.add("hidden");
  searchIconClose?.classList.remove("hidden");
  searchIconClose?.classList.add("block");
  searchToggle?.classList.remove(
    "bg-slate-900",
    "dark:bg-white",
    "dark:text-slate-900",
  );
  searchToggle?.classList.add("bg-primary-500");

  document.dispatchEvent(new CustomEvent("header:search-open"));
}

function closeSearch() {
  searchOpen = false;
  searchPanel?.classList.remove(
    "opacity-100",
    "translate-y-0",
    "pointer-events-auto",
  );
  searchPanel?.classList.add(
    "opacity-0",
    "-translate-y-4",
    "pointer-events-none",
    "invisible",
  );
  searchIconOpen?.classList.remove("hidden");
  searchIconOpen?.classList.add("block");
  searchIconClose?.classList.remove("block");
  searchIconClose?.classList.add("hidden");
  searchToggle?.classList.remove("bg-primary-500");
  searchToggle?.classList.add(
    "bg-slate-900",
    "dark:bg-white",
    "dark:text-slate-900",
  );

  document.dispatchEvent(new CustomEvent("header:search-close"));
}

searchToggle?.addEventListener("click", (e) => {
  e.stopPropagation();
  searchOpen ? closeSearch() : openSearch();
});

document.addEventListener("click", (e) => {
  if (!searchOpen) return;
  const target = e.target as HTMLElement | null;
  if (!target) return;

  const insideSearch = searchPanel?.contains(target);
  const insideToggle = searchToggle?.contains(target);

  if (!insideSearch && !insideToggle) {
    closeSearch();
  }
});

searchPanel?.addEventListener("focusout", (e: FocusEvent) => {
  const nextFocused = e.relatedTarget as HTMLElement | null;
  if (
    nextFocused &&
    !searchPanel?.contains(nextFocused) &&
    !searchToggle?.contains(nextFocused)
  ) {
    closeSearch();
  }
});

// ESC Key listener to close open menus or search
document.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    if (searchOpen) {
      closeSearch();
      searchToggle?.focus();
    } else if (activeMenu) {
      const activeTrigger =
        activeMenu === coursesMenu ? triggerCourses : triggerAbout;
      closeMegaMenus();
      activeTrigger?.focus();
    }
  }
});

document.addEventListener("header:close-search", closeSearch);
