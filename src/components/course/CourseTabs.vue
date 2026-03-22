<script setup lang="ts">
import {onMounted, ref} from 'vue';

const tabs = [
  { id: 'about-course', label: 'About the Course' },
  { id: 'about-exam', label: 'About the Exam' },
  { id: 'notification', label: 'Notification' }
];

const activeTab = ref(tabs[0].id);

onMounted(() => {
  const hash = window.location.hash.replace('#', '');
  if (tabs.some(t => t.id === hash)) {
    activeTab.value = hash;
  }
});

const selectTab = (id) => {
  activeTab.value = id;
  // Update URL hash without jumping
  window.history.pushState(null, '', `#${id}`);
};
</script>

<template>
  <div class="w-full bg-card text-card-foreground rounded-2xl shadow-sm border border-border mt-6 overflow-hidden">
    <!-- Tab Headers -->
    <div class="flex overflow-x-auto border-b border-border hide-scrollbar scroll-smooth bg-muted/30">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="selectTab(tab.id)"
        class="whitespace-nowrap px-6 md:px-8 py-4 md:py-5 text-sm md:text-base font-medium transition-colors border-b-2 relative -mb-px"
        :class="activeTab === tab.id ? 'border-primary text-primary bg-background' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Contents -->
    <div class="w-full p-6 md:p-10 markdown-content">
      <div v-show="activeTab === 'about-course'" class="w-full animate-in fade-in duration-300">
        <slot name="about-course" />
      </div>
      <div v-show="activeTab === 'about-exam'" class="w-full animate-in fade-in duration-300">
        <slot name="about-exam" />
      </div>
      <div v-show="activeTab === 'notification'" class="w-full animate-in fade-in duration-300">
        <slot name="notification" />
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
