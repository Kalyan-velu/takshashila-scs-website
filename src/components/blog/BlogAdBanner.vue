<script setup lang="ts">
withDefaults(
  defineProps<{
    badge?: string;
    adLabel?: string;
    heading?: string;
    description?: string;
    primaryCtaText?: string;
    primaryCtaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
  }>(),
  {
    badge: "Admissions Open 2026-27",
    adLabel: "ADVERTISEMENT",
    heading: "Crack UPSC & APSC with Takshashila",
    description:
      "Comprehensive classroom & online coaching in Guwahati with complete study material.",
    primaryCtaText: "Explore All Batches",
    primaryCtaLink: "/courses/",
    secondaryCtaText: "Contact Admission Desk",
    secondaryCtaLink: "/contact/",
  }
);
</script>

<template>
  <div
    class="bg-linear-to-br from-primary-900 via-primary-800 to-primary-950 rounded-2xl p-6 text-white text-center relative overflow-hidden shadow-md border border-primary-700/50"
  >
    <!-- Background subtle glows -->
    <div
      class="absolute -right-8 -bottom-8 w-32 h-32 bg-primary-500/20 rounded-full blur-xl pointer-events-none"
    ></div>
    <div
      class="absolute -left-8 -top-8 w-24 h-24 bg-gold-400/15 rounded-full blur-lg pointer-events-none"
    ></div>

    <!-- Small ad indicator -->
    <div class="flex items-center justify-center gap-1.5 mb-3">
      <span
        class="text-[10px] tracking-wider font-semibold uppercase text-gold-300/80 bg-black/25 px-2 py-0.5 rounded"
      >
        {{ adLabel }}
      </span>
    </div>

    <!-- Promo Badge -->
    <span
      v-if="badge"
      class="inline-block px-3 py-1 bg-gold-500/20 text-gold-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-gold-400/30"
    >
      {{ badge }}
    </span>

    <h4 class="text-xl font-bold text-white mb-2 leading-snug">
      {{ heading }}
    </h4>

    <p class="text-xs text-gray-300 font-light mb-5 leading-relaxed">
      {{ description }}
    </p>

    <div class="space-y-2.5">
      <a
        v-if="primaryCtaText && primaryCtaLink"
        :href="primaryCtaLink"
        class="block w-full py-2.5 px-4 bg-gold-500 hover:bg-gold-400 text-gray-950 font-semibold text-sm rounded-xl transition-all shadow-md text-center"
      >
        {{ primaryCtaText }}
      </a>
      <a
        v-if="secondaryCtaText && secondaryCtaLink"
        :href="secondaryCtaLink"
        class="block w-full py-2 px-4 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl transition-all text-center border border-white/15"
      >
        {{ secondaryCtaText }}
      </a>
    </div>
  </div>
</template>
