<script setup lang="ts">
import BlogAdBanner from "@/components/blog/BlogAdBanner.vue";
import BlogLeadForm from "@/components/blog/BlogLeadForm.vue";
import type { BlogPost } from "@/lib/blogger";
import { computed, onMounted, ref, watch } from "vue";

const props = defineProps<{
  posts: BlogPost[];
}>();

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1456324504439-367cee3b3c32";

const searchQuery = ref("");
const selectedCategory = ref<string | null>(null);
const currentPage = ref(1);
const postsPerPage = 8;

// Extract dynamic categories with count from all posts
const categories = computed(() => {
  const categoryMap = new Map<string, number>();

  props.posts.forEach((post) => {
    if (post.keywords && Array.isArray(post.keywords)) {
      post.keywords.forEach((cat) => {
        const trimmed = cat.trim();
        if (trimmed) {
          categoryMap.set(trimmed, (categoryMap.get(trimmed) || 0) + 1);
        }
      });
    }
  });

  return Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
});

// Filter posts based on search input and selected category
const filteredPosts = computed(() => {
  return props.posts.filter((post) => {
    // Category filter
    if (selectedCategory.value) {
      const hasCategory =
        post.keywords &&
        post.keywords.some(
          (k) => k.toLowerCase() === selectedCategory.value?.toLowerCase(),
        );
      if (!hasCategory) return false;
    }

    // Search query filter
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      const inTitle = post.title.toLowerCase().includes(q);
      const inExcerpt = post.excerpt.toLowerCase().includes(q);
      const inKeywords =
        post.keywords && post.keywords.some((k) => k.toLowerCase().includes(q));

      if (!inTitle && !inExcerpt && !inKeywords) return false;
    }

    return true;
  });
});

// Pagination
const totalPages = computed(() =>
  Math.ceil(filteredPosts.value.length / postsPerPage),
);

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage;
  return filteredPosts.value.slice(start, start + postsPerPage);
});

// Reset page when filters change
watch([searchQuery, selectedCategory], () => {
  currentPage.value = 1;
  updateUrlParams();
});

const selectCategory = (category: string | null) => {
  selectedCategory.value =
    selectedCategory.value === category ? null : category;
};

const clearFilters = () => {
  searchQuery.value = "";
  selectedCategory.value = null;
  currentPage.value = 1;
  updateUrlParams();
};

const setPage = (page: number) => {
  currentPage.value = page;
  const feedEl = document.getElementById("blog-feed-top");
  if (feedEl) {
    feedEl.scrollIntoView({ behavior: "smooth" });
  } else {
    window.scrollTo({ top: 300, behavior: "smooth" });
  }
};

// URL Query Param sync
const updateUrlParams = () => {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);

  if (selectedCategory.value) {
    params.set("category", selectedCategory.value);
  } else {
    params.delete("category");
  }

  if (searchQuery.value.trim()) {
    params.set("q", searchQuery.value.trim());
  } else {
    params.delete("q");
  }

  const newUrl =
    window.location.pathname +
    (params.toString() ? `?${params.toString()}` : "");
  window.history.replaceState({}, "", newUrl);
};

onMounted(() => {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    const q = params.get("q");

    if (cat) selectedCategory.value = cat;
    if (q) searchQuery.value = q;
  }
});

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
</script>

