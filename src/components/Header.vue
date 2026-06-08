<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import TopBar from "./header/TopBar.vue";
import DesktopNav from "./header/DesktopNav.vue";
import HeaderActions from "./header/HeaderActions.vue";
import MobileMenu from "./header/MobileMenu.vue";

const menu = ref<number | string | boolean>(false);
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
  localStorage.setItem("darkMode", darkMode.value ? "true" : "false");
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

  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

const openMenu = (val: number | string | boolean) => {
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
    class="inline-flex flex-col items-center z-20 js-header-container w-full sticky top-0"
  >
    <div
      class="w-full transition-transform transform duration-1000 translate-y-0"
      :class="{
        '-translate-y-24 lg:-translate-y-32':
          (headerDirection === 'down' && headerPosition > 400) || hideHeader,
        'translate-y-0': headerDirection === 'up' || headerPosition < 400,
      }"
    >
      <TopBar />
      <header
        class="flex flex-nowrap items-center justify-between relative z-30 rounded-3xl transition-borderRadius lg:rounded-none js-header mx-auto bg-background/80 backdrop-blur-md"
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
              'text-foreground/80': headerSmall || menu === 'mobileMenu',
            }"
          >
            <div class="sr-only">Takshashila Logo link to home page</div>
            <img
              :src="darkMode ? '/logo-full-white.png' : '/logo-full-black.png'"
              alt="Takshashila Logo"
              fetchpriority="high"
              width="1920"
              height="1080"
              class="w-40 h-auto mt-0.5 lg:mt-0 lg:w-48"
            />
          </a>
        </div>

        <DesktopNav
          :menu="menu"
          :headerSmall="headerSmall"
          @open-menu="openMenu"
          @close-menu="closeMenu"
        />

        <HeaderActions
          :darkMode="darkMode"
          :headerSmall="headerSmall"
          :menu="menu"
          @toggle-dark-mode="toggleDarkMode"
          @toggle-mobile-menu="toggleMobileMenu"
        />
      </header>
      <header>
        <MobileMenu :menu="menu" @close-menu="closeMenu" />
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
</style>
