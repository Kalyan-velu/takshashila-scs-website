export const courses = [
  {
    title: "UPSC Foundation Batch",
    description: "Enroll now for the most comprehensive UPSC coaching in Guwahati. Available in both online and offline modes with expert mentors from Delhi and across India.",
    price: "Online: ₹25,000 | Offline: ₹62,500",
    popular: true,
    category: ["UPSC"],
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
  },
  {
    title: "APSC Foundation Batch",
    description: "Flexible and dedicated APSC coaching tailored for success. Our foundation batch covers the complete syllabus with expert guidance and regular mock tests.",
    price: "Online: ₹22,000 | Offline: ₹42,500",
    popular: false,
    category: ["APSC"],
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4"
  },
  {
    title: "Weekend Batch (Working Professionals)",
    description: "Designed specifically for working professionals. Master your preparation with dedicated classes exclusively on weekends without compromising your career.",
    price: "Online: ₹22,000 | Offline: ₹42,500",
    popular: false,
    category: ["UPSC", "APSC","working-professionals"],
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4"
  },
  {
    title: "ADRE Online (New)",
    description: "New specialized online course for ADRE, designed to give you a competitive edge in state government exams with targeted preparation strategies.",
    price: "Starts from ₹1,999",
    popular: false,
    category: ["ADRE"],
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8"
  },
  {
    title: "ONE YEAR UPSC BATCH",
    description: "A intensive one-year program focused on building a strong foundation and covering the entire UPSC syllabus with precision and expert mentorship.",
    popular: false,
    category: ["UPSC"],
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
  },
  {
    title: "ONE YEAR APSC BATCH",
    description: "Dedicated one-year roadmap for APSC success. Get the best guidance, study materials, and regular evaluations at Takshashila, Guwahati.",
    popular: false,
    category: ["APSC"],
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
  },
  // {
  //   title: "THREE YEARS BATCH",
  //   description: "The ideal starting point for college students. A long-term vision for UPSC preparation, building knowledge and personality gradually for certain success.",
  //   popular: false,
  //   category: ["UPSC"],
  //   image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
  // }
];

export type Course = typeof courses[number];