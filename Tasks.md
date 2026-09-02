# SEO Implementation Tasks — takshashilascs.com

Based on competitor teardown of Borthakur's IAS Academy (admission.borthakursiasacademy.com) and
Bhadra IAS Academy (bhadraiasacademy.in), compared against the current homepage build (Astro v7,
Vue islands, Tailwind v4, GTM via Partytown).

**Target keywords (homepage cluster):** `apsc coaching in guwahati`, `upsc coaching in guwahati`,
`best apsc coaching in guwahati`, `adre coaching`, `apsc online coaching`.

**Priority legend:** P0 = highest ranking impact, do first. P1 = high. P2 = hygiene/bugs.

---

## TASK 1 (P0) — Add a Social Proof / Results section to the homepage

### Why

This is the single largest gap vs. both competitors. Borthakur leads with "325+ Selections in
APSC CCE 2022-23" + result-card carousels + topper videos. Bhadra has named toppers with ranks,
counters (5,237 enrolled), 22 schema-marked testimonial videos, and "1,200 Google reviews".
The current homepage has zero proof elements. Both users and Google's ranking of "best coaching"
queries reward this heavily.

### What to build

A new `<ResultsSection />` Astro component placed **directly after the hero section** (before
`#about`), containing:

1. **Stat counters** (server-rendered numbers, optional client-side count-up animation):
   - Selections (e.g. "120+ Selections") — use real numbers only
   - Students trained (e.g. "2,000+ Students")
   - Years of mentorship
   - Faculty count / mock tests conducted
2. **Named toppers strip** — 3 to 6 cards: photo, name, exam + rank + year
   (e.g. "Priya Das — APSC CCE 2023, ACS Rank 12"). Real, verifiable entries only.
3. **1–3 video testimonials** — lazy YouTube embeds (facade pattern: thumbnail + play button,
   iframe injected on click, to protect page speed).
4. **Google rating badge** — only if the Google Business Profile rating is genuinely good;
   link the badge to the GBP reviews URL. Do NOT self-declare aggregateRating in schema
   (see Task 4 note).

### Implementation — `src/components/ResultsSection.astro`

