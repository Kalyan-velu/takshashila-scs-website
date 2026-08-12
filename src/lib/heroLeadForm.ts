import { z } from "astro/zod";
import type { LeadPayload } from "@/lib/submitLead";

const HERO_FORM_SOURCE = "homepage-hero-form" as const;
const HERO_COURSES = ["apsc", "upsc", "adre"] as const;

export type HeroLeadField =
  | "name"
  | "phone"
  | "course"
  | "cfTurnstileResponse";

export type HeroLeadFieldErrors = Partial<Record<HeroLeadField, string[]>>;

export interface HeroLeadFormInput {
  name: string;
  phone: string;
  course: string;
  cfTurnstileResponse: string | null;
}

const heroLeadSchema = z.object({
  name: z.string().trim().min(1, { message: "Enter a name" }),
  phone: z
    .string()
    .trim()
    .transform(normalizeHeroPhone)
    .pipe(z.e164({ message: "Phone number must be a valid format" })),
  course: z
    .string()
    .trim()
    .min(1, { message: "Select a course" })
    .refine((value) => HERO_COURSES.includes(value as (typeof HERO_COURSES)[number]), {
      message: "Select a course",
    }),
  cfTurnstileResponse: z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    z.string().trim().min(1, { message: "Captcha token is missing" }),
  ),
});

export function normalizeHeroPhone(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("+")) {
    const digits = trimmed.slice(1).replace(/\D/g, "");
    return digits ? `+${digits}` : "";
  }

  const digits = trimmed.replace(/\D/g, "");
  return digits ? `+91${digits}` : "";
}

export function buildHeroLeadPayload(
  input: HeroLeadFormInput,
):
  | { success: true; payload: LeadPayload }
  | {
      success: false;
      message: string;
      fieldErrors: HeroLeadFieldErrors;
    } {
  const parsed = heroLeadSchema.safeParse(input);

  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return {
      success: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: fieldErrors as HeroLeadFieldErrors,
    };
  }

  const phoneDigits = parsed.data.phone.replace(/\D/g, "");

  return {
    success: true,
    payload: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: `${phoneDigits}@phone.takshashilascs.com`,
      course: parsed.data.course,
      source: HERO_FORM_SOURCE,
      address: null,
      cfTurnstileResponse: parsed.data.cfTurnstileResponse,
    },
  };
}
