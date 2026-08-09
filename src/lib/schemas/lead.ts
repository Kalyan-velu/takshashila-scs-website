import { z } from "astro/zod";

export const leadSchema = z.object({
  name: z.string().min(1, { message: "Enter a name" }),
  phone: z.e164({ message: "Phone number must be a valid format" }),
  email: z.email({ message: "Email must be a valid format" }),
  address: z.string().nullable().optional(),
  source: z.string().optional(),
  course: z.string().optional(),
  cfTurnstileResponse: z
    .string()
    .min(1, { message: "Captcha token is missing" }),
});

export type LeadInput = z.infer<typeof leadSchema>;

export type LeadFieldErrors = Partial<Record<keyof LeadInput, string[]>>;

export type LeadApiResponse =
  | { success: true }
  | {
      success: false;
      code: "VALIDATION_ERROR";
      message: string;
      fieldErrors: LeadFieldErrors;
    }
  | {
      success: false;
      code: "CAPTCHA_FAILED" | "SERVER_ERROR";
      message: string;
    };
