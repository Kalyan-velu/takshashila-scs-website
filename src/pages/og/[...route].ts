import { OGImageRoute } from 'astro-og-canvas';

export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'route',
  pages: {
    'index': {
      title: 'Takshashila School of Civil Services',
      description: 'Best UPSC & APSC Coaching in Guwahati. Prepare for ADRE, APSC, and UPSC.',
      bgGradient: [[107, 33, 168], [88, 28, 135]],
    },
    'courses/adre': {
      title: 'ADRE 2026 Online Coaching',
      description: 'Comprehensive ADRE course starting this April. Complete syllabus coverage for Class III & IV.',
      bgGradient: [[107, 33, 168], [88, 28, 135]],
    },
  },
  getImageOptions: (path, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: page.bgGradient,
    font: {
      title: {
        weight: 'Bold',
      },
      description: {
        weight: 'Normal',
      },
    },
  }),
});
