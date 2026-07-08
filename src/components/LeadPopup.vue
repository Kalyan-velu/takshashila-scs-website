<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import variables from "@/config/variables.ts";
import { useTurnstile } from "@/lib/useTurnstile";
import { submitLead } from "@/lib/submitLead";

const cloudflare_site_key = variables.CLOUDFLARE_SITE_KEY;

const form = ref({ name: "", phone: "", email: "" });
const isVisible = ref(false);
const isSubmitting = ref(false);
const fieldErrors = ref<Record<string, string>>({});
const formError = ref<string | null>(null);

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

function handleClose(e: KeyboardEvent) {
  if (e.key === "Escape") {
    e.preventDefault();
    closePopup();
    sessionStorage.setItem("leadPopupClosed", "true");
  }
}

onMounted(async () => {
  if (
    sessionStorage.getItem("leadPopupClosed") === "true" ||
    localStorage.getItem("leadPopupSubmitted") === "true"
  ) {
    return;
  } else {
    isVisible.value = true;
  }
  window.addEventListener("keydown", handleClose);
  // Wait for the v-if to actually mount the container element before
  // trying to render the widget into it.
  await nextTick();
  console.log(turnstileContainer.value);
  mountTurnstile();
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleClose);
});

const closePopup = () => {
  isVisible.value = false;
  sessionStorage.setItem("leadPopupClosed", "true");
};

const submitForm = async () => {
  if (!turnstileToken.value) return;
  isSubmitting.value = true;
  fieldErrors.value = {};
  formError.value = null;
  try {
    const result = await submitLead({
      name: form.value.name,
      phone: form.value.phone,
      email: form.value.email,
      source: "lead-popup",
      cfTurnstileResponse: turnstileToken.value,
    });

    if (result.success) {
      closePopup();
      localStorage.setItem("leadPopupSubmitted", "true");
      return;
    }

    if (result.code === "VALIDATION_ERROR") {
      fieldErrors.value = Object.fromEntries(
        Object.entries(result.fieldErrors).map(([field, messages]) => [
          field,
          messages?.[0] ?? "",
        ]),
      );
      // A validation error on the captcha token itself isn't shown next to
      // a field, since there's no input for it — surface it as a banner
      // and force the user to re-verify.
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
  <div
    v-if="isVisible"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
  >
    <div
      class="absolute inset-0 bg-black/60 backdrop-blur-sm"
      @click="closePopup"
    ></div>

    <div
      class="relative bg-background text-foreground rounded-2xl overflow-hidden max-w-4xl w-[90%] md:flex shadow-2xl animate-in fade-in zoom-in-95 duration-300"
    >
      <button
        @click="closePopup"
        class="absolute top-4 right-4 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors md:text-foreground md:bg-transparent md:hover:bg-muted"
        aria-label="Close dialog"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
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

      <div class="md:w-1/2 h-56 md:h-auto relative bg-muted">
        <img
          src="/Takshasheela/students-view-back.jpg"
          alt="Complimentary Demo"
          loading="lazy"
          class="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      <div class="md:w-1/2 p-6 sm:p-10 flex flex-col justify-center">
        <h2
          class="text-3xl md:text-4xl font-light tracking-tight text-primary mb-4 leading-tight"
        >
          Experience Our Class
          <span class="block text-foreground text-2xl font-normal mt-1"
            >with a Complimentary Demo!</span
          >
        </h2>
        <p class="text-muted-foreground mb-8">
          Register now and take the first step towards your civil services
          dream.
        </p>

        <form @submit.prevent="submitForm" class="space-y-5">
          <div>
            <label for="lead-name" class="block text-sm font-medium mb-1"
              >Name</label
            >
            <input
              id="lead-name"
              v-model="form.name"
              type="text"
              required
              :class="[
                'w-full px-4 py-2.5 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all',
                fieldErrors.name
                  ? 'border-destructive focus:border-destructive'
                  : 'border-border focus:border-primary',
              ]"
              placeholder="Your full name"
            />
            <p v-if="fieldErrors.name" class="mt-1 text-sm text-destructive">
              {{ fieldErrors.name }}
            </p>
          </div>
          <div>
            <label for="lead-email" class="block text-sm font-medium mb-1"
              >Email</label
            >
            <input
              id="lead-email"
              v-model="form.email"
              type="email"
              required
              :class="[
                'w-full px-4 py-2.5 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all',
                fieldErrors.email
                  ? 'border-destructive focus:border-destructive'
                  : 'border-border focus:border-primary',
              ]"
              placeholder="Enter your email"
            />
            <p v-if="fieldErrors.email" class="mt-1 text-sm text-destructive">
              {{ fieldErrors.email }}
            </p>
          </div>

          <div>
            <label for="lead-phone" class="block text-sm font-medium mb-1"
              >Phone Number</label
            >
            <input
              id="lead-phone"
              v-model="form.phone"
              type="tel"
              required
              :class="[
                'w-full px-4 py-2.5 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all',
                fieldErrors.phone
                  ? 'border-destructive focus:border-destructive'
                  : 'border-border focus:border-primary',
              ]"
              placeholder="+91 98765 43210"
            />
            <p v-if="fieldErrors.phone" class="mt-1 text-sm text-destructive">
              {{ fieldErrors.phone }}
            </p>
          </div>
          <!-- Turnstile widget -->
          <div ref="turnstileContainer" />

          <p v-if="formError" class="text-sm text-destructive">
            {{ formError }}
          </p>

          <button
            type="submit"
            :disabled="!isSubmitEnabled"
            class="w-full bg-primary disabled:bg-primary/90 text-primary-foreground hover:opacity-90 font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 mt-4 flex justify-center items-center cursor-pointer"
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
            <span v-else>Claim My Free Demo</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
