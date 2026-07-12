<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { getLatestPosts } from "../lib/wordpress";
import type { WPPost } from "@/types";
import { CURRENT_AFFAIRS_URL } from "@/config/CONSTANTS.ts";

const posts = ref<WPPost[]>([]);
const isLoading = ref(true);

const renderPosts = computed(() => {
  return posts.value.length > 0 ? posts.value : [];
});

const getImageUrl = (post: WPPost) => {
  const fallbackImage =
    "https://images.unsplash.com/photo-1456324504439-367cee3b3c32";
  return post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || fallbackImage;
};

const getCleanExcerpt = (post: WPPost) => {
  return post.excerpt?.rendered?.replace(/<\/?[^>]+(>|$)/g, "") || "";
};

onMounted(async () => {
  try {
    const fetchedPosts = await getLatestPosts(1, 6);
    if (fetchedPosts && fetchedPosts.length > 0) {
      posts.value = fetchedPosts;
    }
  } catch (error) {
    console.error("Error fetching trending posts:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <section class="py-12 max-w-7xl w-full mx-auto lg:pb-32 bg-gray-100/30">
    <div class="px-4 md:px-6">
      <div
        class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
      >
        <div class="max-w-2xl">
          <h2
            class="text-3xl md:text-5xl font-light tracking-tight text-gray-900 mb-4"
          >
            Latest Blogs
          </h2>
          <p class="text-gray-600 font-light text-lg">
            Insights, updates, and articles from Takshasheela to fuel your
            preparation.
          </p>
        </div>

        <a
          target="_blank"
          :href="CURRENT_AFFAIRS_URL"
          class="inline-flex items-center text-primary-500 font-medium hover:underline w-fit"
        >
          View all articles
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
            class="ml-1 w-4 h-4"
          >
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </a>
      </div>

      <!-- Loading Skeletons -->
      <div
        v-if="isLoading"
        class="grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6"
      >
        <div
          v-for="n in 4"
          :key="n"
          class="flex flex-col items-start bg-white rounded-2xl border border-gray-200 overflow-hidden h-full"
        >
          <div class="w-full aspect-video bg-gray-100 animate-pulse"></div>

          <div class="p-6 flex flex-col grow w-full">
            <div class="flex items-center gap-2 mb-3">
              <div
                class="h-5 w-16 rounded-full bg-gray-100 animate-pulse"
              ></div>
            </div>

            <div class="space-y-2 mb-3 h-14">
              <div class="h-5 w-full rounded bg-gray-100 animate-pulse"></div>
              <div class="h-5 w-3/4 rounded bg-gray-100 animate-pulse"></div>
            </div>

            <div class="space-y-2 mb-4 grow">
              <div class="h-4 w-full rounded bg-gray-100 animate-pulse"></div>
              <div class="h-4 w-full rounded bg-gray-100 animate-pulse"></div>
              <div class="h-4 w-2/3 rounded bg-gray-100 animate-pulse"></div>
            </div>

            <div
              class="mt-auto h-4 w-24 rounded bg-gray-100 animate-pulse"
            ></div>
          </div>
        </div>
      </div>

      <div v-else-if="renderPosts.length === 0" class="text-center py-12">
        <p class="text-gray-600">No articles available at the moment.</p>
      </div>

      <!-- Actual Content -->
      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a
          v-for="post in renderPosts"
          :key="post.id"
          :href="`${post.link.replace('crm.', '')}`"
          class="group flex flex-col items-start bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all hover:-translate-y-1 h-full"
        >
          <div class="w-full aspect-video overflow-hidden bg-gray-100">
            <img
              :src="getImageUrl(post)"
              :alt="post.title.rendered"
              width="350"
              height="197"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
          <div class="p-6 flex flex-col grow">
            <div class="flex items-center gap-2 mb-3">
              <span
                class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-500/10 text-primary-500"
              >
                Article
              </span>
            </div>
            <h3
              class="text-xl font-medium tracking-tight mb-3 line-clamp-2 group-hover:text-primary-500 transition-colors h-14"
              v-html="post.title.rendered"
            ></h3>
            <p
              class="text-gray-600 font-light text-sm line-clamp-3 mb-4 grow"
              v-html="getCleanExcerpt(post)"
            ></p>

            <div
              class="mt-auto inline-flex items-center text-sm font-medium text-gray-900 group-hover:text-primary-500"
            >
              Read More
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
                class="ml-1 w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
              >
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </div>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>
