<script setup lang="ts">
import config from "@/data/config.json";
import { defineEmits, defineProps } from "vue";

defineProps<{
  darkMode: boolean;
  headerSmall: boolean;
  menu: number | string | boolean;
}>();

const emit = defineEmits(["toggleDarkMode", "toggleMobileMenu"]);
</script>

<template>
  <div class="pr-4 inline-flex items-center relative z-10 lg:space-x-2">
    <a
      :href="config.adreFormUrl"
      target="_blank"
      class="inline-flex lg:hidden items-center justify-center px-3 py-1 md:py-1.5 mr-2 text-[10px] sm:text-xs font-bold text-primary-foreground bg-primary shadow-lg shadow-primary/30 rounded-full animate-pulse"
    >
      ADRE Admissions
    </a>
    <button
      @click="emit('toggleDarkMode')"
      :class="{
        'text-foreground/80': headerSmall || menu === 'mobileMenu',
      }"
      class="inline-flex w-10 h-12 items-center justify-center transition-none dark:text-white"
    >
      <span class="sr-only">Toggle dark mode</span>
      <span v-if="!darkMode">
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
      </span>
      <span v-else>
        <svg
          class="w-4 h-4 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            d="M280 24V0h-48v112h48V24zm157 84.9l17-17L420 58l-17 17-45.3 45.3-17 17 33.9 33.9 17-17 45.4-45.3zM108.9 75L92 58 58 92l17 17 45.3 45.3 17 17 33.9-33.9-17-17L108.9 75zM24 232H0v48h112v-48H24zm400 0h-24v48h112v-48h-88zM154.2 391.8l17-17-33.9-33.9-17 17L75 403.1 58 420l34 34 17-17 45.3-45.3zm237.6-33.9l-17-17-33.9 33.9 17 17 45.2 45.2 17 17 33.9-34-17-17-45.3-45.3zM280 424v-24h-48v112h48v-88zm-24-56a112 112 0 100-224 112 112 0 100 224z"
          ></path>
        </svg>
      </span>
    </button>

    <div class="inline-flex lg:hidden">
      <button
        class="inline-flex items-center justify-center w-10 h-12"
        @click="emit('toggleMobileMenu')"
      >
        <span class="sr-only">Toggle mobile menu</span>
        <span class="flex w-5 h-3.5 flex-col items-start justify-between">
          <span
            class="w-full h-0.5 transition-transform duration-500 transform"
            :class="{
              'rotate-45 translate-y-1.5': menu === 'mobileMenu',
              'rotate-0': menu !== 'mobileMenu',
            }"
          >
            <span
              class="w-full block h-0.5 bg-foreground/80 dark:bg-white"
            ></span>
          </span>
          <span
            class="w-full h-0.5 transition-opacity duration-300"
            :class="{
              'opacity-0': menu === 'mobileMenu',
              'opacity-100': menu !== 'mobileMenu',
            }"
          >
            <span
              class="w-full block h-0.5 bg-foreground/80 dark:bg-white"
            ></span>
          </span>
          <span
            class="w-full h-0.5 transition-transform duration-500 transform"
            :class="{
              '-rotate-45 -translate-y-1.5': menu === 'mobileMenu',
              'rotate-0': menu !== 'mobileMenu',
            }"
          >
            <span
              class="w-full block h-0.5 bg-foreground/80 dark:bg-white"
            ></span>
          </span>
        </span>
      </button>
    </div>

    <div class="hidden lg:inline-flex">
      <a
        href="#"
        class="inline-flex relative group outline-none focus:outline-none text-sm font-medium text-primary-foreground"
      >
        <div
          class="bg-primary w-auto inline-flex items-center justify-center relative leading-tight shadow-none overflow-hidden rounded-full py-2 px-5"
        >
          <div class="relative inline-flex top-px shrink-0">
            <div>Get in touch</div>
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
</template>
<style scoped>
@reference "../../styles/globals.css";
</style>