```astro
---
// ResultsSection.astro — server-rendered social proof
interface Topper {
  name: string;
  exam: string; // e.g. "APSC CCE 2023"
  rank: string; // e.g. "ACS Rank 12"
  image: string; // e.g. "/Takshasheela/toppers/priya-das.webp"
}

// REPLACE with real data before shipping.
const stats = [
  { value: "120+", label: "Selections in APSC, UPSC & ADRE" },
  { value: "2,000+", label: "Students Trained" },
  { value: "15+", label: "Expert Faculty from Delhi & Assam" },
  { value: "500+", label: "Mock Tests Conducted" },
];

const toppers: Topper[] = [
  // { name: "Full Name", exam: "APSC CCE 2023", rank: "ACS Rank 12", image: "/Takshasheela/toppers/name.webp" },
];

// YouTube video IDs of testimonial videos (from the institute's channel)
const testimonialVideos: { id: string; title: string }[] = [
  // { id: "XXXXXXXXXXX", title: "Topper Name — ACS Rank 12 | Takshasheela Success Story" },
];
---

<section id="results" class="pb-12 lg:pb-24 bg-background">
  <div class="px-4 md:px-6 lg:max-w-7xl mx-auto">
    <h2
      class="text-3xl md:text-5xl font-light tracking-tight text-foreground mb-4"
    >
      Results That Make Us the Best APSC &amp; UPSC Coaching in Guwahati
    </h2>
    <p class="text-muted-foreground font-light text-lg max-w-2xl mb-12">
      Our students' selections in APSC CCE, UPSC CSE and ADRE speak for
      themselves.
    </p>

    <!-- Stat counters -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      {
        stats.map((s) => (
          <div class="rounded-3xl border border-border bg-card p-6 text-center">
            <div class="text-3xl md:text-4xl font-medium text-primary mb-1">
              {s.value}
            </div>
            <div class="text-sm font-light text-muted-foreground">
              {s.label}
            </div>
          </div>
        ))
      }
    </div>

    <!-- Named toppers -->
    {
      toppers.length > 0 && (
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          {toppers.map((t) => (
            <div class="rounded-2xl overflow-hidden border border-border bg-card">
              <img
                src={t.image}
                alt={`${t.name} — ${t.rank}, ${t.exam} — Takshasheela School of Civil Services`}
                width="300"
                height="300"
                loading="lazy"
                decoding="async"
                class="w-full aspect-square object-cover"
              />
              <div class="p-3">
                <div class="text-sm font-medium text-foreground">{t.name}</div>
                <div class="text-xs text-muted-foreground">
                  {t.rank} · {t.exam}
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    <!-- Video testimonials (facade pattern, no iframe until click) -->
    {
      testimonialVideos.length > 0 && (
        <div class="grid md:grid-cols-3 gap-6">
          {testimonialVideos.map((v) => (
            <button
              type="button"
              class="yt-facade group relative aspect-video rounded-2xl overflow-hidden border border-border"
              data-yt-id={v.id}
              aria-label={`Play video: ${v.title}`}
            >
              <img
                src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                alt={v.title}
                width="480"
                height="360"
                loading="lazy"
                decoding="async"
                class="w-full h-full object-cover"
              />
              <span class="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                <span class="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                  <svg
                    class="w-5 h-5 fill-white ml-0.5"
                    viewBox="0 0 384 512"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
                  </svg>
                </span>
              </span>
            </button>
          ))}
        </div>
      )
    }
  </div>
</section>

<script>
  function initYtFacades() {
    document
      .querySelectorAll<HTMLButtonElement>(".yt-facade")
      .forEach((btn) => {
        if (btn.dataset.bound === "1") return;
        btn.dataset.bound = "1";
        btn.addEventListener("click", () => {
          const id = btn.dataset.ytId;
          if (!id) return;
          const iframe = document.createElement("iframe");
          iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
          iframe.allow =
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
          iframe.allowFullscreen = true;
          iframe.className = "absolute inset-0 w-full h-full";
          iframe.title = btn.getAttribute("aria-label") ?? "Testimonial video";
          btn.replaceChildren(iframe);
        });
      });
  }
  initYtFacades();
  document.addEventListener("astro:page-load", initYtFacades);
</script>
```

### Wiring

In `src/pages/index.astro` (or wherever the homepage sections are composed), import and place:

```astro
import ResultsSection from "../components/ResultsSection.astro"; ...
<HeroSection />
<ResultsSection />
<AboutSection />
<!-- existing #about -->
```

### Acceptance criteria

- [ ] Section renders server-side (numbers/names present in View Source, not injected by JS).
- [ ] All numbers/names are real and verifiable; no invented figures.
- [ ] No YouTube iframe loads before user click (verify in Network tab).
- [ ] Lighthouse performance score unchanged (±2).

---

## TASK 2 (P0) — Put the target keyword in the H1 and section headings

### Why

Both competitors have the exact keyword in the H1; ours is in a decorative badge span with no
heading weight. Current H1: "Turning civil service aspirations into achievements".

### Changes (hero component, `data-astro-cid-ge2uvauf` section)

**Option A (recommended — keyword-first H1, brand line as subhead):**

```astro
<h1
  class="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-foreground max-w-4xl mb-4 sm:mb-6 md:leading-[1.1]"
>
  The Best UPSC &amp; APSC Coaching in Guwahati
</h1>
<p class="text-2xl sm:text-3xl text-primary font-light tracking-tight mb-4">
  Turning civil service aspirations into achievements
</p>
```

**Option B (minimal diff — keep visual design, merge keyword into H1):**

```astro
<h1 class="...existing classes...">
  <span class="block text-base sm:text-lg font-medium text-primary mb-2">
    Best UPSC &amp; APSC Coaching in Guwahati
  </span>
  Turning civil service
  <span class="text-primary relative lg:whitespace-nowrap">
    <span class="relative">aspirations into achievements</span>
  </span>
</h1>
```

