<script setup lang="ts">
import {onMounted, ref} from 'vue';

const props = defineProps({
  hasModes: {
    type: Boolean,
    default: false
  },
  availableModes: {
    type: Array as () => string[],
    default: () => []
  }
});

const tabs = [
  { id: 'about-course', label: 'About the Course' },
  { id: 'about-exam', label: 'About the Exam' },
  { id: 'notification', label: 'Notification' }
];

const activeTab = ref(tabs[0].id);
const selectedMode = ref(props.availableModes[0] ?? 'offline');

onMounted(() => {
  const hash = window.location.hash.replace('#', '');
  if (tabs.some(t => t.id === hash)) {
    activeTab.value = hash;
  }
  // Emit initial mode
  dispatchModeChange(selectedMode.value);
});

const selectTab = (id: string) => {
  activeTab.value = id;
  window.history.pushState(null, '', `#${id}`);
};

const dispatchModeChange = (mode: string) => {
  window.dispatchEvent(new CustomEvent('course-mode-change', { detail: { mode } }));
};

const selectMode = (mode: string) => {
  selectedMode.value = mode;
  dispatchModeChange(mode);
};
</script>

<template>
  <div class="w-full bg-card text-card-foreground rounded-2xl shadow-sm border border-border mt-6 overflow-hidden">
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

    <!-- Mode Toggle -->
    <div v-if="hasModes && activeTab === 'about-course'" class="flex items-center gap-2 px-6 md:px-10 pt-6">
      <span class="text-sm font-medium text-muted-foreground mr-2">Mode:</span>
      <button
        v-for="mode in availableModes"
        :key="mode"
        @click="selectMode(mode)"
        class="px-4 py-1.5 rounded-full text-sm font-medium transition-all border"
        :class="selectedMode === mode
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background border-border text-muted-foreground hover:border-primary/50'"
      >
        {{ mode.charAt(0).toUpperCase() + mode.slice(1) }}
      </button>
    </div>

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
