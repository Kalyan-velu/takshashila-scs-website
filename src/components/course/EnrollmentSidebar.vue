<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

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

onMounted(() => {
  window.addEventListener("course-mode-change", onModeChange);
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
const form = ref({ name: "", phone: "" });

const submitForm = async () => {
  isSubmitting.value = true;
  try {
    await fetch("https://example.com/lead", {
      method: "POST",
      body: JSON.stringify(form.value),
    });
    alert("Enrollment requested! We will call you back.");
    form.value.name = "";
    form.value.phone = "";
  } catch (error) {
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div
    class="bg-card text-card-foreground rounded-2xl border border-border overflow-hidden shadow-xl shadow-primary/5 mt-6"
  >
    <div class="p-6 md:p-8">
      <h3 class="text-2xl font-light tracking-tight mb-2">Enroll Now</h3>

      <div v-if="courseItems.length > 1" class="mb-4">
        <select
          v-model="selectedCourseIndex"
          class="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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
        <span class="text-3xl font-semibold text-primary">{{
          displayPrice
        }}</span>
        <span class="text-muted-foreground text-sm">{{ displayPeriod }}</span>
      </div>
      <div
        v-if="displayOriginalPrice && currentPrice"
        class="flex items-center gap-2 mb-6"
      >
        <span class="text-muted-foreground text-sm line-through">{{
          displayOriginalPrice
        }}</span>
        <span
          class="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded-full"
        >
          Save ₹{{ currentPrice.discount.toLocaleString("en-IN") }}
        </span>
      </div>
      <div v-else class="mb-6"></div>

      <ul class="space-y-4 mb-8">
        <li
          v-for="(feature, index) in features"
          :key="index"
          class="flex items-center gap-3 text-sm text-muted-foreground"
        >
          <div class="p-1.5 rounded-full bg-primary/10 text-primary">
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
            class="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Full Name"
          />
        </div>
        <div>
          <input
            v-model="form.phone"
            type="tel"
            required
            class="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Phone Number"
          />
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full bg-primary text-primary-foreground hover:opacity-90 font-medium py-3 px-4 rounded-lg transition-all shadow-md mt-2 flex justify-center items-center cursor-pointer"
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
        <div class="grow border-t border-border"></div>
        <span
          class="shrink-0 mx-4 text-muted-foreground text-xs uppercase font-medium tracking-wider"
          >Or</span
        >
        <div class="grow border-t border-border"></div>
      </div>

      <a
        href="tel:+916001657575"
        class="w-full flex items-center justify-center gap-2 bg-background border border-border hover:bg-muted text-foreground font-medium py-3 px-4 rounded-lg transition-all"
      >
        <svg
          class="w-4 h-4 text-primary"
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