(With Option B, delete the separate badge div, or keep the badge but remove its text from
being the only keyword occurrence.)

**Section heading updates (find & replace):**

| Current                                           | New                                                               |
| ------------------------------------------------- | ----------------------------------------------------------------- |
| `Why We Are the Best Coaching Center in Guwahati` | `Why We Are the Best UPSC &amp; APSC Coaching Center in Guwahati` |
| `Our Popular Courses`                             | `Our APSC, UPSC &amp; ADRE Coaching Courses`                      |
| `Our Gallery`                                     | keep as-is (no keyword needed everywhere)                         |

### Acceptance criteria

- [ ] Exactly one `<h1>` on the page, containing "UPSC", "APSC", and "Guwahati".
- [ ] Keyword appears in 2–3 `<h2>` headings total — no more (avoid Borthakur-level stuffing).
- [ ] Visual design approved on mobile + desktop.

---

## TASK 3 (P0) — Add an FAQ section with FAQPage schema

### Why

Neither competitor has FAQ content or FAQPage markup — this is an uncontested lane for
question-query long-tails ("which is the best apsc coaching in guwahati", "apsc coaching fees")
and adds keyword-relevant prose Google can index.

### Implementation — `src/components/FaqSection.astro`

```astro
---
const faqs = [
  {
    q: "Which is the best APSC coaching institute in Guwahati?",
    a: "Takshasheela School of Civil Services is regarded as one of the best APSC coaching institutes in Guwahati, with experienced faculty from Delhi and Assam, comprehensive APSC CCE syllabus coverage including Assam History, Assam Geography and Polity, regular mock tests, and both online and offline batches.",
  },
  {
    q: "Does Takshasheela offer online APSC and UPSC coaching?",
    a: "Yes. All our APSC, UPSC and ADRE courses are available in both online and offline modes. Online students get live classes, recorded lectures for revision, digital study material and online mock tests.",
  },
  {
    q: "What is the fee for APSC coaching at Takshasheela?",
    a: "The APSC Foundation Batch (12 months) starts at ₹22,000 for online and ₹42,500 for offline after discount. Visit our Courses page or call +91 60016-57575 for current fee details and instalment options.",
  },
  {
    q: "Do you provide coaching for ADRE (Assam Direct Recruitment Exam)?",
    a: "Yes. We run a dedicated ADRE online batch (3–6 months) covering the complete ADRE syllabus with targeted practice tests. Admissions for the ADRE 2026 batch are open.",
  },
  {
    q: "Where is Takshasheela School of Civil Services located?",
    a: "We are located on the 6th Floor, Unique Avenue Building, near Super Market, Guwahati, Assam 781006. The centre is easily reachable from all parts of Guwahati.",
  },
  {
    q: "Does Takshasheela provide study materials and mock tests?",
    a: "Yes. Students receive curated study materials, a monthly current affairs magazine, and regular prelims and mains mock tests with detailed evaluation and feedback.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};
---

<section id="faq" class="pb-12 lg:pb-24 bg-background">
  <div class="px-4 md:px-6 lg:max-w-4xl mx-auto">
    <h2
      class="text-3xl md:text-5xl font-light tracking-tight text-foreground mb-10"
    >
      Frequently Asked Questions
    </h2>
    <div class="flex flex-col gap-4">
      {
        faqs.map((f) => (
          <details class="group rounded-2xl border border-border bg-card px-6 py-4">
            <summary class="cursor-pointer list-none flex items-center justify-between text-base md:text-lg font-medium text-foreground">
              {f.q}
              <svg
                class="w-5 h-5 shrink-0 transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>
            <p class="mt-3 text-sm md:text-base font-light text-muted-foreground leading-relaxed">
              {f.a}
            </p>
          </details>
        ))
      }
    </div>
  </div>
</section>

<script type="application/ld+json" set:html={JSON.stringify(faqSchema)} />
```

