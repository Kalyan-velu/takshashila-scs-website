<script setup lang="ts">
import { computed, ref } from "vue";
import type { Course } from "@/content.config.ts";
import { toINR } from "@/lib/utils.ts";

interface EnrichedCourse extends Course {
  parentPrice?: string;
  parentPricePeriod?: string;
  parentBadge?: string;
}

const props = defineProps<{
  courses: EnrichedCourse[];
  categories: string[];
}>();

// State management
const searchQuery = ref("");
const selectedCategory = ref("ALL");
const selectedMode = ref("all"); // 'all' | 'online' | 'offline'
const sortBy = ref("recommended"); // 'recommended' | 'price-asc' | 'price-desc' | 'duration-asc' | 'alphabetical'
const viewMode = ref("grid"); // 'grid' | 'list'

// Helper to calculate lowest price for sorting
const getLowestPrice = (course: EnrichedCourse): number => {
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
  // If no prices list, try to parse parentPrice (e.g. "₹1999" -> 1999)
  if (course.parentPrice) {
    const num = parseInt(course.parentPrice.replace(/[^\d]/g, ""), 10);
    if (!isNaN(num)) return num;
  }
  return 0; // Fallback
};

// Helper to calculate duration in months for sorting
const getDurationMonths = (course: EnrichedCourse): number => {
  const match = course.duration.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

// Filtering and sorting logic
const filteredAndSortedCourses = computed(() => {
  // 1. Filter
  let result = props.courses.filter((course) => {
    // Category filter
    const matchesCategory =
      selectedCategory.value.toLowerCase() === "all" ||
      course.categories
        .map((cat) => cat.toLowerCase().split(" ")?.[0])
        .includes(selectedCategory.value.toLowerCase());

    // Search query filter
    const matchesSearch =
      !searchQuery.value ||
      course.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      course.description
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase()) ||
      (course.highlights &&
        course.highlights.some((h) =>
          h.toLowerCase().includes(searchQuery.value.toLowerCase()),
        ));

    // Learning Mode filter
    const matchesMode =
      selectedMode.value === "all" ||
      course.modes.includes(selectedMode.value as "online" | "offline");

    return matchesCategory && matchesSearch && matchesMode;
  });

  // 2. Sort
  const sorted = [...result];
  if (sortBy.value === "recommended") {
    // Popular courses first, then keep relative order
    sorted.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
  } else if (sortBy.value === "price-asc") {
    sorted.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
  } else if (sortBy.value === "price-desc") {
    sorted.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
  } else if (sortBy.value === "duration-asc") {
    sorted.sort((a, b) => getDurationMonths(a) - getDurationMonths(b));
  } else if (sortBy.value === "alphabetical") {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  }

  return sorted;
});

const clearSearch = () => {
  searchQuery.value = "";
};

const resetFilters = () => {
  searchQuery.value = "";
  selectedCategory.value = "ALL";
  selectedMode.value = "all";
  sortBy.value = "recommended";
};
</script>