<template>
  <div id="blog-feed-top" class="w-full">
    <!-- Mobile Search & Horizontal Category Scroll Bar (Screens < lg) -->
    <div class="block lg:hidden mb-8 space-y-4">
      <!-- Search Input for Mobile -->
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search blogs, UPSC, APSC..."
          class="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-xs transition-all"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
          aria-label="Clear search"
        >
          ✕
        </button>
      </div>

      <!-- Scrollable Category Filter Chips on Mobile -->
      <div
        class="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none no-scrollbar"
      >
        <button
          @click="selectCategory(null)"
          :class="[
            'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap border',
            selectedCategory === null
              ? 'bg-primary-500 text-white border-primary-500 shadow-xs'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50',
          ]"
        >
          All ({{ posts.length }})
        </button>

        <button
          v-for="cat in categories"
          :key="cat.name"
          @click="selectCategory(cat.name)"
          :class="[
            'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap border',
            selectedCategory === cat.name
              ? 'bg-primary-500 text-white border-primary-500 shadow-xs'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50',
          ]"
        >
          {{ cat.name }} ({{ cat.count }})
        </button>
      </div>
    </div>

    <!-- Main Two-Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
      <!-- Left Column: Blog Feed (8 cols) -->
      <main class="lg:col-span-8 w-full min-w-0">
        <!-- Active Filter Indicator Bar -->
        <div
          class="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200"
        >
          <div class="flex items-center gap-2 flex-wrap text-sm text-gray-600">
            <span>
              Showing
              <strong class="text-gray-900 font-semibold">{{
                filteredPosts.length
              }}</strong>
              {{ filteredPosts.length === 1 ? "article" : "articles" }}
            </span>

            <span v-if="selectedCategory || searchQuery" class="text-gray-300"
              >|</span
            >

            <!-- Active Category Tag -->
            <span
              v-if="selectedCategory"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200"
            >
              Category: {{ selectedCategory }}
              <button
                @click="selectedCategory = null"
                class="hover:text-primary-950 cursor-pointer ml-1 font-bold"
                aria-label="Remove category filter"
              >
                ✕
              </button>
            </span>

            <!-- Active Search Tag -->
            <span
              v-if="searchQuery"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200"
            >
              Keyword: "{{ searchQuery }}"
              <button
                @click="searchQuery = ''"
                class="hover:text-primary-950 cursor-pointer ml-1 font-bold"
                aria-label="Remove search query"
              >
                ✕
              </button>
            </span>
          </div>

          <button
            v-if="selectedCategory || searchQuery"
            @click="clearFilters"
            class="text-xs font-medium text-primary-500 hover:text-primary-700 underline underline-offset-2 cursor-pointer transition-colors"
          >
            Reset All Filters
          </button>
        </div>

        <!-- Empty State -->
        <div
          v-if="filteredPosts.length === 0"
          class="text-center py-16 sm:py-20 bg-gray-50 border border-dashed border-gray-200 rounded-3xl px-6 my-4"
        >
          <div
            class="w-14 h-14 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <h3 class="text-xl font-medium text-gray-900 mb-2">
            No articles found
          </h3>
          <p class="text-gray-600 font-light text-sm max-w-sm mx-auto mb-6">
            We couldn't find any articles matching your search criteria. Try a
            different search term or category.
          </p>
          <button
            @click="clearFilters"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors shadow-xs cursor-pointer"
          >
            View All Articles
          </button>
        </div>

        <!-- Blog Posts Grid (Responsive 1-col on mobile, 2-cols on tablet/desktop) -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <article
            v-for="post in paginatedPosts"
            :key="post.id"
            class="group flex flex-col items-start bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full"
          >
            <!-- Thumbnail -->
            <a
              :href="post.link"
              class="w-full aspect-video overflow-hidden bg-gray-100 block relative"
            >
              <img
                :src="post.imageUrl || FALLBACK_IMAGE"
                :alt="post.title"
                width="350"
                height="197"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div
                v-if="post.keywords && post.keywords.length > 0"
                class="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[85%]"
              >
                <span
                  class="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-black/75 backdrop-blur-xs text-white shadow-xs"
                >
                  {{ post.keywords[0] }}
                </span>
              </div>
            </a>

            <!-- Content -->
            <div class="p-5 sm:p-6 flex flex-col grow w-full">
              <div
                class="flex items-center gap-2 mb-2.5 text-xs text-gray-500 font-light"
              >
                <time :datetime="post.publishedAt">
                  {{ formatDate(post.publishedAt) }}
                </time>
                <span>&middot;</span>
                <span>{{ post.readingTimeMinutes }} min read</span>
              </div>

              <h2
                class="text-lg font-medium tracking-tight mb-2.5 text-gray-900 group-hover:text-primary-500 transition-colors line-clamp-2"
              >
                <a :href="post.link">
                  {{ post.title }}
                </a>
              </h2>

              <p
                class="text-gray-600 font-light text-sm line-clamp-3 mb-5 grow"
              >
                {{ post.excerpt }}
              </p>

              <div
                class="mt-auto pt-3 border-t border-gray-100 w-full flex items-center justify-between"
              >
                <a
                  :href="post.link"
                  class="inline-flex items-center text-sm font-medium text-primary-500 group-hover:text-primary-600"
                >
                  Read Article
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="ml-1 w-4 h-4 -translate-x-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>

                <span
                  class="text-xs text-gray-400 font-light truncate max-w-[120px]"
                >
                  {{ post.author.name }}
                </span>
              </div>
            </div>
          </article>
        </div>

        <!-- Pagination -->
        <nav
          v-if="totalPages > 1"
          class="mt-12 flex items-center justify-center gap-2 flex-wrap"
          aria-label="Blog pagination"
        >
          <button
            @click="setPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3.5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Previous
          </button>

          <div class="flex items-center gap-1 flex-wrap">
            <button
              v-for="page in totalPages"
              :key="page"
              @click="setPage(page)"
              :class="[
                'w-9 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                currentPage === page
                  ? 'bg-primary-500 text-white shadow-xs'
                  : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50',
              ]"
            >
              {{ page }}
            </button>
          </div>

          <button
            @click="setPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3.5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Next
          </button>
        </nav>
      </main>

      <!-- Right Column: Sidebar (4 cols) -->
      <aside class="lg:col-span-4 w-full space-y-8">
        <!-- Desktop Search Box Widget -->
        <div
          class="hidden lg:block bg-white rounded-2xl border border-gray-200 p-5 shadow-xs"
        >
          <h3
            class="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-primary-500"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Search Articles
          </h3>
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search blogs, UPSC, APSC..."
              class="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              aria-label="Clear search"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
          <div class="mb-4">
            <h3
              class="text-2xl font-bold text-primary-500 tracking-tight leading-none"
            >
              Categories
            </h3>
            <div class="w-10 h-0.5 bg-primary-500/40 mt-2"></div>
          </div>

          <ul
            class="divide-y divide-gray-100 text-sm max-h-[420px] overflow-y-auto pr-4"
          >
            <li>
              <button
                @click="selectCategory(null)"
                :class="[
                  'w-full py-2.5 text-left flex items-center justify-between transition-colors cursor-pointer group',
                  selectedCategory === null
                    ? 'text-primary-500 font-semibold'
                    : 'text-gray-800 hover:text-primary-500',
                ]"
              >
                <span class="group-hover:translate-x-0.5 transition-transform">
                  All Categories
                </span>
                <span
                  class="text-xs text-gray-500 group-hover:text-primary-500"
                >
                  ({{ posts.length }})
                </span>
              </button>
            </li>

            <li v-for="cat in categories" :key="cat.name">
              <button
                @click="selectCategory(cat.name)"
                :class="[
                  'w-full py-2.5 text-left flex items-center justify-between transition-colors cursor-pointer group',
                  selectedCategory === cat.name
                    ? 'text-primary-500 font-semibold'
                    : 'text-gray-800 hover:text-primary-500',
                ]"
              >
                <span
                  class="group-hover:translate-x-0.5 capitalize transition-transform"
                >
                  {{ cat.name.replaceAll("-", " ") }}
                </span>
                <span
                  :class="[
                    'text-xs transition-colors',
                    selectedCategory === cat.name
                      ? 'text-primary-500 font-semibold'
                      : 'text-gray-500 group-hover:text-primary-500',
                  ]"
                >
                  ({{ cat.count }})
                </span>
              </button>
            </li>
          </ul>
        </div>

        <BlogLeadForm
          title="Talk to an UPSC/APSC Expert"
          subtitle="Get a free preparation roadmap and batch syllabus guidance."
          badge="Free Mentorship"
          source="blog-sidebar-lead-form"
        />

        <BlogAdBanner
          heading="Crack UPSC & APSC with Takshashila"
          description="Comprehensive classroom & online coaching in Guwahati with complete study material."
          badge="Admissions Open 2026-27"
          primaryCtaText="Explore All Batches"
          primaryCtaLink="/courses/"
          secondaryCtaText="Contact Admission Desk"
          secondaryCtaLink="/contact/"
        />
      </aside>
    </div>
  </div>
</template>