Place after the courses section, before the gallery.

### Acceptance criteria

- [ ] Answers match on-page text exactly (Google requirement for FAQ markup).
- [ ] Fees in answers match the Courses data (update both together).
- [ ] Validates in Google Rich Results Test with zero errors.
- [ ] `<details>/<summary>` works without JS (progressive enhancement — it does natively).

---

## TASK 4 (P1) — Enrich structured data (Organization + Course; skip fake ratings)

### Why

Current `EducationalOrganization` schema has only locality/region/country. Bhadra ships full
LocalBusiness NAP + hours. The footer already contains all the data — mirror it into JSON-LD.
Also add `Course` schema (neither competitor has it) using the data already present in the
`CoursesCarousel` props.

### 4a. Replace the head JSON-LD block

```astro
---
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "@id": "https://takshashilascs.com/#organization",
  name: "Takshasheela School of Civil Services",
  alternateName: "Takshasheela SCS",
  description:
    "Takshasheela School of Civil Services is the best UPSC and APSC coaching institute in Guwahati, Assam, offering online and offline batches for UPSC CSE, APSC CCE and ADRE preparation.",
  url: "https://takshashilascs.com/",
  logo: "https://takshashilascs.com/logo-full-black.png",
  image: "https://takshashilascs.com/og/index.png",
  telephone: "+91-6001657575",
  email: "info@takshashilascs.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "6th Floor, Unique Avenue Building, near Super Market",
    addressLocality: "Guwahati",
    addressRegion: "Assam",
    postalCode: "781006",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    // TODO: replace with exact coordinates from Google Maps pin
    latitude: 26.14,
    longitude: 91.78,
  },
  areaServed: { "@type": "State", name: "Assam" },
  sameAs: [
    "https://www.facebook.com/takshashilascs",
    "https://www.instagram.com/takshashilascs",
    "https://twitter.com/takshashilascs",
    // TODO: add YouTube channel URL
  ],
};
---

<script type="application/ld+json" set:html={JSON.stringify(orgSchema)} />
```

### 4b. Course schema (single ItemList block on the homepage)

```astro
---
const courseSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Course",
        name: "APSC Foundation Batch",
        description:
          "12-month APSC CCE coaching covering the complete syllabus including Assam History, Assam Geography and Polity, GS and CSAT, with regular mock tests. Online and offline modes.",
        url: "https://takshashilascs.com/courses/apsc/",
        provider: { "@id": "https://takshashilascs.com/#organization" },
        hasCourseInstance: [
          {
            "@type": "CourseInstance",
            courseMode: "online",
            courseWorkload: "P12M",
            offers: { "@type": "Offer", price: "22000", priceCurrency: "INR" },
          },
          {
            "@type": "CourseInstance",
            courseMode: "onsite",
            courseWorkload: "P12M",
            offers: { "@type": "Offer", price: "42500", priceCurrency: "INR" },
          },
        ],
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "Course",
        name: "UPSC Foundation Batch",
        description:
          "Comprehensive 12-month UPSC CSE coaching in Guwahati with expert mentors from Delhi and across India. Online and offline modes.",
        url: "https://takshashilascs.com/courses/upsc/",
        provider: { "@id": "https://takshashilascs.com/#organization" },
        hasCourseInstance: [
          {
            "@type": "CourseInstance",
            courseMode: "online",
            courseWorkload: "P12M",
            offers: { "@type": "Offer", price: "25000", priceCurrency: "INR" },
          },
          {
            "@type": "CourseInstance",
            courseMode: "onsite",
            courseWorkload: "P12M",
            offers: { "@type": "Offer", price: "62500", priceCurrency: "INR" },
          },
        ],
      },
    },
    {
      "@type": "ListItem",
      position: 3,
      item: {
        "@type": "Course",
        name: "ADRE Online Batch",
        description:
          "Specialized 3–6 month online course for the Assam Direct Recruitment Exam (ADRE) with targeted preparation and mock tests.",
        url: "https://takshashilascs.com/courses/adre/",
        provider: { "@id": "https://takshashilascs.com/#organization" },
        hasCourseInstance: [
          {
            "@type": "CourseInstance",
            courseMode: "online",
            courseWorkload: "P6M",
          },
        ],
      },
    },
  ],
};
---

<script type="application/ld+json" set:html={JSON.stringify(courseSchema)} />
```

