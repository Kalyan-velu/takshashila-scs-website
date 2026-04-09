<script setup lang="ts">
import {computed, ref} from "vue";
import type {Course} from "@/content.config.ts";
import {toINR} from "@/lib/utils.ts";

const props = defineProps<{
  courses: Course[];
  categories: (string & {})[];
}>();

const activeTab = ref("ALL");

const filteredCourses = computed(() => {
  if (activeTab.value.toLowerCase() === "all") {
    return props.courses;
  }
  return props.courses.filter((course) =>{
    return course.categories.map((category) => {
      return category.toLowerCase().split(" ")?.[0];
    }).includes(activeTab.value.toLowerCase())},
  );
});
</script>

<template>
  <div class="w-full">
    <div class="flex flex-wrap items-center justify-center gap-2 mb-12">
      <button
        v-for="cat in categories"
        :key="cat"
        @click="activeTab = cat"
        class="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
        :class="
          activeTab === cat
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 transform scale-105'
            : 'bg-muted/50 text-foreground/70 hover:bg-muted hover:text-foreground'
        "
      >
        {{ cat }}
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      <!--      <transition-group name="fade-transform">-->
      <a
        v-for="course in filteredCourses"
        :key="course.id"
        :href="course.url"
        class="group flex flex-col bg-card/40 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
      >
        <div class="relative w-full aspect-video overflow-hidden">
          <img
            :src="course.image"
            :alt="course.title"
            class="w-full h-full aspect-16:9 object-cover transform scale-105 group-hover:scale-110 transition-transform duration-700 ease-in-out"
            loading="lazy"
          />
          <div
            class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300"
          ></div>

          <div
            class="absolute bottom-4 left-4 right-4 flex justify-between items-end"
          >
            <div class="flex flex-col">
              <span
                v-if="course.duration"
                class="px-2.5 py-1 backdrop-blur-md bg-white/20 text-white text-xs rounded-full font-medium mb-2 w-max shadow-sm border border-white/10"
              >
                {{ course.duration }}
              </span>
              <h3
                class="text-white font-semibold text-lg leading-tight line-clamp-2"
              >
                {{ course.title }}
              </h3>
            </div>
          </div>
        </div>

        <div class="p-6 flex flex-col flex-1 bg-background/50">
          <p
            class="text-muted-foreground text-sm font-light mb-4 line-clamp-2 grow"
          >
            {{ course.description }}
          </p>

          <div class="flex flex-wrap gap-1.5 mb-6">
            <!--              <span -->
            <!--                v-for="highlight in course.highlights?.slice(0, 2)" -->
            <!--                :key="highlight"-->
            <!--                class="px-2 py-1 bg-muted/50 text-foreground/70 text-[10px] rounded border border-border/50 uppercase tracking-wider font-medium"-->
            <!--              >-->
            <!--                {{ highlight }}-->
            <!--              </span>-->
            <span
              v-if="(course.highlights?.length ?? 0) > 2"
              class="px-2 py-1 bg-muted/50 text-foreground/70 text-[10px] rounded border border-border/50 uppercase tracking-wider font-medium"
            >
              +{{ (course.highlights?.length ?? 0) - 2 }}
            </span>
          </div>

          <div
            class="flex items-center justify-between mt-auto pt-4 border-t border-border/50"
          >
            <div v-if="course.prices?.offline" class="flex flex-col">
              <span
                v-if="course.prices?.offline"
                class="text-xs text-muted-foreground line-through opacity-70"
                >{{ toINR(course.prices?.offline?.original) }}</span
              >
              <span class="text-xl font-bold text-foreground">{{
                toINR(
                  course.prices?.offline?.original -
                    (course.prices?.offline?.discount ?? 0),
                )
              }}</span>
            </div>
            <div
              class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transform group-hover:rotate-45 transition-all duration-300"
            >
              <svg
                class="w-4 h-4 fill-current"
                viewBox="0 0 384 512"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M328 96h24v288h-48V177.9L81 401l-17 17-33.9-34 17-17 223-223H64V96h264z"
                />
              </svg>
            </div>
          </div>
        </div>
      </a>
    </div>

    <div
      v-if="filteredCourses.length === 0"
      class="py-20 text-center flex flex-col items-center justify-center"
    >
      <div
        class="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4"
      >
        <svg
          class="w-8 h-8 opacity-50 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            d="M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zM448 256c0-41.5-13.1-79.9-35.5-111.2L144.8 412.5C176.1 434.9 214.5 448 256 448c106 0 192-86 192-192zM512 256c0 141.4-114.6 256-256 256S0 397.4 0 256S114.6 0 256 0S512 114.6 512 256zM256 48C141.1 48 48 141.1 48 256c0 114.9 93.1 208 208 208s208-93.1 208-208C464 141.1 370.9 48 256 48z"
          />
        </svg>
      </div>
      <h3 class="text-xl font-medium text-foreground mb-2">No courses found</h3>
      <p class="text-muted-foreground font-light max-w-sm">
        We are currently updating our catalog for this category. Please check
        back later.
      </p>
    </div>
  </div>
</template>

<style scoped>
@reference "../../styles/globals.css";
/* Vue transition group classes */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}
.fade-transform-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.fade-transform-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
  position: absolute;
}
.fade-transform-move {
  transition: transform 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}
</style>
