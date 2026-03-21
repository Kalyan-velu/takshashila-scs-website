
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getLatestPosts, type WPPost } from '../lib/wordpress';

const posts = ref<WPPost[]>([]);
const isLoading = ref(true);

const renderPosts = computed(() => {
  return posts.value.length > 0 ? posts.value : [];
});

const getImageUrl = (post: WPPost) => {
  const fallbackImage = "https://images.unsplash.com/photo-1456324504439-367cee3b3c32";
  return post._embedded?.['wp:featuredmedia']?.[0]?.source_url || fallbackImage;
};

const getCleanExcerpt = (post: WPPost) => {
  return post.excerpt?.rendered?.replace(/<\/?[^>]+(>|$)/g, "") || "";
};

onMounted(async () => {
  try {
    const fetchedPosts = await getLatestPosts(1,4);
    if (fetchedPosts && fetchedPosts.length > 0) {
      posts.value = fetchedPosts;
    }
  } catch (error) {
    console.error('Error fetching trending posts:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <section class="pb-12 lg:pb-32 bg-muted/30">
    <div class=" px-4 md:px-6">
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div class="max-w-2xl">
          <h2 class="text-3xl md:text-5xl font-light tracking-tight text-foreground mb-4">
            Trending now
          </h2>
          <p class="text-muted-foreground font-light text-lg">
            Insights, updates, and articles from Takshashila to fuel your preparation.
          </p>
        </div>

        <a href="/blog" class="inline-flex items-center text-primary font-medium hover:underline w-fit">
          View all articles
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1 w-4 h-4"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
        </a>
      </div>

      <!-- Loading Skeletons -->
      <div v-if="isLoading" class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="n in 4" :key="n" class="flex flex-col items-start bg-card rounded-2xl border border-border overflow-hidden h-full">
          <!-- Image Skeleton -->
          <div class="w-full aspect-video bg-muted animate-pulse"></div>

          <div class="p-6 flex flex-col flex-grow w-full">
            <!-- Tag Skeleton -->
            <div class="flex items-center gap-2 mb-3">
              <div class="h-5 w-16 rounded-full bg-muted animate-pulse"></div>
            </div>

            <!-- Title Skeleton -->
            <div class="space-y-2 mb-3 h-[3.5rem]">
              <div class="h-5 w-full rounded bg-muted animate-pulse"></div>
              <div class="h-5 w-3/4 rounded bg-muted animate-pulse"></div>
            </div>

            <!-- Excerpt Skeleton -->
            <div class="space-y-2 mb-4 flex-grow">
              <div class="h-4 w-full rounded bg-muted animate-pulse"></div>
              <div class="h-4 w-full rounded bg-muted animate-pulse"></div>
              <div class="h-4 w-2/3 rounded bg-muted animate-pulse"></div>
            </div>

            <!-- Read More Skeleton -->
            <div class="mt-auto h-4 w-24 rounded bg-muted animate-pulse"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="renderPosts.length === 0" class="text-center py-12">
        <p class="text-muted-foreground">No articles available at the moment.</p>
      </div>

      <!-- Actual Content -->
      <div v-else class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <a v-for="post in renderPosts" :key="post.id" :href="post.link" class="group flex flex-col items-start bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md transition-all hover:-translate-y-1 h-full">
          <div class="w-full aspect-video overflow-hidden bg-muted">
            <img
                :src="getImageUrl(post)"
                :alt="post.title.rendered"
                width="350"
                height="197"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
            />
          </div>
          <div class="p-6 flex flex-col flex-grow">
            <div class="flex items-center gap-2 mb-3">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                Article
              </span>
            </div>
            <h3 class="text-xl font-medium tracking-tight mb-3 line-clamp-2 group-hover:text-primary transition-colors h-[3.5rem]" v-html="post.title.rendered"></h3>
            <p class="text-muted-foreground font-light text-sm line-clamp-3 mb-4 flex-grow" v-html="getCleanExcerpt(post)"></p>

            <div class="mt-auto inline-flex items-center text-sm font-medium text-foreground group-hover:text-primary">
              Read More
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1 w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
            </div>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>