> Prices above are computed as original − discount from the current carousel props
> (26400−4400=22000, 51000−8500=42500, 31250−6250=25000, 75000−12500=62500).
> Keep schema prices and on-page prices in sync — ideally derive both from one data file
> (e.g. `src/data/courses.ts`) imported by both the carousel and the schema block.

### 4c. Explicitly do NOT do

- **No self-declared `aggregateRating`.** Bhadra hardcodes 5/5 × 1,188 — this violates Google's
  review-snippet guidelines (rating must come from on-page user reviews) and is a manual-action
  risk. Earn stars via Google Business Profile instead.

### Acceptance criteria

- [ ] All blocks pass Google Rich Results Test and Schema.org validator.
- [ ] `geo` coordinates match the GBP pin.
- [ ] Course prices match visible on-page prices.

---

## TASK 5 (P1) — Add keyword-relevant prose content to the homepage

### Why

Borthakur's page includes a full APSC syllabus with Assam-specific subjects; Bhadra has six
prose blocks. Our homepage prose is a few card descriptions — too thin for topical depth.

### What to add

A ~350–500 word "About our coaching" prose section (2–4 paragraphs + one syllabus list),
placed between `#about` and `#courses`. Draft copy (edit freely, keep the bolded entities):

```html
<section id="coaching-in-guwahati" class="pb-12 lg:pb-24 bg-background">
  <div class="px-4 md:px-6 lg:max-w-4xl mx-auto flex flex-col gap-6">
    <h2 class="text-3xl md:text-4xl font-light tracking-tight text-foreground">
      APSC, UPSC &amp; ADRE Coaching in Guwahati — What We Cover
    </h2>
    <p class="text-muted-foreground font-light leading-relaxed">
      Takshasheela School of Civil Services provides complete preparation for
      the
      <strong>APSC Combined Competitive Examination (CCE)</strong>, the
      <strong>UPSC Civil Services Examination</strong> and the
      <strong>Assam Direct Recruitment Exam (ADRE)</strong> from our centre in
      Guwahati and through live online classes across Assam and the Northeast.
    </p>
    <p class="text-muted-foreground font-light leading-relaxed">
      Our APSC CCE programme covers the full Prelims and Mains syllabus — Indian
      History, Polity and Governance, Geography, Economy, Science &amp;
      Technology, Environment, Ethics and Current Affairs — along with the
      Assam-specific portions that decide ranks: <strong>Assam History</strong>,
      <strong>Assam Geography and Polity</strong>,
      <strong>Assam Art &amp; Culture</strong> and the
      <strong>Assam Year Book</strong>. CSAT preparation, answer-writing
      practice for Mains, and previous year question analysis are built into
      every batch.
    </p>
    <p class="text-muted-foreground font-light leading-relaxed">
      Classes run in both <strong>online and offline modes</strong>, with
      recorded lectures available for revision, a monthly current affairs
      magazine, an advanced library, and regular full-length and sectional mock
      tests with individual feedback. Faculty with 5–20 years of experience from
      Delhi and across India mentor every batch, making Takshasheela the most
      complete option for civil services preparation in Guwahati.
    </p>
  </div>
</section>
```

### Acceptance criteria

- [ ] 300+ words of indexable prose in the HTML (View Source, not JS-injected).
- [ ] Assam-specific subject terms present (regional relevance signal).
- [ ] Reads naturally — no keyword appears more than ~4 times across the section.

---

## TASK 6 (P1) — Server-render CoursesCarousel and LatestArticles content

