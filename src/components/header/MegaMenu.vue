<script setup lang="ts">
defineProps<{
  items: { title: string; description: string; url: string }[];
  featured: { title: string; description: string; url: string; image: string };
  menuId: number;
  currentMenu: number | string | boolean;
  headerSmall: boolean;
}>();
</script>

<template>
  <div
    class="absolute shrink-0 top-10 pt-8 left-2/3 z-100 transition transform duration-300 -translate-x-1/3"
    :class="{
      'opacity-0 -translate-y-1 pointer-events-none':
        currentMenu !== menuId && headerSmall,
      'opacity-100 -translate-y-1 pointer-events-auto':
        currentMenu === menuId && headerSmall,
      'opacity-0 pointer-events-none -translate-y-4':
        currentMenu !== menuId && !headerSmall,
      'opacity-100 pointer-events-auto -translate-y-4':
        currentMenu === menuId && !headerSmall,
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
          v-for="(item, index) in items"
          :key="index"
          :href="item.url"
          class="flex-1 flex-col items-start justify-center w-full rounded-2xl px-4 py-2.5 group bg-gray-50/0 dark:bg-gray-800/0 xl:hover:bg-muted transition-colors"
        >
          <div class="h-full flex justify-center flex-col">
            <div class="flex justify-between items-center">
              <div class="text-base font-medium">{{ item.title }}</div>
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
              {{ item.description }}
            </div>
          </div>
        </a>
      </div>

      <div class="w-5/12 pl-3 inline-flex">
        <a
          :href="featured.url"
          class="w-full inline-flex flex-col items-start justify-between bg-muted rounded-2xl p-5 group dark:bg-muted/50"
        >
          <div class="w-full flex flex-wrap">
            <div class="w-full flex justify-between items-center mb-2">
              <div class="text-md leading-tight dark:text-white font-medium">
                {{ featured.title }}
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
            <div class="w-full text-sm font-light text-muted-foreground mb-5">
              {{ featured.description }}
            </div>
          </div>
          <div class="w-full relative">
            <div class="relative overflow-hidden w-full rounded-2xl aspect-4/3">
              <img
                :src="featured.image"
                :alt="featured.title"
                loading="eager"
                class="w-full h-full object-cover"
              />
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom shadows for mega menu */
.shadow-3xl {
  box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
}
</style>
