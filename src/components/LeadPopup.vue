<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isVisible = ref(false);
const isSubmitting = ref(false);

const form = ref({
  name: '',
  phone: ''
});

onMounted(() => {
  const hasSeenPopup = sessionStorage.getItem('leadPopupShown');
  if (!hasSeenPopup) {
    // Show after a short delay
    setTimeout(() => {
      isVisible.value = true;
      sessionStorage.setItem('leadPopupShown', 'true');
    }, 1000);
  }
});

const closePopup = () => {
  isVisible.value = false;
};

const submitForm = async () => {
  isSubmitting.value = true;
  try {
    await fetch('https://example.com/lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    });
    // On success, close popup
    closePopup();
  } catch (error) {
    console.error('Error submitting form:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black/60 backdrop-blur-sm" 
      @click="closePopup"
    ></div>

    <!-- Dialog -->
    <div class="relative bg-background text-foreground rounded-2xl overflow-hidden max-w-4xl w-[90%] md:flex shadow-2xl animate-in fade-in zoom-in-95 duration-300">
      
      <!-- Close Button -->
      <button 
        @click="closePopup"
        class="absolute top-4 right-4 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors md:text-foreground md:bg-transparent md:hover:bg-muted"
        aria-label="Close dialog"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" class="stroke-current" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
        </svg>
      </button>

      <!-- Image Section -->
      <div class="md:w-1/2 h-56 md:h-auto relative bg-muted">
        <img 
          src="/Takshashila/students-view-back.jpg"
          alt="Complimentary Demo" 
          class="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      <!-- Form Section -->
      <div class="md:w-1/2 p-6 sm:p-10 flex flex-col justify-center">
        <h2 class="text-3xl md:text-4xl font-light tracking-tight text-primary mb-4 leading-tight">
          Experience Our Class
          <span class="block text-foreground text-2xl font-normal mt-1">with a Complimentary Demo!</span>
        </h2>
        <p class="text-muted-foreground mb-8">
          Register now and take the first step towards your civil services dream.
        </p>

        <form @submit.prevent="submitForm" class="space-y-5">
          <div>
            <label for="lead-name" class="block text-sm font-medium mb-1">Name</label>
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
            <label for="lead-phone" class="block text-sm font-medium mb-1">Phone Number</label>
            <input 
              id="lead-phone"
              v-model="form.phone"
              type="tel" 
              required
              class="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              placeholder="+91 98765 43210"
            />
          </div>

          <button 
            type="submit" 
            :disabled="isSubmitting"
            class="w-full bg-primary text-primary-foreground hover:opacity-90 font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 mt-4 flex justify-center items-center cursor-pointer"
          >
            <span v-if="isSubmitting" class="flex items-center gap-2">
              <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