### Why

Both are `client:only="vue"` islands. Course titles/descriptions/prices exist only inside the
escaped JSON `props` attribute; LatestArticles content is not in the HTML at all. This throws
away semantic headings and internal links from the crawled HTML.

### Approach

1. Move course data out of the page into `src/data/courses.ts` (single source of truth,
   also feeds Task 4b schema and Task 3 fee answers):

```ts
// src/data/courses.ts
export interface CoursePrice {
  original: number;
  discount: number;
}
export interface Course {
  id: string;
  title: string;
  description: string;
  categories: string[];
  image: string;
  duration: string;
  highlights: string[];
  modes: ("online" | "offline")[];
  url: string;
  popular?: boolean;
  prices?: { online?: CoursePrice; offline?: CoursePrice };
}

export const courses: Course[] = [
  {
    id: "adre",
    title: "ADRE Online (New)",
    description:
      "New specialized online course for ADRE, designed to give you a competitive edge in state government exams with targeted preparation strategies.",
    popular: true,
    categories: ["ADRE Courses"],
    image: "/Takshasheela/admission-square.jpeg",
    duration: "3 to 6 months",
    highlights: [
      "Expert mentors from Delhi and across India",
      "Comprehensive syllabus coverage",
      "Regular mock tests for practice",
    ],
    modes: ["online"],
    url: "/courses/adre/",
  },
  {
    id: "apsc-foundation-batch",
    title: "APSC Foundation Batch",
    description:
      "Flexible and dedicated APSC coaching tailored for success. Our foundation batch covers the complete syllabus with expert guidance and regular mock tests.",
    prices: {
      online: { original: 26400, discount: 4400 },
      offline: { original: 51000, discount: 8500 },
    },
    categories: ["APSC Courses"],
    image: "/Takshasheela/admission-square.jpeg",
    duration: "12 months",
    highlights: [
      "Expert mentors from Delhi and across India",
      "Comprehensive syllabus coverage",
      "Regular mock tests for practice",
    ],
    modes: ["online", "offline"],
    url: "/courses/apsc/",
  },
  {
    id: "weekend-batch-apsc",
    title: "Weekend Batch (APSC)",
    description:
      "Designed specifically for working professionals. Master your preparation with dedicated classes exclusively on weekends without compromising your career.",
    prices: {
      online: { original: 26400, discount: 4400 },
      offline: { original: 51000, discount: 8500 },
    },
    categories: ["APSC Courses", "Working-Professionals"],
    image: "/Takshasheela/admission-square.jpeg",
    duration: "12 months",
    highlights: [
      "Expert mentors from Delhi and across India",
      "Comprehensive syllabus coverage",
      "Regular mock tests for practice",
    ],
    modes: ["online", "offline"],
    url: "/courses/apsc/",
  },
  {
    id: "upsc-foundation-batch",
    title: "UPSC Foundation Batch",
    description:
      "Enroll now for the most comprehensive UPSC coaching in Guwahati. Available in both online and offline modes with expert mentors from Delhi and across India.",
    prices: {
      online: { original: 31250, discount: 6250 },
      offline: { original: 75000, discount: 12500 },
    },
    categories: ["UPSC Courses"],
    image: "/Takshasheela/admission-square.jpeg",
    duration: "12 months",
    highlights: [
      "Expert mentors from Delhi and across India",
      "Comprehensive syllabus coverage",
      "Regular mock tests for practice",
    ],
    modes: ["online", "offline"],
    url: "/courses/upsc/",
  },
];
```

2. Change the island directive from `client:only="vue"` to `client:load` (or `client:visible`)
   so Astro SSRs the initial markup and the Vue component hydrates for tab filtering:

```astro
---
import CoursesCarousel from "../components/CoursesCarousel.vue";
import { courses } from "../data/courses";
---

<CoursesCarousel courses={courses} client:visible />
```

