<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import variables from "@/config/variables";
import { PHONE_HREF } from "@/config/CONSTANTS";
import { coursesItems } from "@/data/navigation";
import { useTurnstile } from "@/lib/useTurnstile";
import { submitLead } from "@/lib/submitLead";

interface CoursePrice {
  original: number;
  discount: number;
}

interface CourseItem {
  id: string;
  title: string;
  description: string;
  prices?: {
    online?: CoursePrice;
    offline?: CoursePrice;
  };
  popular: boolean;
  categories: string[];
  image: string;
  url?: string;
  duration: string;
  highlights: string[];
  modes: string[];
}

const props = defineProps({
  price: {
    type: String,
    default: "₹999",
  },
  period: {
    type: String,
    default: "/ starting price",
  },
  features: {
    type: Array as () => string[],
    default: () => [
      "Batch starts from April",
      "100% Online Course",
      "Comprehensive Syllabus",
    ],
  },
  courseItems: {
    type: Array as () => CourseItem[],
    default: () => [],
  },
  hasModes: {
    type: Boolean,
    default: false,
  },
});

const selectedMode = ref<string>("offline");
const selectedCourseIndex = ref(0);

const onModeChange = (e: Event) => {
  const customEvent = e as CustomEvent;
  if (customEvent.detail?.mode) {
    selectedMode.value = customEvent.detail.mode;
  }
};

const {
  token: turnstileToken,
  container: turnstileContainer,
  mount: mountTurnstile,
  reset: resetTurnstile,
} = useTurnstile({ siteKey: variables.CLOUDFLARE_SITE_KEY });

onMounted(async () => {
  window.addEventListener("course-mode-change", onModeChange);
  await nextTick();
  mountTurnstile();
});

onUnmounted(() => {
  window.removeEventListener("course-mode-change", onModeChange);
});

const activeCourse = computed(() => {
  if (props.courseItems.length === 0) return null;
  return props.courseItems[selectedCourseIndex.value] ?? props.courseItems[0];
});

const currentPrice = computed(() => {
  const course = activeCourse.value;
  if (!course?.prices) return null;
  const modePrice =
    selectedMode.value === "online"
      ? course.prices.online
      : course.prices.offline;
  return modePrice ?? null;
});

const displayPrice = computed(() => {
  if (currentPrice.value) {
    const discounted =
      currentPrice.value.original - currentPrice.value.discount;
    return `₹${discounted.toLocaleString("en-IN")}`;
  }
  return props.price;
});

const displayOriginalPrice = computed(() => {
  if (currentPrice.value) {
    return `₹${currentPrice.value.original.toLocaleString("en-IN")}`;
  }
  return null;
});

const displayPeriod = computed(() => {
  if (currentPrice.value) {
    return `/ ${selectedMode.value} mode`;
  }
  return props.period;
});

const isSubmitting = ref(false);
const isSubmitted = ref(false);
const form = ref({ name: "", phone: "", email: "" });

const isSubmitEnabled = computed(
  () => !!turnstileToken.value && !isSubmitting.value,
);

