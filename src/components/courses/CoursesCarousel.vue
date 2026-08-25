<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { toINR } from "@/lib/utils.ts";
import { whatsappUrl } from "@/config/CONSTANTS.ts";

export interface CourseItem {
  title: string;
  description: string;
  image?: string;
  url: string;
  categories: string[];
  modes: ("online" | "offline")[];
  duration?: string;
  popular?: boolean;
  highlights?: string[];
  prices?: {
    online?: { original: number; discount: number };
    offline?: { original: number; discount: number };
  };
  parentPrice?: string;
  parentPricePeriod?: string;
}

const props = defineProps<{
  courses: CourseItem[];
  categories?: string[];
}>();

const selectedCategory = ref("ALL");
const carouselRef = ref<HTMLElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(true);

const displayCategories = computed(() => {
  if (props.categories && props.categories.length > 0) {
    return props.categories;
  }
  return ["ALL", "APSC", "UPSC", "ADRE", "OPTIONALS", "TEST SERIES"];
});

const filteredCourses = computed(() => {
  if (selectedCategory.value === "ALL") return props.courses;
  return props.courses.filter((course) =>
    course.categories
      .map((cat) => cat.toLowerCase().split(" ")?.[0])
      .includes(selectedCategory.value.toLowerCase()),
  );
});

const updateScrollButtons = () => {
  if (!carouselRef.value) return;
  const { scrollLeft, scrollWidth, clientWidth } = carouselRef.value;
  canScrollLeft.value = scrollLeft > 10;
  canScrollRight.value = scrollLeft + clientWidth < scrollWidth - 10;
};

const scroll = (direction: "left" | "right") => {
  if (!carouselRef.value) return;
  const scrollAmount = carouselRef.value.clientWidth * 0.8;
  carouselRef.value.scrollBy({
    left: direction === "left" ? -scrollAmount : scrollAmount,
    behavior: "smooth",
  });
};

const getLowestPrice = (course: CourseItem): number => {
  const pricesList: number[] = [];
  if (course.prices?.online) {
    pricesList.push(
      course.prices.online.original - course.prices.online.discount,
    );
  }
  if (course.prices?.offline) {
    pricesList.push(
      course.prices.offline.original - course.prices.offline.discount,
    );
  }
  if (pricesList.length > 0) {
    return Math.min(...pricesList);
  }
  if (course.parentPrice) {
    const num = parseInt(course.parentPrice.replace(/\D/g, ""), 10);
    if (!isNaN(num)) return num;
  }
  return 0;
};

onMounted(() => {
  const el = carouselRef.value;
  if (el) {
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    updateScrollButtons();
  }
});

onUnmounted(() => {
  const el = carouselRef.value;
  if (el) {
    el.removeEventListener("scroll", updateScrollButtons);
  }
});
</script>

