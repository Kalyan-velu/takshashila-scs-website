<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import variables from "@/config/variables";
import { useTurnstile } from "@/lib/useTurnstile";
import { submitLead } from "@/lib/submitLead";

const props = withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    badge?: string;
    source?: string;
    defaultCourse?: string;
  }>(),
  {
    title: "Talk to an UPSC/APSC Expert",
    subtitle: "Get a free preparation roadmap and batch syllabus guidance.",
    badge: "Free Mentorship",
    source: "blog-sidebar-lead-form",
    defaultCourse: "APSC Foundation Batch",
  }
);

const leadForm = ref({
  name: "",
  phone: "",
  email: "",
  course: props.defaultCourse,
});

const isLeadSubmitting = ref(false);
const isLeadSubmitted = ref(false);
const leadError = ref<string | null>(null);

const {
  token: turnstileToken,
  container: turnstileContainer,
  mount: mountTurnstile,
  reset: resetTurnstile,
} = useTurnstile({ siteKey: variables.CLOUDFLARE_SITE_KEY });

const isLeadSubmitEnabled = computed(
  () =>
    leadForm.value.name.trim() !== "" &&
    leadForm.value.phone.trim() !== "" &&
    leadForm.value.email.trim() !== "" &&
    !!turnstileToken.value &&
    !isLeadSubmitting.value
);

const handleLeadSubmit = async () => {
  if (!turnstileToken.value) return;
  isLeadSubmitting.value = true;
  leadError.value = null;

  let phone = leadForm.value.phone.trim();
  if (phone && !phone.startsWith("+")) {
    phone = `+91${phone.replace(/\D/g, "")}`;
  }

  try {
    const result = await submitLead({
      name: leadForm.value.name.trim(),
      phone,
      email: leadForm.value.email.trim(),
      course: leadForm.value.course,
      source: props.source,
      cfTurnstileResponse: turnstileToken.value,
    });

    if (result.success) {
      isLeadSubmitted.value = true;
      leadForm.value = {
        name: "",
        phone: "",
        email: "",
        course: props.defaultCourse,
      };
      resetTurnstile();
    } else {
      leadError.value = result.message || "Failed to submit. Please try again.";
      resetTurnstile();
    }
  } catch (err) {
    console.error(err);
    leadError.value = "An error occurred. Please try again.";
    resetTurnstile();
  } finally {
    isLeadSubmitting.value = false;
  }
};

onMounted(async () => {
  await nextTick();
  mountTurnstile();
});
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs">
    <!-- Success Feedback View -->
    <div v-if="isLeadSubmitted" class="text-center py-6 space-y-4">
      <div
        class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20 6L9 17l-5-5"></path>
        </svg>
      </div>
      <h4 class="text-lg font-semibold text-gray-900">
        Guidance Request Received!
      </h4>
      <p class="text-xs text-gray-600 leading-relaxed">
        Thank you! Our senior civil services mentor will connect with you
        shortly.
      </p>
      <button
        @click="isLeadSubmitted = false"
        class="text-xs text-primary-500 font-medium hover:underline cursor-pointer pt-2"
      >
        Submit another query
      </button>
    </div>

    <!-- Active Form View -->
    <div v-else>
      <div class="mb-4">
        <span
          v-if="badge"
          class="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 uppercase tracking-wider bg-primary-100/70 px-2 py-0.5 rounded"
        >
          {{ badge }}
        </span>
        <h4 class="text-lg font-bold text-gray-900 mt-1.5 leading-snug">
          {{ title }}
        </h4>
        <p v-if="subtitle" class="text-xs text-gray-500 mt-1 leading-relaxed">
          {{ subtitle }}
        </p>
      </div>

      <form @submit.prevent="handleLeadSubmit" class="space-y-3">
        <div>
          <input
            v-model="leadForm.name"
            type="text"
            required
            placeholder="Full Name"
            class="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>

        <div>
          <input
            v-model="leadForm.phone"
            type="tel"
            required
            placeholder="Phone Number (+91)"
            class="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>

        <div>
          <input
            v-model="leadForm.email"
            type="email"
            required
            placeholder="Email Address"
            class="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>

        <div>
          <select
            v-model="leadForm.course"
            class="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer"
          >
            <option value="APSC Foundation Batch">APSC Foundation Batch</option>
            <option value="UPSC Foundation Batch">UPSC Foundation Batch</option>
            <option value="ADRE Online Batch">ADRE Coaching</option>
            <option value="General Guidance">General Guidance / Other</option>
          </select>
        </div>

        <!-- Turnstile Captcha Container -->
        <div
          ref="turnstileContainer"
          class="overflow-hidden min-h-[65px] flex items-center justify-center"
        ></div>

        <p v-if="leadError" class="text-xs text-destructive">
          {{ leadError }}
        </p>

        <button
          type="submit"
          :disabled="!isLeadSubmitEnabled"
          class="w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-medium text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <span v-if="isLeadSubmitting" class="flex items-center gap-2">
            <svg
              class="animate-spin h-4 w-4 text-white"
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
          <span v-else>Request Free Guidance</span>
        </button>
      </form>
    </div>
  </div>
</template>
