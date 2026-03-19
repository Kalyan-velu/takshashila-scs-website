<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";

const menu = ref(false);
const headerDirection = ref("up");
const headerPosition = ref(0);
const headerSmall = ref(false);
const hideHeader = ref(false);
const darkMode = ref(false);

const lastScrollTop = ref(0);

const handleScroll = () => {
  const st = window.pageYOffset || document.documentElement.scrollTop;
  headerPosition.value = st;

  if (st > lastScrollTop.value && st > 400) {
    headerDirection.value = "down";
  } else {
    headerDirection.value = "up";
  }

  headerSmall.value = st > 50;
  lastScrollTop.value = st <= 0 ? 0 : st;
};

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value;
  localStorage.setItem("darkMode", darkMode.value);
  if (darkMode.value) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

const toggleMobileMenu = () => {
  menu.value = menu.value === "mobileMenu" ? false : "mobileMenu";
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  darkMode.value = localStorage.getItem("darkMode") === "true";
  if (darkMode.value) {
    document.documentElement.classList.add("dark");
  }

  // Handle initial scroll position
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

// Helper for mega menus
const openMenu = (val) => {
  menu.value = val;
};

const closeMenu = () => {
  menu.value = false;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};
</script>

<template>
  <div
    class="nline-flex justify-center z-20 js-header-container w-full sticky top-0"
  >
    <div
      class="w-full transition-transform transform duration-1000 translate-y-0"
      :class="{
        '-translate-y-16 lg:-translate-y-28':
          (headerDirection === 'down' && headerPosition > 400) || hideHeader,
        'translate-y-0': headerDirection === 'up' || headerPosition < 400,
      }"
    >
      <header
        class="flex flex-wrap items-center justify-between relative z-30 pl-2 rounded-3xl transition-borderRadius lg:rounded-full js-header mx-auto bg-background/80 backdrop-blur-md"
        :class="{
          'rounded-3xl': menu !== 'mobileMenu',
          'rounded-2xl': menu === 'mobileMenu',
        }"
      >
        <div
          class="absolute top-0 left-0 w-full h-full lg:hidden"
          @click="scrollToTop"
          :class="{
            'pointer-events-none': menu === 'mobileMenu',
          }"
        ></div>

        <div class="ml-2 relative z-10 lg:ml-4 lg:mr-6">
          <a
            href="/"
            class="transition-none dark:text-white"
            :class="{
              'text-foreground/80': !headerSmall,
              'text-foreground/80': headerSmall || menu === 'mobileMenu',
            }"
          >
            <div class="sr-only">Takshashila Logo link to home page</div>
            <img
              src="/logo-full-black.webp"
              alt="Takshashila Logo"
              class="w-40 h-auto mt-0.5 lg:mt-0 lg:w-48"
            />
          </a>
        </div>

        <nav class="hidden lg:inline-flex">
          <ul class="flex space-x-7 xl:space-x-10">
            <li
              class="relative"
              @mouseenter="openMenu(7)"
              @mouseleave="closeMenu"
            >
              <div
                class="absolute -top-3 -right-4 pointer-events-none rounded-full z-20 bg-primary text-primary-foreground text-xs pt-px px-1.5 leading-tighter tracking-tight"
              >
                13
              </div>
              <a
                href="/courses"
                class="link font-light leading-tight transition-none dark:text-white"
                :class="{
                  'text-foreground/80': !headerSmall,
                  'text-foreground/80': headerSmall,
                }"
              >
                UPSC - APSC
              </a>
              <div
                class="absolute shrink-0 top-10 pt-8 left-2/3 z-100 transition transform duration-300 -translate-x-1/3"
                :class="{
                  'opacity-0 -translate-y-1 pointer-events-none':
                    menu !== 7 && headerSmall,
                  'opacity-100 -translate-y-1 pointer-events-auto':
                    menu === 7 && headerSmall,
                  'opacity-0 pointer-events-none -translate-y-4':
                    menu !== 7 && !headerSmall,
                  'opacity-100 pointer-events-auto -translate-y-4':
                    menu === 7 && !headerSmall,
                }"
              >
                <div
                  class="flex p-8 relative rounded-2xl bg-background shadow-3xl w-176 xl:w-3xl lg:rounded-3xl dark:bg-card border border-border"
                >
                  <div
                    class="w-3 h-3 bg-background absolute -top-1.5 rounded-sm left-1/3 -translate-x-full transform rotate-45 dark:bg-card border-t border-l border-border"
                  ></div>
                  <div class="inline-flex flex-col items-start w-7/12 pr-2">
                    <a
                      href="#"
                      class="flex-1 flex-col items-start justify-center w-full rounded-2xl px-4 py-2.5 group bg-gray-50/0 dark:bg-gray-800/0 xl:hover:bg-muted transition-colors"
                    >
                      <div class="h-full flex justify-center flex-col">
                        <div class="flex justify-between items-center">
                          <div class="text-base font-medium">
                            One Year UPSC Batch
                          </div>
                          <div
                            class="opacity-0 transition transform -translate-x-2 translate-y-2 xl:group-hover:translate-y-0 xl:group-hover:translate-x-0 xl:group-hover:opacity-100"
                          >
                            <svg
                              class="w-3.5 h-3.5 fill-current"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 384 512"
                            >
                              <path
                                d="M328 96h24v288h-48V177.9L81 401l-17 17-33.9-34 17-17 223-223H64V96h264z"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <div class="text-sm font-light text-muted-foreground">
                          Comprehensive guidance for Civil Services Examination
                        </div>
                      </div>
                    </a>
                    <a
                      href="#"
                      class="flex-1 flex-col items-start justify-center w-full rounded-2xl px-4 py-2.5 group bg-gray-50/0 dark:bg-gray-800/0 xl:hover:bg-muted transition-colors"
                    >
                      <div class="h-full flex justify-center flex-col">
                        <div class="flex justify-between items-center">
                          <div class="text-base font-medium">
                            One Year APSC Batch
                          </div>
                          <div
                            class="opacity-0 transition transform -translate-x-2 translate-y-2 xl:group-hover:translate-y-0 xl:group-hover:translate-x-0 xl:group-hover:opacity-100"
                          >
                            <svg
                              class="w-3.5 h-3.5 fill-current"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 384 512"
                            >
                              <path
                                d="M328 96h24v288h-48V177.9L81 401l-17 17-33.9-34 17-17 223-223H64V96h264z"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <div class="text-sm font-light text-muted-foreground">
                          Dedicated courses for Assam Public Service Commission
                        </div>
                      </div>
                    </a>
                    <a
                      href="#"
                      class="flex-1 flex-col items-start justify-center w-full rounded-2xl px-4 py-2.5 group bg-gray-50/0 dark:bg-gray-800/0 xl:hover:bg-muted transition-colors"
                    >
                      <div class="h-full flex justify-center flex-col">
                        <div class="flex justify-between items-center">
                          <div class="text-base font-medium">
                            Current Affairs
                          </div>
                          <div
                            class="opacity-0 transition transform -translate-x-2 translate-y-2 xl:group-hover:translate-y-0 xl:group-hover:translate-x-0 xl:group-hover:opacity-100"
                          >
                            <svg
                              class="w-3.5 h-3.5 fill-current"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 384 512"
                            >
                              <path
                                d="M328 96h24v288h-48V177.9L81 401l-17 17-33.9-34 17-17 223-223H64V96h264z"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <div class="text-sm font-light text-muted-foreground">
                          Daily updates and monthly analysis
                        </div>
                      </div>
                    </a>
                  </div>
                  <div class="w-5/12 pl-3 inline-flex">
                    <a
                      href="/courses"
                      class="w-full inline-flex flex-col items-start justify-between bg-muted rounded-2xl p-5 group dark:bg-muted/50"
                    >
                      <div class="w-full flex flex-wrap">
                        <div
                          class="w-full flex justify-between items-center mb-2"
                        >
                          <div
                            class="text-md leading-tight dark:text-white font-medium"
                          >
                            View all Programs
                          </div>
                          <div
                            class="opacity-0 transition transform -translate-x-2 translate-y-2 xl:group-hover:translate-y-0 xl:group-hover:translate-x-0 xl:group-hover:opacity-100"
                          >
                            <svg
                              class="w-4 h-4 text-foreground/80 fill-current dark:text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 384 512"
                            >
                              <path
                                d="M328 96h24v288h-48V177.9L81 401l-17 17-33.9-34 17-17 223-223H64V96h264z"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <div
                          class="w-full text-sm font-light text-muted-foreground mb-5"
                        >
                          Discover our comprehensive civil services coaching
                          programs in Guwahati.
                        </div>
                      </div>
                      <div class="w-full relative">
                        <div
                          class="relative overflow-hidden w-full rounded-2xl aspect-[4/3]"
                        >
                          <img
                            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop"
                            alt="Courses"
                            class="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </li>

            <li class="relative">
              <a
                href="/work"
                class="link font-light leading-tight transition-none dark:text-white"
                :class="{
                  'text-foreground/80': !headerSmall,
                  'text-foreground/80': headerSmall,
                }"
                @mouseenter="closeMenu"
              >
                Team
              </a>
            </li>

            <li
              class="relative"
              @mouseenter="openMenu(5)"
              @mouseleave="closeMenu"
            >
              <a
                href="/about"
                class="link font-light leading-tight transition-none dark:text-white"
                :class="{
                  'text-foreground/80': !headerSmall,
                  'text-foreground/80': headerSmall,
                }"
              >
                About
              </a>
              <div
                class="absolute shrink-0 top-10 pt-8 left-2/3 z-100 transition transform duration-300 -translate-x-1/3"
                :class="{
                  'opacity-0 -translate-y-1 pointer-events-none':
                    menu !== 5 && headerSmall,
                  'opacity-100 -translate-y-1 pointer-events-auto':
                    menu === 5 && headerSmall,
                  'opacity-0 pointer-events-none -translate-y-4':
                    menu !== 5 && !headerSmall,
                  'opacity-100 pointer-events-auto -translate-y-4':
                    menu === 5 && !headerSmall,
                }"
              >
                <div
                  class="flex p-8 relative rounded-2xl bg-background shadow-3xl w-176 xl:w-3xl lg:rounded-3xl dark:bg-card border border-border"
                >
                  <div
                    class="w-3 h-3 bg-background absolute -top-1.5 rounded-sm left-1/3 -translate-x-full transform rotate-45 dark:bg-card border-t border-l border-border"
                  ></div>
                  <div class="inline-flex flex-col items-start w-7/12 pr-2">
                    <a
                      href="/about"
                      class="flex-1 flex-col items-start justify-center w-full rounded-2xl px-4 py-2.5 group bg-gray-50/0 dark:bg-gray-800/0 xl:hover:bg-muted transition-colors"
                    >
                      <div class="h-full flex justify-center flex-col">
                        <div class="flex justify-between items-center">
                          <div class="text-base font-medium">Our Story</div>
                          <div
                            class="opacity-0 transition transform -translate-x-2 translate-y-2 xl:group-hover:translate-y-0 xl:group-hover:translate-x-0 xl:group-hover:opacity-100"
                          >
                            <svg
                              class="w-3.5 h-3.5 fill-current"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 384 512"
                            >
                              <path
                                d="M328 96h24v288h-48V177.9L81 401l-17 17-33.9-34 17-17 223-223H64V96h264z"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <div class="text-sm font-light text-muted-foreground">
                          The best IAS coaching institute in Guwahati
                        </div>
                      </div>
                    </a>
                    <a
                      href="#"
                      class="flex-1 flex-col items-start justify-center w-full rounded-2xl px-4 py-2.5 group bg-gray-50/0 dark:bg-gray-800/0 xl:hover:bg-muted transition-colors"
                    >
                      <div class="h-full flex justify-center flex-col">
                        <div class="flex justify-between items-center">
                          <div class="text-base font-medium">Why Choose Us</div>
                          <div
                            class="opacity-0 transition transform -translate-x-2 translate-y-2 xl:group-hover:translate-y-0 xl:group-hover:translate-x-0 xl:group-hover:opacity-100"
                          >
                            <svg
                              class="w-3.5 h-3.5 fill-current"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 384 512"
                            >
                              <path
                                d="M328 96h24v288h-48V177.9L81 401l-17 17-33.9-34 17-17 223-223H64V96h264z"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <div class="text-sm font-light text-muted-foreground">
                          What makes Takshashila stand out
                        </div>
                      </div>
                    </a>
                  </div>
                  <div class="w-5/12 pl-3 inline-flex">
                    <a
                      href="#"
                      class="w-full inline-flex flex-col items-start justify-between bg-muted rounded-2xl p-5 group dark:bg-muted/50"
                    >
                      <div class="w-full flex flex-wrap">
                        <div
                          class="w-full flex justify-between items-center mb-2"
                        >
                          <div
                            class="text-md leading-tight dark:text-white font-medium"
                          >
                            Gallery
                          </div>
                          <div
                            class="opacity-0 transition transform -translate-x-2 translate-y-2 xl:group-hover:translate-y-0 xl:group-hover:translate-x-0 xl:group-hover:opacity-100"
                          >
                            <svg
                              class="w-4 h-4 text-foreground/80 fill-current dark:text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 384 512"
                            >
                              <path
                                d="M328 96h24v288h-48V177.9L81 401l-17 17-33.9-34 17-17 223-223H64V96h264z"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <div
                          class="w-full text-sm font-light text-muted-foreground mb-5"
                        >
                          Glimpses of life at Takshashila School.
                        </div>
                      </div>
                      <div class="w-full relative">
                        <div
                          class="relative overflow-hidden w-full rounded-2xl aspect-4/3"
                        >
                          <img
                            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop"
                            alt="Culture"
                            class="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </li>

            <li class="relative">
              <a
                href="/blog"
                class="link font-light leading-tight transition-none dark:text-white"
                :class="{
                  'text-foreground/80': !headerSmall,
                  'text-foreground/80': headerSmall,
                }"
                @mouseenter="closeMenu"
              >
                Current Affairs
              </a>
            </li>

            <li class="relative">
              <a
                href="#contact"
                class="link font-light leading-tight transition-none dark:text-white"
                :class="{
                  'text-foreground/80': !headerSmall,
                  'text-foreground/80': headerSmall,
                }"
                @mouseenter="closeMenu"
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>

        <div class="pr-4 inline-flex items-center relative z-10 lg:space-x-2">
          <button
            @click="toggleDarkMode"
            :class="{
              'text-foreground/80': !headerSmall,
              'text-foreground/80': headerSmall || menu === 'mobileMenu',
            }"
            class="inline-flex w-10 h-12 items-center justify-center transition-none dark:text-white"
          >
            <div class="sr-only">Toggle dark mode</div>
            <div v-if="!darkMode">
              <svg
                class="w-4 h-4 fill-current"
                width="12"
                height="16"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 384 512"
              >
                <path
                  d="M287.6 41.2c-82.8 21.2-144 96.5-144 186 0 106 85.8 192 191.5 192 16.8 0 33.1-2.2 48.6-6.2-40.6 41.4-97.2 67-159.8 67C100.3 480 0 379.7 0 256S100.3 32 224 32c22.1 0 43.5 3.2 63.6 9.2z"
                ></path>
              </svg>
            </div>
            <div v-else>
              <svg
                class="w-4 h-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path
                  d="M280 24V0h-48v112h48V24zm157 84.9l17-17L420 58l-17 17-45.3 45.3-17 17 33.9 33.9 17-17 45.4-45.3zM108.9 75L92 58 58 92l17 17 45.3 45.3 17 17 33.9-33.9-17-17L108.9 75zM24 232H0v48h112v-48H24zm400 0h-24v48h112v-48h-88zM154.2 391.8l17-17-33.9-33.9-17 17L75 403.1 58 420l34 34 17-17 45.3-45.3zm237.6-33.9l-17-17-33.9 33.9 17 17 45.2 45.2 17 17 33.9-34-17-17-45.3-45.3zM280 424v-24h-48v112h48v-88zm-24-56a112 112 0 100-224 112 112 0 100 224z"
                ></path>
              </svg>
            </div>
          </button>

          <div class="inline-flex lg:hidden">
            <button
              class="inline-flex items-center justify-center w-10 h-12"
              @click="toggleMobileMenu"
            >
              <div class="sr-only">Toggle mobile menu</div>
              <div class="flex w-5 h-3.5 flex-col items-start justify-between">
                <div
                  class="w-full h-0.5 transition-transform duration-500 transform"
                  :class="{
                    'rotate-45 translate-y-1.5': menu === 'mobileMenu',
                    'rotate-0': menu !== 'mobileMenu',
                  }"
                >
                  <div
                    class="w-full h-0.5 bg-foreground/80 dark:bg-white"
                  ></div>
                </div>
                <div
                  class="w-full h-0.5 transition-opacity duration-300"
                  :class="{
                    'opacity-0': menu === 'mobileMenu',
                    'opacity-100': menu !== 'mobileMenu',
                  }"
                >
                  <div
                    class="w-full h-0.5 bg-foreground/80 dark:bg-white"
                  ></div>
                </div>
                <div
                  class="w-full h-0.5 transition-transform duration-500 transform"
                  :class="{
                    '-rotate-45 -translate-y-1.5': menu === 'mobileMenu',
                    'rotate-0': menu !== 'mobileMenu',
                  }"
                >
                  <div
                    class="w-full h-0.5 bg-foreground/80 dark:bg-white"
                  ></div>
                </div>
              </div>
            </button>
          </div>

          <div class="hidden lg:inline-flex">
            <a
              href="#"
              class="inline-flex relative group outline-none focus:outline-none text-sm font-medium text-primary-foreground "
            >
              <div
                class="bg-primary w-auto inline-flex items-center justify-center relative leading-tight shadow-none overflow-hidden rounded-full py-2 px-5"
              >
                <div class="relative inline-flex top-px shrink-0">
                  <div>Enroll Now</div>
                </div>
              </div>
              <div
                class="bg-primary shrink-0 overflow-hidden flex items-center justify-center -ml-1 rounded-full transform transition-transform | w-9 h-9 | xl:group-hover:translate-x-3 xl:group-hover:rotate-45"
              >
                <svg
                  class="ml-0.5 size-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 384 512"
                >
                  <path
                    d="M328 96h24v288h-48V177.9L81 401l-17 17-33.9-34 17-17 223-223H64V96h264z"
                  ></path>
                </svg>
              </div>
            </a>
          </div>
        </div>

        <!-- Mobile Menu -->
        <div
          class="w-full relative z-10 pointer-events-none lg:hidden js-mobile-menu transition-all duration-300 overflow-hidden"
          :style="{
            height: menu === 'mobileMenu' ? 'auto' : '0rem',
            opacity: menu === 'mobileMenu' ? '1' : '0',
            paddingBottom: menu === 'mobileMenu' ? '1.5rem' : '0',
          }"
          :class="{
            'pointer-events-auto': menu === 'mobileMenu',
          }"
        >
          <div class="w-full px-2 pt-8">
            <div class="w-full">
              <div class="inline-flex items-center space-x-2 mb-4">
                <div class="bg-primary w-1.5 h-1.5 rounded-full"></div>
                <div
                  class="font-light text-sm text-foreground/60 dark:text-gray-400"
                >
                  Have a look around...
                </div>
              </div>
              <ul class="flex flex-col items-start space-y-4">
                <li class="relative">
                  <div
                    class="absolute -top-3 -right-4 pointer-events-none rounded-full z-20 bg-primary text-primary-foreground text-xs pt-px px-2 leading-tight tracking-tight"
                  >
                    13
                  </div>
                  <a
                    href="/courses"
                    class="link text-4xl tracking-tight leading-none transition-none dark:text-white"
                  >
                    UPSC - APSC
                  </a>
                </li>
                <li class="relative">
                  <a
                    href="/work"
                    class="link text-4xl tracking-tight leading-none transition-none dark:text-white"
                  >
                    Team
                  </a>
                </li>
                <li class="relative">
                  <a
                    href="/about"
                    class="link text-4xl tracking-tight leading-none transition-none dark:text-white"
                  >
                    About
                  </a>
                </li>
                <li class="relative">
                  <a
                    href="/blog"
                    class="link text-4xl tracking-tight leading-none transition-none dark:text-white"
                  >
                    Current Affairs
                  </a>
                </li>
                <li class="relative">
                  <a
                    href="#contact"
                    class="link text-4xl tracking-tight leading-none transition-none dark:text-white"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div class="w-full mt-8">
              <a
                href="#contact"
                class="inline-flex w-full items-center justify-center rounded-full bg-primary py-4 text-lg font-medium text-primary-foreground"
              >
                Join a course
              </a>
            </div>
          </div>
        </div>
      </header>
    </div>
  </div>
</template>

<style scoped>
@reference "../styles/globals.css";
.transition-borderRadius {
  transition-property: border-radius;
  transition-duration: 500ms;
}

.link:hover {
  @apply text-primary;
}

/* Custom shadows for mega menu */
.shadow-3xl {
  box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
}
</style>
