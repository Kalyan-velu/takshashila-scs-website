<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import variables from "@/config/variables.ts";
import { useTurnstile } from "@/lib/useTurnstile";
import { submitLead } from "@/lib/submitLead";

const cloudflare_site_key = variables.CLOUDFLARE_SITE_KEY;

const form = ref({ name: "", phone: "", email: "", course: "" });
const isVisible = ref(false);
const isSubmitting = ref(false);
const fieldErrors = ref<Record<string, string>>({});
const formError = ref<string | null>(null);
const isSubmitted = ref(false);

const {
  token: turnstileToken,
  container: turnstileContainer,
  mount: mountTurnstile,
  reset: resetTurnstile,
} = useTurnstile({ siteKey: cloudflare_site_key });

const isSubmitEnabled = computed(
  () =>
    form.value.name.trim() !== "" &&
    form.value.email.trim() !== "" &&
    form.value.phone.trim() !== "" &&
    !!turnstileToken.value &&
    !isSubmitting.value,
);

const openDrawer = async () => {
  isVisible.value = true;
  isSubmitted.value = false;
  // The Turnstile container only exists in the DOM once the drawer is
  // visible, so (re)mount after it renders rather than on component mount.
  await nextTick();
  mountTurnstile();
};

const closeDrawer = () => {
  isVisible.value = false;
};

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && isVisible.value) {
    e.preventDefault();
    closeDrawer();
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("open-apply-drawer", openDrawer);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("open-apply-drawer", openDrawer);
});

const submitForm = async () => {
  if (!turnstileToken.value) return;
  isSubmitting.value = true;
  fieldErrors.value = {};
  formError.value = null;

  let phone = form.value.phone.trim();
  if (phone && !phone.startsWith("+")) {
    phone = `+91${phone.replace(/\D/g, "")}`;
  }

  try {
    const result = await submitLead({
      name: form.value.name.trim(),
      phone,
      email: form.value.email.trim(),
      course: form.value.course || undefined,
      source: "apply-drawer",
      cfTurnstileResponse: turnstileToken.value,
    });

    if (result.success) {
      isSubmitted.value = true;
      return;
    }

    if (result.code === "VALIDATION_ERROR") {
      fieldErrors.value = Object.fromEntries(
        Object.entries(result.fieldErrors).map(([field, messages]) => [
          field,
          messages?.[0] ?? "",
        ]),
      );
      if (fieldErrors.value.cfTurnstileResponse) {
        formError.value = "Please complete the captcha again.";
        resetTurnstile();
      }
    } else {
      formError.value = result.message;
      resetTurnstile();
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div v-if="isVisible" class="fixed inset-0 z-50 flex justify-end">
    <div
      class="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      @click="closeDrawer"
    ></div>

    <div
      class="relative bg-white text-gray-900 w-full sm:max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto"
    >
      <button
        @click="closeDrawer"
        class="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full p-2 transition-colors"
        aria-label="Close dialog"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          class="stroke-current"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>

      <!-- Success Feedback View -->
      <div
        v-if="isSubmitted"
        class="flex-1 p-6 sm:p-8 flex flex-col justify-center text-center space-y-5"
      >
        <div
          class="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto shadow-sm"
        >
          <iconify-icon
            icon="lucide:check-circle-2"
            class="text-4xl"
          ></iconify-icon>
        </div>

        <div class="space-y-2">
          <h3 class="text-2xl font-medium text-gray-900 tracking-tight">
            Application Received!
          </h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            Thank you for registering. Our admissions team will reach out to
            you shortly with the batch details.
          </p>
        </div>

        <button
          @click="closeDrawer"
          class="w-full mt-2 bg-gray-900 text-white font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm"
        >
          Close
        </button>
      </div>

      <!-- Form View -->
      <div v-else class="flex-1 p-6 sm:p-8 pt-16 flex flex-col">
        <h2
          class="text-2xl sm:text-3xl font-light tracking-tight text-primary-500 mb-2 leading-tight"
        >
          Register for
          <span class="block text-gray-900 text-xl sm:text-2xl font-normal mt-0.5"
            >Upcoming Batch</span
          >
        </h2>
        <p class="text-sm text-gray-600 mb-6 leading-relaxed">
          Fill in your details and our admissions team will help you complete
          your enrollment.
        </p>

        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label for="apply-name" class="block text-sm font-medium mb-1"
              >Name</label
            >
            <input
              id="apply-name"
              v-model="form.name"
              type="text"
              required
              :class="[
                'w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all',
                fieldErrors.name
                  ? 'border-destructive focus:border-destructive'
                  : 'border-gray-200 focus:border-primary-500',
              ]"
              placeholder="Your full name"
            />
            <p v-if="fieldErrors.name" class="mt-1 text-xs text-destructive">
              {{ fieldErrors.name }}
            </p>
          </div>
          <div>
            <label for="apply-email" class="block text-sm font-medium mb-1"
              >Email</label
            >
            <input
              id="apply-email"
              v-model="form.email"
              type="email"
              required
              :class="[
                'w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all',
                fieldErrors.email
                  ? 'border-destructive focus:border-destructive'
                  : 'border-gray-200 focus:border-primary-500',
              ]"
              placeholder="Enter your email"
            />
            <p v-if="fieldErrors.email" class="mt-1 text-xs text-destructive">
              {{ fieldErrors.email }}
            </p>
          </div>

          <div>
            <label for="apply-phone" class="block text-sm font-medium mb-1"
              >Phone Number</label
            >
            <input
              id="apply-phone"
              v-model="form.phone"
              type="tel"
              required
              :class="[
                'w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all',
                fieldErrors.phone
                  ? 'border-destructive focus:border-destructive'
                  : 'border-gray-200 focus:border-primary-500',
              ]"
              placeholder="+91 98765 43210"
            />
            <p v-if="fieldErrors.phone" class="mt-1 text-xs text-destructive">
              {{ fieldErrors.phone }}
            </p>
          </div>

          <div>
            <label for="apply-course" class="block text-sm font-medium mb-1"
              >Target Batch</label
            >
            <select
              id="apply-course"
              v-model="form.course"
              class="w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/50 border-gray-200 cursor-pointer"
            >
              <option value="" disabled selected>
                Select target batch...
              </option>
              <option value="APSC Foundation Batch">
                APSC Foundation Batch
              </option>
              <option value="UPSC Foundation Batch">
                UPSC Foundation Batch
              </option>
              <option value="ADRE Online Batch">ADRE Online Batch</option>
              <option value="Optional Subject / Test Series">
                Optional Subject / Test Series
              </option>
              <option value="General Inquiry">General Inquiry / Other</option>
            </select>
          </div>

          <!-- Turnstile widget -->
          <div ref="turnstileContainer" />

          <p v-if="formError" class="text-sm text-destructive">
            {{ formError }}
          </p>

          <button
            type="submit"
            :disabled="!isSubmitEnabled"
            class="w-full bg-primary-500 disabled:bg-primary-500/90 text-white hover:opacity-90 font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 mt-2 text-sm flex justify-center items-center cursor-pointer"
          >
            <span v-if="isSubmitting" class="flex items-center gap-2">
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
            <span v-else>Apply Now</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
