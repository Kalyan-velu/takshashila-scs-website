import { OGImageRoute } from "astro-og-canvas";

const studentsBg = { path: "./src/assets/og/students-bg.jpg", fit: "cover" as const };

export const { getStaticPaths, GET } = await OGImageRoute({
  param: "route",
  pages: {
    index: {
      title: "Takshasheela School of Civil Services",
      description:
        "Best UPSC & APSC Coaching in Guwahati. Prepare for ADRE, APSC, and UPSC.",
      bgImage: studentsBg,
    },
    "courses/adre": {
      title: "ADRE 2026 Online Coaching",
      description:
        "Comprehensive ADRE course starting this April. Complete syllabus coverage for Class III & IV.",
      bgImage: studentsBg,
    },
    "courses/apsc": {
      title: "APSC Coaching in Guwahati",
      description:
        "Structured APSC prelims & mains coaching with expert mentorship in Guwahati.",
      bgImage: studentsBg,
    },
    "courses/upsc": {
      title: "UPSC Coaching in Guwahati",
      description:
        "Structured UPSC prelims & mains coaching with expert mentorship in Guwahati.",
      bgImage: studentsBg,
    },
  },
  getImageOptions: (path, page) => ({
    title: page.title,
    description: page.description,
    bgImage: page.bgImage,
    font: {
      title: {
        weight: "Bold",
      },
      description: {
        weight: "Normal",
      },
    },
  }),
});
