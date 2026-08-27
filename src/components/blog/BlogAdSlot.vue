<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string;
    title?: string;
    subtitle?: string;
    format?: string;
  }>(),
  {
    label: "SPONSORED / AD SPACE (300×250)",
    title: "Ad Space Available",
    subtitle: "Google AdSense / Custom Banner",
    format: "300x250",
  }
);
</script>

<template>
  <div
    class="bg-gray-50/80 border-2 border-dashed border-gray-300/80 rounded-2xl p-6 text-center"
  >
    <div
      v-if="label"
      class="text-[10px] uppercase font-semibold text-gray-400 tracking-wider mb-2"
    >
      {{ label }}
    </div>

    <!-- Ad Content Container (Can host Google AdSense script or image) -->
    <div
      class="aspect-4/3 w-full bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center p-4 text-gray-400"
    >
      <slot>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="mb-2 text-gray-300"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
        <span class="text-xs font-medium text-gray-500">{{ title }}</span>
        <span class="text-[11px] text-gray-400 mt-1">{{ subtitle }}</span>
      </slot>
    </div>
  </div>
</template>
