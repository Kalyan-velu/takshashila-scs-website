<script setup lang="ts">
import {defineEmits, defineProps, ref} from 'vue';
import {aboutItems, coursesItems} from '@/data/navigation.ts';

defineProps<{
  menu: number | string | boolean;
}>();

const emit = defineEmits(['closeMenu']);
const openAccordion = ref<string | null>(null);

const toggleAccordion = (item: string) => {
  openAccordion.value = openAccordion.value === item ? null : item;
};
</script>

<template>
  <div
    class="w-full relative z-10 lg:hidden js-mobile-menu transition-all duration-300 overflow-hidden"
    :style="{
      height: menu === 'mobileMenu' ? 'auto' : '0rem',
      opacity: menu === 'mobileMenu' ? '1' : '0',
      paddingBottom: menu === 'mobileMenu' ? '1.5rem' : '0',
    }"
    :class="{
      'pointer-events-auto': menu === 'mobileMenu',
      'pointer-events-none': menu !== 'mobileMenu',
    }"
  >
    <div class="w-full px-2 pt-8">
      <div class="w-full">
        <div class="inline-flex items-center space-x-2 mb-4">
          <div class="bg-primary w-1.5 h-1.5 rounded-full"></div>
          <div class="font-light text-sm text-foreground/60 dark:text-gray-400">
            Have a look around...
          </div>
        </div>
        <ul class="flex flex-col items-start space-y-4 w-full">
          <li class="relative w-full border-b border-border/40 pb-2">
            <button @click="toggleAccordion('courses')" class="w-full flex justify-between items-center text-left link text-4xl tracking-tight leading-none transition-none dark:text-white pb-2">
              <span>UPSC - APSC</span>
              <svg class="w-6 h-6 transform transition-transform" :class="{ 'rotate-180': openAccordion === 'courses' }" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div
              class="overflow-hidden transition-all duration-300"
              :style="{ maxHeight: openAccordion === 'courses' ? '500px' : '0px', opacity: openAccordion === 'courses' ? 1 : 0 }"
            >
              <div class="mt-2 mb-4 flex flex-col space-y-3 pl-4 border-l-2 border-primary/20">
                <a v-for="item in coursesItems" :key="item.url" :href="item.url" @click="emit('closeMenu')" class="text-lg font-light text-foreground/80 dark:text-gray-300 hover:text-primary transition-colors">{{ item.title }}</a>
                <a href="/courses" @click="emit('closeMenu')" class="text-lg font-medium text-primary mt-2">View all Programs &rarr;</a>
              </div>
            </div>
          </li>
          
          <li class="relative w-full border-b border-border/40 pb-4">
            <a href="/team" @click="emit('closeMenu')" class="block w-full link text-4xl tracking-tight leading-none transition-none dark:text-white">Team</a>
          </li>
          
          <li class="relative w-full border-b border-border/40 pb-2">
            <button @click="toggleAccordion('about')" class="w-full flex justify-between items-center text-left link text-4xl tracking-tight leading-none transition-none dark:text-white pb-2">
              <span>About</span>
              <svg class="w-6 h-6 transform transition-transform" :class="{ 'rotate-180': openAccordion === 'about' }" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div
              class="overflow-hidden transition-all duration-300"
              :style="{ maxHeight: openAccordion === 'about' ? '500px' : '0px', opacity: openAccordion === 'about' ? 1 : 0 }"
            >
              <div class="mt-2 mb-4 flex flex-col space-y-3 pl-4 border-l-2 border-primary/20">
                <a v-for="item in aboutItems" :key="item.title" :href="item.url" @click="emit('closeMenu')" class="text-lg font-light text-foreground/80 dark:text-gray-300 hover:text-primary transition-colors">{{ item.title }}</a>
                <a href="/#gallery" @click="emit('closeMenu')" class="text-lg font-medium text-primary mt-2">Gallery &rarr;</a>
              </div>
            </div>
          </li>
          
          <li class="relative w-full border-b border-border/40 pb-4">
            <a target="_blank" href="https://currentaffairs.takshashilascs.com" @click="emit('closeMenu')" class="block w-full link text-4xl tracking-tight leading-none transition-none dark:text-white">Current Affairs</a>
          </li>
          
          <li class="relative w-full border-b border-border/40 pb-4">
            <a href="#contact" @click="emit('closeMenu')" class="block w-full link text-4xl tracking-tight leading-none transition-none dark:text-white">Contact</a>
          </li>
        </ul>
      </div>
      <div class="w-full mt-8 pt-2">
        <div class="flex flex-col space-y-4 mb-6">
          <a href="tel:+916001657575" class="flex items-center gap-3 text-foreground/80 dark:text-gray-300">
            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/></svg>
            </div>
            <span class="text-sm font-light tracking-tight">+91 60016-57575</span>
          </a>
          <a href="mailto:info@takshashilascs.com" class="flex items-center gap-3 text-foreground/80 dark:text-gray-300">
            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg>
            </div>
            <span class="text-sm font-light tracking-tight">info@takshashilascs.com</span>
          </a>
        </div>
        <div class="flex items-center space-x-4 mb-8 px-2">
          <a href="#" class="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-primary transition-colors"><svg class="w-4 h-4 fill-current" viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg"><path d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z"/></svg></a>
          <a href="#" class="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-primary transition-colors"><svg class="w-4 h-4 fill-current" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/></svg></a>
          <a href="#" class="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:text-primary transition-colors"><svg class="w-4 h-4 fill-current" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9s-58-34.5-93.9-36.2c-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.5 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2s34.5-58 36.2-93.9c2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg></a>
        </div>
        <a href="#contact" @click="emit('closeMenu')" class="inline-flex w-full items-center justify-center rounded-full bg-primary py-4 text-lg font-medium text-primary-foreground">
          Join a course
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "../../styles/globals.css";
.link:hover {
  @apply text-primary;
}
</style>
