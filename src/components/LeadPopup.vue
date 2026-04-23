<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { supabase } from "@/lib/db/supabase.ts";
import variables from "@/config/variables.ts";

const cloudflare_site_key = variables.CLOUDFLARE_SITE_KEY;

const form = ref({ name: "", phone: "", email: "" });
const isVisible = ref(true);
const isSubmitting = ref(false);
const isCaptchaVerified = ref(false);
const turnstileContainer = ref<HTMLElement | null>(null);
let widgetId: string | null = null;

const isSubmitEnabled = computed(
  () =>
    form.value.name.trim() !== "" &&
    form.value.email.trim() !== "" &&
    form.value.phone.trim() !== "" &&
    isCaptchaVerified.value &&
    !isSubmitting.value,
);

onMounted(() => {
  if (!turnstileContainer.value) return;

  const renderWidget = () => {
    widgetId = window.turnstile.render(turnstileContainer.value!, {
      sitekey: cloudflare_site_key,
      callback: () => {
        isCaptchaVerified.value = true;
      },
      "expired-callback": () => {
        isCaptchaVerified.value = false;
      },
      "error-callback": () => {
        isCaptchaVerified.value = false;
      },
    });
  };

  if (window.turnstile) {
    // Already loaded (e.g. hot reload / navigating back)
    renderWidget();
    return;
  }

  // Inject the script fresh, with onload callback
  const existing = document.querySelector('script[src*="turnstile"]');
  if (existing) {
    // Script tag exists but hasn't finished — wait for it
    existing.addEventListener("load", renderWidget);
    return;
  }

  const script = document.createElement("script");
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
  script.async = true;
  script.defer = true;
  script.onload = renderWidget;
  document.head.appendChild(script);
});
onBeforeUnmount(() => {
  if (widgetId) window.turnstile.remove(widgetId);
});

const closePopup = () => {
  isVisible.value = false;
};

const submitForm = async () => {
  isSubmitting.value = true;
  try {
    await supabase.from("Leads").insert({
      name: form.value.name,
      phone: form.value.phone,
      email: form.value.email,
      address: null,
      source: "lead-popup",
    });
    closePopup();
  } catch (error) {
    console.error("Error submitting form:", error);
    alert("Failed to submit. Please try again later.");
    // Reset captcha on failure so user can retry
    if (widgetId) window.turnstile.reset(widgetId);
    isCaptchaVerified.value = false;
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
          src="/Takshashila/students-view-back.jpg"
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
              class="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              placeholder="Your full name"
            />
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
              class="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              placeholder="Enter your email"
            />
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
              class="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              placeholder="+91 98765 43210"
            />
          </div>
          <!-- Turnstile widget -->
          <div ref="turnstileContainer" />

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