`client:only` skips SSR entirely; `client:visible` renders HTML at build time and hydrates
when scrolled into view. Verify the Vue component doesn't touch `window`/`document` at
setup top-level (guard with `onMounted` if it does), otherwise SSR will throw at build.

3. Inside the Vue component, ensure each card title is a heading + link:

```html
<h3 class="text-xl font-medium">
  <a :href="course.url">{{ course.title }}</a>
</h3>
```

4. Same treatment for `LatestArticles`: fetch the articles at build/render time in the Astro
   frontmatter and pass them as props with `client:visible` (or render fully static if there's
   no interactivity). If the article source is the currentaffairs subdomain API, fetch it in
   frontmatter:

```astro
---
const res = await fetch(
  "https://currentaffairs.takshashilascs.com/api/latest?limit=6",
);
const articles = res.ok ? await res.json() : [];
---

<LatestArticles articles={articles} client:visible />
```

### Acceptance criteria

- [ ] Course titles, descriptions, and `/courses/...` links visible in raw View Source.
- [ ] Latest article titles + links present in raw HTML.
- [ ] Tab filtering still works after hydration.
- [ ] `pnpm build` passes with no SSR errors (watch for `window is not defined`).

---

## TASK 7 (P2) — Bug fixes

### 7a. Wrong domain in Courses mega-menu

`Header` component: the dropdown "Current Affairs" item links to
`https://currentaffairs.takshashila.com/` (missing `scs`) while the top-level nav item links to
`https://currentaffairs.takshashilascs.com`. Fix the dropdown to the correct domain.

```diff
- <a href="https://currentaffairs.takshashila.com/" ...>
+ <a href="https://currentaffairs.takshashilascs.com/" ...>
```

### 7b. Footer + mobile-menu social icons link to `#`

Footer component and mobile menu: three social anchors have `href="#"`. Replace with the real
URLs (same as the desktop top bar):

```html
<a
  href="https://www.facebook.com/takshashilascs"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Facebook"
  ...
>
  <a
    href="https://twitter.com/takshashilascs"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Twitter/X"
    ...
  >
    <a
      href="https://www.instagram.com/takshashilascs"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram"
      ...
    ></a></a
></a>
```

Also add `aria-label` to each (currently missing in footer) and add the YouTube channel if one
exists.

### 7c. Brochure `download` attribute

The attribute value should be a filename, not a URL:

```diff
- <a target="_blank" download="https://pub-...r2.dev/.../TSCS-Brochure-2026-new_compressed.pdf" href="https://pub-...">
+ <a href="https://storage.takshashilascs.com/brand_site/pdfs/TSCS-Brochure-2026-new_compressed.pdf"
+    download="TSCS-Brochure-2026.pdf" target="_blank" rel="noopener">
```

Note: cross-origin `download` is ignored by browsers unless the R2 bucket sends
`Content-Disposition: attachment`. If forced download matters, set that header on the R2 object;
otherwise the attribute is harmless but cosmetic.

### 7d. Remove `meta keywords`

Google ignores it; the current 27-phrase list reads as spam to anyone viewing source and hands
competitors your keyword map. Delete the tag.

### 7e. Verify Twitter handle

`meta name="twitter:creator"` says `@takshashila` but the profile URL used elsewhere is
`twitter.com/takshashilascs`. Confirm which handle the institute owns and make both consistent.

### 7f. Footer picture element

`<source srcset="/logo.webp" type="image/avif">` declares a webp file as avif. Either provide a
real `.avif` or drop the avif source:

```html
<picture>
  <source srcset="/logo.webp" type="image/webp" />
  <img
    src="/logo.webp"
    alt="Takshasheela Logo"
    width="160"
    height="40"
    loading="lazy"
    decoding="async"
    class="h-10 object-contain w-auto"
  />
</picture>
```

---

## TASK 8 (P2) — Off-page follow-ups (not code, but on the critical path)