<template>
  <div class="w-full">
    <!-- Category Tabs -->
    <div class="flex flex-wrap items-center justify-center gap-2.5 mb-10">
      <button
        v-for="cat in categories"
        :key="cat"
        @click="selectedCategory = cat"
        class="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer"
        :class="
          selectedCategory === cat
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 transform scale-105'
            : 'bg-muted/50 text-foreground/70 hover:bg-muted hover:text-foreground border border-border/50'
        "
      >
        {{ cat }}
      </button>
    </div>

    <!-- Filter & Controls Dashboard -->
    <div
      class="bg-card/45 backdrop-blur-md border border-border/50 rounded-3xl p-5 md:p-6 mb-10 shadow-xl shadow-primary/5"
    >
      <div
        class="flex flex-col lg:flex-row lg:items-center justify-between gap-5"
      >
        <!-- Search input -->
        <div class="relative w-full lg:max-w-md">
          <div
            class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
          >
            <svg
              class="w-4 h-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search courses..."
            class="w-full pl-10 pr-10 py-3 border border-border rounded-2xl bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm transition-all"
          />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <!-- Filters controls -->
        <div class="flex flex-wrap items-center gap-4">
          <!-- Mode filter -->
          <div
            class="flex items-center bg-muted/50 p-1 border border-border/40 rounded-xl"
          >
            <button
              @click="selectedMode = 'all'"
              class="px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer"
              :class="
                selectedMode === 'all'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              "
            >
              All Modes
            </button>
            <button
              @click="selectedMode = 'online'"
              class="px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer"
              :class="
                selectedMode === 'online'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              "
            >
              Online
            </button>
            <button
              @click="selectedMode = 'offline'"
              class="px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer"
              :class="
                selectedMode === 'offline'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              "
            >
              Offline
            </button>
          </div>

          <!-- Sort Select -->
          <div class="relative min-w-[160px]">
            <select
              v-model="sortBy"
              class="w-full pl-3 pr-9 py-2.5 border border-border rounded-xl bg-background/50 text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer"
            >
              <option value="recommended">Sort: Popularity</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="duration-asc">Duration: Shortest</option>
              <option value="alphabetical">Name: A to Z</option>
            </select>
            <div
              class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-muted-foreground"
            >
              <svg
                class="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>

          <!-- Grid/List Switcher -->
          <div
            class="flex items-center bg-muted/50 p-1 border border-border/40 rounded-xl"
          >
            <button
              @click="viewMode = 'grid'"
              aria-label="Grid view"
              class="p-1.5 rounded-lg transition-all cursor-pointer"
              :class="
                viewMode === 'grid'
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              "
            >
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button
              @click="viewMode = 'list'"
              aria-label="List view"
              class="p-1.5 rounded-lg transition-all cursor-pointer"
              :class="
                viewMode === 'list'
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              "
            >
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Filter Summary -->
    <div
      v-if="searchQuery || selectedCategory !== 'ALL' || selectedMode !== 'all'"
      class="flex flex-wrap items-center gap-2 mb-6 text-sm"
    >
      <span
        class="text-muted-foreground text-xs uppercase tracking-wider font-semibold"
        >Active filters:</span
      >
      <span
        v-if="selectedCategory !== 'ALL'"
        class="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20 font-medium"
      >
        Category: {{ selectedCategory }}
        <button
          @click="selectedCategory = 'ALL'"
          class="hover:text-foreground cursor-pointer"
        >
          <svg
            class="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </span>
      <span
        v-if="searchQuery"
        class="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20 font-medium"
      >
        Search: "{{ searchQuery }}"
        <button
          @click="clearSearch"
          class="hover:text-foreground cursor-pointer"
        >
          <svg
            class="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </span>
      <span
        v-if="selectedMode !== 'all'"
        class="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20 font-medium"
      >
        Mode: {{ selectedMode === "online" ? "Online Only" : "Offline Only" }}
        <button
          @click="selectedMode = 'all'"
          class="hover:text-foreground cursor-pointer"
        >
          <svg
            class="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </span>
      <button
        @click="resetFilters"
        class="text-xs text-muted-foreground hover:text-primary transition-colors ml-1 font-medium cursor-pointer"
      >
        Clear All
      </button>
    </div>

    <!-- Courses Grid/List Views -->
    <div v-if="filteredAndSortedCourses.length > 0">
      <!-- Grid View Layout -->
      <div
        v-if="viewMode === 'grid'"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
      >
        <a
          v-for="course in filteredAndSortedCourses"
          :key="course.id"
          :href="course.url"
          class="group flex flex-col bg-card/40 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
        >
          <!-- Card Image Section -->
          <div class="relative w-full aspect-video overflow-hidden">
            <img
              :src="course.image"
              :alt="course.title"
              class="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-700 ease-in-out"
              loading="lazy"
            />
            <div
              class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300"
            ></div>

            <!-- Popular / Special Tag -->
            <div class="absolute top-4 left-4 flex flex-col gap-1.5">
              <span
                v-if="course.popular"
                class="px-3 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-md border border-amber-400/20"
              >
                Popular
              </span>
              <span
                v-if="course.parentBadge"
                class="px-3 py-1 bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wider rounded-lg shadow-md"
              >
                {{ course.parentBadge }}
              </span>
            </div>

            <!-- Bottom Left overlay on Image -->
            <div
              class="absolute bottom-4 left-4 right-4 flex justify-between items-end"
            >
              <div class="flex flex-col">
                <span
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

          <!-- Card Body Section -->
          <div class="p-6 flex flex-col flex-1 bg-background/50">
            <p
              class="text-muted-foreground text-sm font-light mb-5 line-clamp-2"
            >
              {{ course.description }}
            </p>

            <!-- Highlights checklist -->
            <ul class="space-y-2 mb-6 text-sm grow">
              <li
                v-for="highlight in course.highlights?.slice(0, 3)"
                :key="highlight"
                class="flex items-start gap-2.5 text-xs text-muted-foreground"
              >
                <div
                  class="rounded-full bg-primary/10 text-primary p-0.5 mt-0.5 shrink-0"
                >
                  <svg
                    class="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.5"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <span class="line-clamp-2 text-foreground/80 leading-normal">{{
                  highlight
                }}</span>
              </li>
            </ul>

            <!-- Mode & Price Footer -->
            <div
              class="pt-4 border-t border-border/50 flex items-center justify-between mt-auto"
            >
              <!-- Pricing info -->
              <div class="flex flex-col gap-1 grow">
                <template v-if="course.prices">
                  <!-- Active Mode Pricing -->
                  <div
                    v-if="selectedMode === 'online' && course.prices.online"
                    class="flex flex-col"
                  >
                    <span
                      class="text-xs text-muted-foreground line-through opacity-70"
                      >{{ toINR(course.prices.online.original) }}</span
                    >
                    <span class="text-xl font-bold text-foreground">{{
                      toINR(
                        course.prices.online.original -
                          course.prices.online.discount,
                      )
                    }}</span>
                  </div>
                  <div
                    v-else-if="
                      selectedMode === 'offline' && course.prices.offline
                    "
                    class="flex flex-col"
                  >
                    <span
                      class="text-xs text-muted-foreground line-through opacity-70"
                      >{{ toINR(course.prices.offline.original) }}</span
                    >
                    <span class="text-xl font-bold text-foreground">{{
                      toINR(
                        course.prices.offline.original -
                          course.prices.offline.discount,
                      )
                    }}</span>
                  </div>
                  <div v-else class="flex flex-col gap-0.5">
                    <!-- Standard Starting Price -->
                    <span
                      class="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider"
                      >Starting from</span
                    >
                    <div class="flex items-baseline gap-1.5">
                      <span class="text-xl font-bold text-foreground">
                        {{
                          toINR(
                            Math.min(
                              course.prices.online
                                ? course.prices.online.original -
                                    course.prices.online.discount
                                : Infinity,
                              course.prices.offline
                                ? course.prices.offline.original -
                                    course.prices.offline.discount
                                : Infinity,
                            ),
                          )
                        }}
                      </span>
                    </div>
                  </div>
                </template>
                <template v-else-if="course.parentPrice">
                  <div class="flex flex-col gap-0.5">
                    <span
                      class="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider"
                      >{{ course.parentPricePeriod }}</span
                    >
                    <span class="text-xl font-bold text-foreground">{{
                      course.parentPrice
                    }}</span>
                  </div>
                </template>
                <template v-else>
                  <span class="text-sm font-medium text-muted-foreground"
                    >Contact for Price</span
                  >
                </template>
              </div>

              <!-- CTA Arrow Button -->
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transform group-hover:rotate-45 transition-all duration-300 shrink-0 ml-2"
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

      <!-- List View Layout -->
      <div v-else-if="viewMode === 'list'" class="flex flex-col gap-6 w-full">
        <a
          v-for="course in filteredAndSortedCourses"
          :key="course.id"
          :href="course.url"
          class="group flex flex-col md:flex-row bg-card/40 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-400"
        >
          <!-- Image Section -->
          <div
            class="relative w-full md:w-72 lg:w-80 aspect-video md:aspect-auto overflow-hidden shrink-0"
          >
            <img
              :src="course.image"
              :alt="course.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 via-transparent to-transparent opacity-80"
            ></div>
            <div class="absolute top-4 left-4 flex flex-col gap-1.5">
              <span
                v-if="course.popular"
                class="px-2.5 py-0.5 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider rounded shadow"
              >
                Popular
              </span>
              <span
                v-if="course.parentBadge"
                class="px-2.5 py-0.5 bg-primary text-primary-foreground text-[9px] font-semibold uppercase tracking-wider rounded shadow"
              >
                {{ course.parentBadge }}
              </span>
            </div>
            <span
              class="absolute bottom-4 left-4 px-2 py-0.5 backdrop-blur-md bg-white/20 text-white text-xs rounded border border-white/10"
            >
              {{ course.duration }}
            </span>
          </div>

          <!-- Main Info and Pricing Container -->
          <div
            class="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6 grow"
          >
            <!-- Details Column -->
            <div class="flex flex-col gap-2 max-w-xl">
              <div class="flex items-center flex-wrap gap-2 mb-1">
                <span
                  v-for="mode in course.modes"
                  :key="mode"
                  class="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-semibold rounded uppercase tracking-wider"
                >
                  {{ mode }}
                </span>
              </div>
              <h3
                class="text-xl font-semibold text-foreground group-hover:text-primary transition-colors"
              >
                {{ course.title }}
              </h3>
              <p
                class="text-muted-foreground text-sm font-light leading-relaxed mb-4"
              >
                {{ course.description }}
              </p>

              <!-- Highlights -->
              <div class="flex flex-wrap gap-x-4 gap-y-2 mt-auto">
                <div
                  v-for="highlight in course.highlights?.slice(0, 3)"
                  :key="highlight"
                  class="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <div
                    class="rounded-full bg-primary/10 text-primary p-0.5 shrink-0"
                  >
                    <svg
                      class="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <span class="text-foreground/80">{{ highlight }}</span>
                </div>
              </div>
            </div>

            <!-- Price & Action Column -->
            <div
              class="flex flex-col justify-between items-start md:items-end border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-6 shrink-0 min-w-[200px]"
            >
              <!-- Price display -->
              <div
                class="flex flex-col gap-1 w-full md:text-right mb-4 md:mb-0"
              >
                <template v-if="course.prices">
                  <div
                    v-if="selectedMode === 'online' && course.prices.online"
                    class="flex flex-col"
                  >
                    <span
                      class="text-xs text-muted-foreground line-through opacity-70"
                      >{{ toINR(course.prices.online.original) }}</span
                    >
                    <span class="text-2xl font-bold text-foreground">{{
                      toINR(
                        course.prices.online.original -
                          course.prices.online.discount,
                      )
                    }}</span>
                    <span
                      class="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5"
                      >Online mode</span
                    >
                  </div>
                  <div
                    v-else-if="
                      selectedMode === 'offline' && course.prices.offline
                    "
                    class="flex flex-col"
                  >
                    <span
                      class="text-xs text-muted-foreground line-through opacity-70"
                      >{{ toINR(course.prices.offline.original) }}</span
                    >
                    <span class="text-2xl font-bold text-foreground">{{
                      toINR(
                        course.prices.offline.original -
                          course.prices.offline.discount,
                      )
                    }}</span>
                    <span
                      class="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5"
                      >Offline mode</span
                    >
                  </div>
                  <div v-else class="flex flex-col gap-1 w-full">
                    <!-- Standard Starting Price range -->
                    <span
                      class="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider"
                      >Starting from</span
                    >
                    <span class="text-2xl font-bold text-foreground">
                      {{
                        toINR(
                          Math.min(
                            course.prices.online
                              ? course.prices.online.original -
                                  course.prices.online.discount
                              : Infinity,
                            course.prices.offline
                              ? course.prices.offline.original -
                                  course.prices.offline.discount
                              : Infinity,
                          ),
                        )
                      }}
                    </span>

                    <!-- Breakdowns in tiny text -->
                    <div
                      class="flex flex-col gap-0.5 mt-1.5 text-xs text-muted-foreground"
                    >
                      <span v-if="course.prices.online"
                        >Online:
                        <strong class="text-foreground font-medium">{{
                          toINR(
                            course.prices.online.original -
                              course.prices.online.discount,
                          )
                        }}</strong></span
                      >
                      <span v-if="course.prices.offline"
                        >Offline:
                        <strong class="text-foreground font-medium">{{
                          toINR(
                            course.prices.offline.original -
                              course.prices.offline.discount,
                          )
                        }}</strong></span
                      >
                    </div>
                  </div>
                </template>
                <template v-else-if="course.parentPrice">
                  <div class="flex flex-col">
                    <span class="text-2xl font-bold text-foreground">{{
                      course.parentPrice
                    }}</span>
                    <span
                      class="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mt-0.5"
                      >{{ course.parentPricePeriod }}</span
                    >
                  </div>
                </template>
                <template v-else>
                  <span class="text-sm font-medium text-muted-foreground"
                    >Contact for Price</span
                  >
                </template>
              </div>

              <!-- Button CTA -->
              <div
                class="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-xs hover:opacity-95 shadow-md hover:shadow-lg transition-all"
              >
                View Details
                <svg
                  class="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="py-24 text-center flex flex-col items-center justify-center bg-card/20 backdrop-blur-sm border border-border/50 rounded-3xl p-8"
    >
      <div
        class="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-5"
      >
        <svg
          class="w-8 h-8 opacity-40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      </div>
      <h3 class="text-xl font-medium text-foreground mb-2">
        No courses match your filters
      </h3>
      <p class="text-muted-foreground font-light max-w-sm mb-6 text-sm">
        We couldn't find any courses matching your search query or learning mode
        criteria. Try adjusting your selections.
      </p>
      <button
        @click="resetFilters"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium text-xs rounded-xl hover:opacity-90 transition-all shadow-md cursor-pointer"
      >
        Reset All Filters
      </button>
    </div>
  </div>
</template>

<style scoped>
@reference "../../styles/globals.css";

/* Option styles to fix white background selection text color in dark mode */
option {
  background-color: var(--color-card, #fff);
  color: var(--color-foreground, #000);
}
</style>
