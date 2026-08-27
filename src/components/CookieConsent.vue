<template>
  <div v-if="mounted">
    <button
      v-if="!isBannerOpen && !isModalOpen"
      @click="openModal"
      type="button"
      aria-label="Cookie Preferences"
      class="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-3 py-2 text-xs font-medium text-gray-700 shadow-md backdrop-blur-md transition-all hover:border-primary-500 hover:text-primary-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
      title="Cookie & Privacy Settings"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4 text-primary-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
        <path d="M8.5 8.5v.01" />
        <path d="M16 15.5v.01" />
        <path d="M12 12v.01" />
        <path d="M11 17v.01" />
        <path d="M7 14v.01" />
      </svg>
      <span class="hidden sm:inline">Cookie Preferences</span>
    </button>

    <!-- Bottom Consent Banner -->
    <Transition
      enter-active-class="transform transition ease-out duration-300"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transform transition ease-in duration-200"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <aside
        v-if="isBannerOpen"
        aria-label="Cookie Consent Banner"
        class="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-2xl border border-gray-200/90 bg-white/95 p-5 shadow-2xl backdrop-blur-md sm:bottom-6 sm:right-6 md:left-auto"
      >
        <div class="flex items-start gap-3">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
              <path d="M8.5 8.5v.01" />
              <path d="M16 15.5v.01" />
              <path d="M12 12v.01" />
              <path d="M11 17v.01" />
              <path d="M7 14v.01" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-sm font-semibold text-gray-900">
              We value your privacy
            </h3>
            <p class="mt-1 text-xs text-gray-600 leading-relaxed">
              We use cookies and analytical tools (Google Tag Manager &
              Microsoft Clarity) to enhance user experience, analyze website
              traffic, and optimize performance.
            </p>
          </div>
        </div>

        <div
          class="mt-4 flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-gray-100"
        >
          <button
            @click="openModal"
            type="button"
            class="text-xs font-medium text-gray-600 hover:text-gray-900 underline underline-offset-4 px-2 py-1.5 transition"
          >
            Preferences
          </button>
          <button
            @click="handleRejectOptional"
            type="button"
            class="rounded-xl bg-gray-100 px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200 transition"
          >
            Necessary Only
          </button>
          <button
            @click="handleAcceptAll"
            type="button"
            class="rounded-xl bg-primary-500 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-primary-600 transition cursor-pointer"
          >
            Accept All
          </button>
        </div>
      </aside>
    </Transition>

    <!-- Preferences Modal -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <div
          class="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between border-b border-gray-100 px-6 py-4"
          >
            <div>
              <h2 class="text-base font-semibold text-gray-900">
                Cookie Privacy Preferences
              </h2>
              <p class="text-xs text-gray-500 mt-0.5">
                Customize your consent settings below
              </p>
            </div>
            <button
              @click="closeModal"
              type="button"
              class="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Body / Categories -->
          <div class="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
            <!-- Category 1: Necessary -->
            <div
              class="flex items-start justify-between gap-4 pb-4 border-b border-gray-100"
            >
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-gray-900 text-sm"
                    >Essential & Security</span
                  >
                  <span
                    class="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600"
                    >Always Active</span
                  >
                </div>
                <p class="text-gray-600 leading-relaxed">
                  Required for basic site features, security validation
                  (Cloudflare Turnstile), and core system functions.
                </p>
              </div>
              <input
                type="checkbox"
                checked
                disabled
                class="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 opacity-60 cursor-not-allowed"
              />
            </div>

            <!-- Category 2: Analytics -->
            <div
              class="flex items-start justify-between gap-4 pb-4 border-b border-gray-100"
            >
              <div class="space-y-1">
                <span class="font-medium text-gray-900 text-sm block"
                  >Analytics & Performance</span
                >
                <p class="text-gray-600 leading-relaxed">
                  Allows us to monitor website traffic, track user engagement
                  via <strong>Google Tag Manager</strong>, and review visual
                  heatmaps & recordings with <strong>Microsoft Clarity</strong>.
                </p>
              </div>
              <label
                class="relative inline-flex items-center cursor-pointer shrink-0 mt-1"
              >
                <input
                  type="checkbox"
                  v-model="analytics"
                  class="sr-only peer"
                />
                <div
                  class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"
                ></div>
              </label>
            </div>

            <!-- Category 3: Marketing -->
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-1">
                <span class="font-medium text-gray-900 text-sm block"
                  >Marketing & Conversion Tracking</span
                >
                <p class="text-gray-600 leading-relaxed">
                  Used by our marketing tools to measure ad campaigns, track
                  conversions, and deliver relevant educational content.
                </p>
              </div>
              <label
                class="relative inline-flex items-center cursor-pointer shrink-0 mt-1"
              >
                <input
                  type="checkbox"
                  v-model="marketing"
                  class="sr-only peer"
                />
                <div
                  class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"
                ></div>
              </label>
            </div>
          </div>

          <!-- Footer Buttons -->
          <div
            class="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4"
          >
            <button
              @click="handleSavePreferences"
              type="button"
              class="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              Save Preferences
            </button>
            <button
              @click="handleAcceptAll"
              type="button"
              class="rounded-xl bg-primary-500 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-primary-600 transition cursor-pointer"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import {
  acceptAllConsent,
  getStoredConsent,
  rejectOptionalConsent,
  saveConsent,
} from "@/lib/consent";

const mounted = ref(false);
const isBannerOpen = ref(false);
const isModalOpen = ref(false);

const analytics = ref(false);
const marketing = ref(false);

const loadCurrentPreferences = () => {
  const prefs = getStoredConsent();
  if (prefs) {
    analytics.value = !!prefs.analytics;
    marketing.value = !!prefs.marketing;
    isBannerOpen.value = false;
  } else {
    analytics.value = false;
    marketing.value = false;
    isBannerOpen.value = true;
  }
};

const handleAcceptAll = () => {
  const prefs = acceptAllConsent();
  analytics.value = true;
  marketing.value = true;
  isBannerOpen.value = false;
  isModalOpen.value = false;
};

const handleRejectOptional = () => {
  const prefs = rejectOptionalConsent();
  analytics.value = false;
  marketing.value = false;
  isBannerOpen.value = false;
  isModalOpen.value = false;
};

const handleSavePreferences = () => {
  saveConsent({
    analytics: analytics.value,
    marketing: marketing.value,
  });
  isBannerOpen.value = false;
  isModalOpen.value = false;
};

const openModal = () => {
  const prefs = getStoredConsent();
  if (prefs) {
    analytics.value = !!prefs.analytics;
    marketing.value = !!prefs.marketing;
  }
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleOpenConsentEvent = () => {
  openModal();
};

onMounted(() => {
  mounted.value = true;
  loadCurrentPreferences();
  if (typeof window !== "undefined") {
    window.addEventListener("open-cookie-consent", handleOpenConsentEvent);
  }
});

onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("open-cookie-consent", handleOpenConsentEvent);
  }
});
</script>