const submitForm = async () => {
  if (!turnstileToken.value) return;
  isSubmitting.value = true;
  try {
    const selectedCourseTitle =
      props.courseItems[selectedCourseIndex.value]?.title || "Civil Services Course";

    let phone = form.value.phone.trim();
    if (phone && !phone.startsWith("+")) {
      phone = `+91${phone.replace(/\D/g, "")}`;
    }

    await submitLead({
      name: form.value.name.trim(),
      phone,
      email: form.value.email.trim(),
      course: selectedCourseTitle,
      source:
        selectedCourseTitle.toLowerCase().replace(/\s+/g, "-") +
        "-" +
        selectedMode.value.toLowerCase().replace(/\s+/g, "-"),
      cfTurnstileResponse: turnstileToken.value,
    });
    isSubmitted.value = true;
    form.value.name = "";
    form.value.phone = "";
    form.value.email = "";
    resetTurnstile();
  } catch (error) {
    console.error(error);
    resetTurnstile();
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div
    class="bg-white text-gray-900 rounded-2xl border border-gray-200 overflow-hidden shadow-xl shadow-primary-500/5 mt-6"
  >
    <div v-if="isSubmitted" class="p-6 text-center space-y-6">
      <div class="w-14 h-14 rounded-full bg-success/10 border border-success/20 text-success flex items-center justify-center mx-auto shadow-sm">
        <iconify-icon icon="lucide:check-circle-2" class="text-3xl"></iconify-icon>
      </div>
      <div class="space-y-2">
        <h4 class="text-xl font-medium text-gray-900">Query Submitted!</h4>
        <p class="text-sm text-gray-600 font-light leading-relaxed">
          Thank you for submitting your query. Someone from our end will contact you shortly.
        </p>
      </div>
      <div class="pt-4 border-t border-gray-100 space-y-3">
        <p class="text-xs font-semibold uppercase tracking-wider text-gray-600">Discover More</p>
        <div class="flex flex-col gap-2">
          <a href="/about" class="w-full py-2.5 px-4 rounded-xl bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-colors text-xs font-medium text-center">
            Know More About Us
          </a>
          <a href="/courses" class="w-full py-2.5 px-4 rounded-xl bg-gray-100 text-gray-700 hover:bg-primary-500 hover:text-white transition-colors text-xs font-medium text-center">
            Explore All Courses
          </a>
        </div>
      </div>
      <button @click="isSubmitted = false" class="text-xs text-gray-500 underline hover:text-gray-900">
        Submit another query
      </button>
    </div>

    <div v-else class="p-6 md:p-8">
      <h3 class="text-2xl font-light tracking-tight mb-2">Enroll Now</h3>

      <div v-if="courseItems.length > 1" class="mb-4">
        <select
          v-model="selectedCourseIndex"
          class="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        >
          <option
            v-for="(course, index) in courseItems"
            :key="course.id"
            :value="index"
          >
            {{ course.title }}
          </option>
        </select>
      </div>

      <div class="flex items-baseline gap-2 mb-1">
        <span class="text-3xl font-semibold text-primary-500">{{
          displayPrice
        }}</span>
        <span class="text-gray-600 text-sm">{{ displayPeriod }}</span>
      </div>
      <div
        v-if="displayOriginalPrice && currentPrice"
        class="flex items-center gap-2 mb-6"
      >
        <span class="text-gray-600 text-sm line-through">{{
          displayOriginalPrice
        }}</span>
        <span
          class="text-xs font-medium text-success bg-success/10 dark:bg-success/20 dark:text-success px-2 py-0.5 rounded-full"
        >
          Save ₹{{ currentPrice.discount.toLocaleString("en-IN") }}
        </span>
      </div>
      <div v-else class="mb-6"></div>

      <ul class="space-y-4 mb-8">
        <li
          v-for="(feature, index) in features"
          :key="index"
          class="flex items-center gap-3 text-sm text-gray-600"
        >
          <div class="p-1.5 rounded-full bg-primary-500/10 text-primary-500">
            <svg
              class="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          {{ feature }}
        </li>
      </ul>

      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <input
            v-model="form.name"
            type="text"
            required
            name="name"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            placeholder="Full Name"
          />
        </div>
        <div>
          <input
            v-model="form.phone"
            type="tel"
            required
            name="phone"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            placeholder="Phone Number"
          />
        </div>
        <div>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            placeholder="Enter email"
          />
        </div>

        <!-- Turnstile widget -->
        <div ref="turnstileContainer" />

        <button
          type="submit"
          :disabled="!isSubmitEnabled"
          class="w-full bg-primary-500 disabled:opacity-50 text-white hover:bg-primary-600 font-medium py-3 px-4 rounded-xl transition-all shadow-md mt-2 flex justify-center items-center cursor-pointer"
        >
          <span v-if="isSubmitting" class="flex gap-2">
            <svg
              class="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Submitting...
          </span>
          <span v-else>Request Callback</span>
        </button>
      </form>

      <div class="relative flex items-center py-6 pb-4">
        <div class="grow border-t border-gray-200"></div>
        <span
          class="shrink-0 mx-4 text-gray-600 text-xs uppercase font-medium tracking-wider"
          >Or</span
        >
        <div class="grow border-t border-gray-200"></div>
      </div>

      <a
        :href="PHONE_HREF"
        class="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-xl transition-all"
      >
        <svg
          class="w-4 h-4 text-primary-500"
          fill="currentColor"
          viewBox="0 0 512 512"
        >
          <path
            d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"
          />
        </svg>
        Call Us Directly
      </a>
    </div>
  </div>
</template>
