<script setup lang="ts">
import config from '../../data/config.json';
import MegaMenu from './MegaMenu.vue';
import { defineEmits, defineProps } from 'vue';
import {
  aboutFeatured,
  aboutItems,
  coursesFeatured,
  coursesItems,
} from '../../data/navigation';

defineProps<{
  menu: number | string | boolean;
  headerSmall: boolean;
}>();

const emit = defineEmits(['openMenu', 'closeMenu']);
</script>

<template>
  <nav class="hidden lg:inline-flex">
    <ul class="flex space-x-7 xl:space-x-10">
      <li class="relative flex items-center">
        <a
          :href="config.adreFormUrl"
          target="_blank"
          class="inline-flex items-center justify-center px-4 py-1.5 text-sm font-semibold text-primary-foreground bg-primary shadow-lg shadow-primary/30 rounded-full animate-pulse hover:opacity-90 transition-opacity"
          @mouseenter="emit('closeMenu')"
        >
          ADRE Admissions Open
        </a>
      </li>
      <li
        class="relative"
        @mouseenter="emit('openMenu', 7)"
        @mouseleave="emit('closeMenu')"
      >
        <a
          href="/courses"
          class="link font-light leading-tight transition-none dark:text-white"
          :class="{
            'text-foreground/80': headerSmall,
          }"
        >
          Courses
        </a>
        <MegaMenu
          :items="coursesItems"
          :featured="coursesFeatured"
          :menuId="7"
          :currentMenu="menu"
          :headerSmall="headerSmall"
        />
      </li>

      <li class="relative">
        <a
          href="/work"
          class="link font-light leading-tight transition-none dark:text-white"
          :class="{
            'text-foreground/80': headerSmall,
          }"
          @mouseenter="emit('closeMenu')"
        >
          Team
        </a>
      </li>

      <li
        class="relative"
        @mouseenter="emit('openMenu', 5)"
        @mouseleave="emit('closeMenu')"
      >
        <a
          href="/about"
          class="link font-light leading-tight transition-none dark:text-white"
          :class="{
            'text-foreground/80': headerSmall,
          }"
        >
          About
        </a>
        <MegaMenu
          :items="aboutItems"
          :featured="aboutFeatured"
          :menuId="5"
          :currentMenu="menu"
          :headerSmall="headerSmall"
        />
      </li>

      <li class="relative">
        <a
          href="/blog"
          class="link font-light leading-tight transition-none dark:text-white"
          :class="{
            'text-foreground/80': headerSmall,
          }"
          @mouseenter="emit('closeMenu')"
        >
          Current Affairs
        </a>
      </li>

      <li class="relative">
        <a
          href="/#contact"
          class="link font-light leading-tight transition-none dark:text-white"
          :class="{
            'text-foreground/80': headerSmall,
          }"
          @mouseenter="emit('closeMenu')"
        >
          Contact
        </a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
@reference "../../styles/globals.css";
.link:hover {
  @apply text-primary;
}
</style>