1. **Google Business Profile**: ensure NAP exactly matches the footer/schema
   ("Takshasheela School of Civil Services", 6th Floor Unique Avenue Building, 781006,
   +91 60016-57575). Actively collect student reviews — Bhadra's "1,200 reviews" claim is a
   major trust signal we currently can't counter.
2. **YouTube**: title topper/testimonial videos with the pattern that works for Bhadra —
   `"<Name>, <Rank> | APSC Coaching in Guwahati | Takshasheela"` — and link the channel in
   schema `sameAs` and the footer.
3. **Dedicated landing pages** (next sprint): `/apsc-coaching-in-guwahati/` and
   `/upsc-coaching-in-guwahati/` — long-form pages combining Task 5-style prose, results,
   FAQ and lead capture, internally linked from the homepage prose and course pages.
   (This mirrors the Bhadra nav-slug tactic and the Borthakur dedicated-page tactic while
   staying clean.)

---

## Rollout order & verification

| Order                                                                                    | Task                     | Est. effort                 | Verify with                              |
| ---------------------------------------------------------------------------------------- | ------------------------ | --------------------------- | ---------------------------------------- |
| 1                                                                                        | Task 2 (H1/headings)     | 1–2 h                       | View Source: one H1 with keyword         |
| 2                                                                                        | Task 7 (bugs)            | 1 h                         | Manual click-through                     |
| 3                                                                                        | Task 4 (schema)          | 2–3 h                       | Rich Results Test                        |
| 4                                                                                        | Task 3 (FAQ)             | 2–3 h                       | Rich Results Test + on-page              |
| 5                                                                                        | Task 5 (prose)           | 2 h + copy review           | Word count in raw HTML                   |
| 6                                                                                        | Task 1 (results section) | 0.5–1 day + data collection | View Source + Lighthouse                 |
| 7                                                                                        | Task 6 (SSR islands)     | 0.5–1 day                   | View Source + build passes               |
| 8                                                                                        | Task 8 (off-page)        | ongoing                     | GSC queries + GBP insights footer/schema |
| ("Takshasheela School of Civil Services", 6th Floor Unique Avenue Building, 781006,      |
| +91 60016-57575). Actively collect student reviews — Bhadra's "1,200 reviews" claim is a |
| major trust signal we currently can't counter.                                           |

2. **YouTube**: title topper/testimonial videos with the pattern that works for Bhadra —
   `"<Name>, <Rank> | APSC Coaching in Guwahati | Takshasheela"` — and link the channel in
   schema `sameAs` and the footer.
3. **Dedicated landing pages** (next sprint): `/apsc-coaching-in-guwahati/` and
   `/upsc-coaching-in-guwahati/` — long-form pages combining Task 5-style prose, results,
   FAQ and lead capture, internally linked from the homepage prose and course pages.
   (This mirrors the Bhadra nav-slug tactic and the Borthakur dedicated-page tactic while
   staying clean.)

---

## Rollout order & verification

| Order | Task                     | Est. effort                 | Verify with                      |
| ----- | ------------------------ | --------------------------- | -------------------------------- |
| 1     | Task 2 (H1/headings)     | 1–2 h                       | View Source: one H1 with keyword |
| 2     | Task 7 (bugs)            | 1 h                         | Manual click-through             |
| 3     | Task 4 (schema)          | 2–3 h                       | Rich Results Test                |
| 4     | Task 3 (FAQ)             | 2–3 h                       | Rich Results Test + on-page      |
| 5     | Task 5 (prose)           | 2 h + copy review           | Word count in raw HTML           |
| 6     | Task 1 (results section) | 0.5–1 day + data collection | View Source + Lighthouse         |
| 7     | Task 6 (SSR islands)     | 0.5–1 day                   | View Source + build passes       |
| 8     | Task 8 (off-page)        | ongoing                     | GSC queries + GBP insights       |

After deploy: request indexing of `/` in Search Console, then track the branded vs. non-branded
regex segments (already set up) for movement on `apsc coaching in guwahati` /
`upsc coaching in guwahati` over 4–8 weeks.
