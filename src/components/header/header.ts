// 0. HMR / page-transition cleanup — prevents duplicate listeners on re-runs
if (window.__headerCleanup) window.__headerCleanup();

/* ==========================================================================
   Elements
   ========================================================================== */
const headerContainer = document.querySelector(
  ".js-header-container",
) as HTMLElement;
const logoOverlay = document.querySelector(
  ".js-logo-scroll-overlay",
) as HTMLElement;

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

// Search toggle buttons live in HeaderActions or TopBar
const searchToggles = document.querySelectorAll(".js-search-toggle") as NodeListOf<HTMLElement>;
const searchIconsOpen = document.querySelectorAll(
  ".js-search-icon-search",
) as NodeListOf<HTMLElement>;
const searchIconsClose = document.querySelectorAll(
  ".js-search-icon-close",
) as NodeListOf<HTMLElement>;

/* ==========================================================================
   1. Scroll Direction — auto-closes menus on fast downward scroll
   ========================================================================== */
let handleScroll: (() => void) | null = null;

if (headerContainer) {
  let lastScrollY = 0;

  handleScroll = () => {
    const st = window.scrollY;

    if (Math.abs(st - lastScrollY) > 10) {
      const scrollingDown = st > lastScrollY && st > 300;
      if (scrollingDown) {
        document.dispatchEvent(new CustomEvent("header:close-search"));
        document.dispatchEvent(new CustomEvent("header:close-mobile"));
        closeMegaMenus();
      }
      lastScrollY = st <= 0 ? 0 : st;
    }
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
  el.classList.remove(
    "opacity-0",
    "-translate-y-4",
    "pointer-events-none",
    "invisible",
  );
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
    menu.classList.add(
      "opacity-0",
      "-translate-y-4",
      "pointer-events-none",
      "invisible",
    );
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
  searchIconsOpen.forEach((icon) => icon.classList.add("hidden"));
  searchIconsClose.forEach((icon) => {
    icon.classList.remove("hidden");
    icon.classList.add("block");
  });

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
  searchIconsOpen.forEach((icon) => {
    icon.classList.remove("hidden");
    icon.classList.add("block");
  });
  searchIconsClose.forEach((icon) => {
    icon.classList.remove("block");
    icon.classList.add("hidden");
  });

  document.dispatchEvent(new CustomEvent("header:search-close"));
}

searchToggles.forEach((toggle) => {
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    searchOpen ? closeSearch() : openSearch();
  });
});

document.addEventListener("click", (e) => {
  if (!searchOpen) return;
  const target = e.target as HTMLElement | null;
  if (!target) return;

  const insideSearch = searchPanel?.contains(target);
  let insideToggle = false;
  searchToggles.forEach((toggle) => {
    if (toggle.contains(target)) insideToggle = true;
  });

  if (!insideSearch && !insideToggle) {
    closeSearch();
  }
});

searchPanel?.addEventListener("focusout", (e: FocusEvent) => {
  const nextFocused = e.relatedTarget as HTMLElement | null;
  if (!nextFocused) return;
  if (searchPanel?.contains(nextFocused)) return;
  
  let insideToggle = false;
  searchToggles.forEach((toggle) => {
    if (toggle.contains(nextFocused)) insideToggle = true;
  });

  if (!insideToggle) {
    closeSearch();
  }
});

// ESC Key listener to close open menus or search
document.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    if (searchOpen) {
      closeSearch();
      if (searchToggles.length > 0) searchToggles[0].focus();
    } else if (activeMenu) {
      const activeTrigger =
        activeMenu === coursesMenu ? triggerCourses : triggerAbout;
      closeMegaMenus();
      activeTrigger?.focus();
    }
  }
});

document.addEventListener("header:close-search", closeSearch);
