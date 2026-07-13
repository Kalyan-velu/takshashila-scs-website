import { gsap, GSDevTools } from "@/lib/gsap.ts";

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
const ticker = document.querySelector(".js-ticker-wrapper") as HTMLElement;
const topBar = document.querySelector(".js-top-bar-wrapper") as HTMLElement;
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

// Search toggle button lives in HeaderActions — coordinated here because it
// spans both HeaderActions (icon) and SearchDropdown (panel).
const searchToggle = document.querySelector(".js-search-toggle") as HTMLElement;
const searchIconOpen = document.querySelector(
  ".js-search-icon-search",
) as HTMLElement;
const searchIconClose = document.querySelector(
  ".js-search-icon-close",
) as HTMLElement;

/* ==========================================================================
   1. GSAP Scroll Animations  (Header.astro — spans Ticker, TopBar, Nav, Logo)
   ========================================================================== */
let headerTimeline: gsap.core.Timeline | null = null;
let handleScroll: (() => void) | null = null;

if (headerContainer && ticker && topBar && header && logos.length > 0) {
  const isHome = headerContainer.dataset.isHome === "true";

  if (isHome) {
    headerTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "top+=10 top",
        end: "top+=60 top",
        scrub: 0.3,
      },
    });

    headerTimeline
      .to(ticker, { height: 0, opacity: 0, ease: "power1.inOut" }, 0)
      .to(topBar, { height: 0, opacity: 0, ease: "power1.inOut" }, 0)
      .to(
        header,
        {
          paddingBlock: window.innerWidth < 768 ? "0.5rem" : "0.75rem",
          ease: "power1.inOut",
        },
        0,
      );

    logos.forEach((logo) =>
      headerTimeline?.to(
        logo,
        {
          width: window.innerWidth < 768 ? "9rem" : "12rem",
          ease: "power1.inOut",
        },
        0,
      ),
    );
  }

  let lastScrollY = 0;
  let isHidden = false;

  handleScroll = () => {
    const st = window.scrollY;
    const scrollingDown = st > lastScrollY && st > 300;

    if (isHome) {
      // Force timeline to 0 and remove is-scrolled when at the very top (safety check)
      if (st <= 0) {
        if (headerContainer.classList.contains("is-scrolled")) {
          headerContainer.classList.remove("is-scrolled");
        }
        if (headerTimeline) {
          headerTimeline.progress(0);
        }
      } else {
        // Background toggle logic for transparent header ONLY on home
        if (st > 20 && !headerContainer.classList.contains("is-scrolled")) {
          headerContainer.classList.add("is-scrolled");
        } else if (st <= 20 && headerContainer.classList.contains("is-scrolled")) {
          headerContainer.classList.remove("is-scrolled");
        }
      }

      if (scrollingDown && !isHidden) {
        // Only hide once — don't re-trigger while already hidden
        isHidden = true;
        gsap.to(headerContainer, {
          yPercent: -100,
          duration: 0.35,
          ease: "power2.out",
        });
        document.dispatchEvent(new CustomEvent("header:close-search"));
        document.dispatchEvent(new CustomEvent("header:close-mobile"));
        closeMegaMenus();
      } else if (!scrollingDown && isHidden) {
        // Only show once — don't re-trigger while already visible
        isHidden = false;
        gsap.to(headerContainer, {
          yPercent: 0,
          duration: 0.35,
          ease: "power2.out",
        });
      }
    } else {
      // For non-home, just close menus on scroll down if needed, but no hiding
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
  logoOverlay.addEventListener("click", onLogoClick);

  // Cleanup: kill GSAP, remove window-level listeners only
  window.__headerCleanup = () => {
    handleScroll && window.removeEventListener("scroll", handleScroll);
    logoOverlay?.removeEventListener("click", onLogoClick);
    headerTimeline?.scrollTrigger?.kill();
    headerTimeline?.kill();
  };
}

/* ==========================================================================
   2. Mega Menu — DesktopNav / MegaMenu components
   ========================================================================== */
let activeMenu: HTMLElement | null = null;

function openMenu(el: HTMLElement) {
  closeMegaMenus();
  el.classList.remove("opacity-0", "-translate-y-4", "pointer-events-none");
  el.classList.add("opacity-100", "translate-y-0", "pointer-events-auto");
  activeMenu = el;
  if (el === coursesMenu)
    chevronCourses?.classList.add("rotate-180", "text-primary-500");
  if (el === aboutMenu)
    chevronAbout?.classList.add("rotate-180", "text-primary-500");
}

function closeMegaMenus() {
  [coursesMenu, aboutMenu].forEach((menu) => {
    if (!menu) return;
    menu.classList.remove(
      "opacity-100",
      "translate-y-0",
      "pointer-events-auto",
    );
    menu.classList.add("opacity-0", "-translate-y-4", "pointer-events-none");
  });
  chevronCourses?.classList.remove("rotate-180", "text-primary-500");
  chevronAbout?.classList.remove("rotate-180", "text-primary-500");
  activeMenu = null;
}

// Hover open
triggerCourses?.addEventListener(
  "mouseenter",
  () => coursesMenu && openMenu(coursesMenu),
);
triggerAbout?.addEventListener(
  "mouseenter",
  () => aboutMenu && openMenu(aboutMenu),
);

// Close on mouseleave of the full header container
headerContainer?.addEventListener("mouseleave", closeMegaMenus);

// Close when hovering a direct (non-dropdown) link
triggerDirects.forEach((link) =>
  link.addEventListener("mouseenter", closeMegaMenus),
);

// Close when a link inside a mega menu is clicked
document
  .querySelectorAll(".js-mega-link")
  .forEach((link) => link.addEventListener("click", closeMegaMenus));

// Respond to close requests from other components
document.addEventListener("header:close-megamenus", closeMegaMenus);

/* ==========================================================================
   3. Search Toggle — coordinates HeaderActions icon + SearchDropdown panel
      (Filtering logic lives in SearchDropdown.astro's own <script>)
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

  document.dispatchEvent(new CustomEvent("header:search-open")); // → SearchDropdown focuses input
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

  document.dispatchEvent(new CustomEvent("header:search-close")); // → SearchDropdown resets input
}

searchToggle?.addEventListener("click", () =>
  searchOpen ? closeSearch() : openSearch(),
);

// Other components can ask search to close
document.addEventListener("header:close-search", closeSearch);
if (import.meta.env.DEV) {
  GSDevTools.create({ minimal: false });
}
