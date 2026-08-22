<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { cn } from "@/lib/utils";
import { whatsappUrl } from "@/config/CONSTANTS.ts";
import type { Course } from "@/content.config.ts";

const props = defineProps<{
  courses: Course[];
}>();

const activeTab = ref("All");

const filteredCourses = computed(() => {
  if (activeTab.value === "All") return props.courses;
  return props.courses.filter((course) =>
    course.categories
      .map((category) => {
        return category.toLowerCase().split(" ")?.[0];
      })
      .includes(activeTab.value.toLowerCase()),
  );
});
onMounted(() => {
  window.addEventListener("course-tab-change", (e) => {
    const customEvent = e as CustomEvent;
    if (customEvent.detail) {
      activeTab.value = customEvent.detail.tab;
    }
  });
});
</script>

<template>
  <Carousel class="w-full" :opts="{ align: 'start' }">
    <CarouselContent>
      <CarouselItem
        class="basis-[90%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 self-stretch"
        v-for="course in filteredCourses"
        :key="course.title"
      >
        <div class="p-1 h-full">
          <article
            :class="
              cn(
                'course-card  select-none active:cursor-grabbing h-full group relative flex flex-col  snap-center shrink-0 rounded-tl-[2rem] rounded-br-[2rem] border overflow-clip transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/5 hover:border-primary-500/20',
                course.popular
                  ? 'border-primary-500/50 shadow-lg bg-primary-500/1'
                  : 'border-gray-200 bg-white',
              )
            "
            :data-category="course.categories.join(',')"
          >
            <div class="relative aspect-16/10 overflow-hidden">
              <img
                :src="course.image"
                :alt="course.title"
                loading="lazy"
                width="800"
                height="500"
                class="w-full h-full object-cover"
              />
              <div
                class="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"
              ></div>

              <div
                v-if="course.popular"
                class="absolute top-5 right-5 bg-primary-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-xl z-10"
              >
                Most Popular
              </div>
            </div>

            <a :href="`${course.url}`" class="flex flex-col flex-1 p-6 md:p-8">
              <h3
                class="text-lg md:text-xl font-medium tracking-tight mb-3 group-hover:text-primary-500 transition-colors leading-tight"
              >
                {{ course.title }}
              </h3>

              <div
                class="h-1 w-12 bg-primary-500/10 rounded-full mb-6 group-hover:w-20 transition-all duration-500"
              >
                <div
                  class="h-1 w-6 bg-primary-500 rounded-full group-hover:w-10 transition-all duration-500"
                ></div>
              </div>

              <!--            <div v-if="course.price" class="mb-5 flex items-center">-->
              <!--                <span class="text-base font-bold text-primary-500 bg-primary-500/5 px-3 py-1 rounded-lg border border-primary-500/10 tracking-tight">-->
              <!--                  {{ course.price }}-->
              <!--                </span>-->
              <!--            </div>-->

              <p
                class="text-gray-600 line-clamp-3 font-light text-sm md:text-base leading-relaxed opacity-90"
              >
                {{ course.description }}
              </p>
            </a>
            <div class="flex gap-0">
              <a
                href="#enroll"
                :class="
                  cn(
                    'inline-flex h-14 items-center justify-center  px-8 text-sm font-semibold transition-all flex-1 gap-2 group/btn',
                    course.popular
                      ? 'bg-primary-500 text-white hover:bg-primary-500/90 shadow-lg shadow-primary-500/20'
                      : 'border-t border-r border-gray-200 bg-white hover:bg-gray-100 hover:border-primary-500/30 cursor-pointer',
                  )
                "
              >
                Enroll Now
                <ArrowRight
                  class="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                />
              </a>
              <a
                :href="
                  whatsappUrl(
                    `Hi, I'm interested in the ${course.title} course.`,
                  )
                "
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex h-14 w-14 items-center justify-center rounded-br-2xl border-t border-l border-gray-200 bg-white hover:bg-gray-100 hover:border-[#25D366] hover:text-[#25D366] transition-all group/wa"
                title="Enquire on WhatsApp"
              >
                <svg
                  class="w-6 h-6 fill-current transition-transform group-hover/wa:scale-110"
                  viewBox="0 0 448 512"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>WhatsApp</title>
                  <path
                    d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.1 0-65.6-8.9-93.9-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.6-30.6-38.1-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.6-9.3 1.9-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"
                  />
                </svg>
              </a>
            </div>
          </article>
        </div>
      </CarouselItem>
    </CarouselContent>
  </Carousel>
</template>