<template>
  <div class="w-full relative">
    <!-- Category Tabs & Controls Bar -->
    <div
      class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8"
    >
      <!-- Category Tabs -->
      <div
        class="flex items-center gap-2 overflow-x-auto hide-scrollbar w-full sm:w-auto pb-1"
      >
        <button
          v-for="cat in displayCategories"
          :key="cat"
          @click="selectedCategory = cat"
          class="px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 shrink-0 cursor-pointer"
          :class="
            selectedCategory === cat
              ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200/60'
          "
        >
          {{ cat }}
        </button>
      </div>

      <!-- Arrow Controls -->
      <div class="hidden sm:flex items-center gap-2.5 shrink-0">
        <button
          @click="scroll('left')"
          :disabled="!canScrollLeft"
          aria-label="Scroll left"
          class="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none shadow-xs cursor-pointer"
        >
          <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path
              d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
            />
          </svg>
        </button>
        <button
          @click="scroll('right')"
          :disabled="!canScrollRight"
          aria-label="Scroll right"
          class="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none shadow-xs cursor-pointer"
        >
          <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path
              d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredCourses.length === 0"
      class="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200"
    >
      <p class="text-gray-500 font-light">
        No courses available in this category right now.
      </p>
    </div>

    <!-- Carousel Container -->
    <div
      v-else
      ref="carouselRef"
      class="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar pb-6 pt-2"
    >
      <div
        v-for="course in filteredCourses"
        :key="course.title"
        class="w-[85vw] sm:w-[350px] md:w-[380px] shrink-0 snap-start flex flex-col"
      >
        <div
          class="group flex flex-col h-full bg-white border border-gray-200 rounded-3xl overflow-hidden hover:shadow-xl hover:border-primary-500/30 hover:-translate-y-1.5 transition-all duration-300"
        >
          <!-- Image Section -->
          <div class="relative w-full aspect-video overflow-hidden bg-gray-100">
            <img
              v-if="course.image"
              :src="course.image"
              :alt="course.title"
              loading="lazy"
              width="600"
              height="340"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"
            ></div>

            <!-- Badge Overlay -->
            <div class="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10">
              <span
                v-if="course.popular"
                class="px-3 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-md"
              >
                Popular
              </span>
              <span
                v-if="course.duration"
                class="px-3 py-1 bg-white/90 backdrop-blur-xs text-gray-900 text-[11px] font-medium rounded-lg shadow-sm"
              >
                {{ course.duration }}
              </span>
            </div>
          </div>

          <!-- Content Section -->
          <div class="p-6 flex flex-col grow justify-between bg-white">
            <div>
              <!-- Mode Badges -->
              <div class="flex items-center gap-1.5 mb-2.5">
                <span
                  v-for="mode in course.modes"
                  :key="mode"
                  class="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-medium uppercase tracking-wide"
                >
                  {{ mode }}
                </span>
              </div>

              <!-- Course Title -->
              <h3
                class="text-lg md:text-xl font-semibold text-gray-900 tracking-tight group-hover:text-primary-500 transition-colors leading-snug mb-2 line-clamp-2"
              >
                {{ course.title }}
              </h3>

              <!-- Course Description -->
              <p
                class="text-gray-600 font-light text-xs md:text-sm leading-relaxed line-clamp-2 mb-4"
              >
                {{ course.description }}
              </p>

              <!-- Course Highlights -->
              <ul
                v-if="course.highlights && course.highlights.length > 0"
                class="space-y-1.5 mb-6 text-xs text-gray-600"
              >
                <li
                  v-for="h in course.highlights.slice(0, 3)"
                  :key="h"
                  class="flex items-start gap-2 line-clamp-1"
                >
                  <span class="text-primary-500 font-bold mt-0.5">✓</span>
                  <span>{{ h }}</span>
                </li>
              </ul>
            </div>

            <!-- Price & Actions Footer -->
            <div class="pt-4 border-t border-gray-100 mt-auto flex flex-col gap-4">
              <div class="flex items-baseline justify-between">
                <div>
                  <span class="text-[10px] text-gray-500 uppercase tracking-wider block font-medium">
                    Course Fee
                  </span>
                  <span class="text-lg md:text-xl font-bold text-gray-900">
                    <template v-if="getLowestPrice(course) > 0">
                      {{ toINR(getLowestPrice(course)) }}
                    </template>
                    <template v-else-if="course.parentPrice">
                      {{ course.parentPrice }}
                    </template>
                    <template v-else>
                      Flexible Plans
                    </template>
                  </span>
                </div>

                <a
                  :href="course.url"
                  class="text-xs font-semibold text-primary-500 hover:text-primary-600 inline-flex items-center gap-1 group/link"
                >
                  <span>View Details</span>
                  <svg
                    class="w-3.5 h-3.5 transform group-hover/link:translate-x-0.5 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>

              <!-- Button Actions -->
              <div class="grid grid-cols-5 gap-2">
                <a
                  :href="course.url"
                  class="col-span-4 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium text-xs md:text-sm transition-all duration-200 shadow-md shadow-primary-500/20"
                >
                  Enroll Now
                </a>
                <a
                  :href="
                    whatsappUrl(
                      `Hi, I am interested in enrolling for the ${course.title} course at Takshashila SCS. Please share details.`,
                    )
                  "
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Inquire via WhatsApp"
                  class="col-span-1 inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200 shadow-md shadow-emerald-600/20"
                >
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 448 512">
                    <path
                      d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.1 0-65.6-8.9-93.9-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.6-30.6-38.1-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.6-9.3 1.9-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
