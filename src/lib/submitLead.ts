import type { LeadApiResponse, LeadFieldErrors } from "@/lib/schemas/lead.ts";

export interface LeadPayload {
  name: string;
  phone: string;
  email: string;
  address?: string | null;
  source?: string;
  course?: string;
  cfTurnstileResponse: string;
}

export type SubmitLeadResult =
  | { success: true }
  | {
      success: false;
      code: "VALIDATION_ERROR";
      message: string;
      fieldErrors: LeadFieldErrors;
    }
  | {
      success: false;
      code: "CAPTCHA_FAILED" | "SERVER_ERROR" | "NETWORK_ERROR";
      message: string;
    };

export async function submitLead(
  payload: LeadPayload,
): Promise<SubmitLeadResult> {
  const formData = new FormData();
  formData.set("name", payload.name);
  formData.set("phone", payload.phone);
  formData.set("email", payload.email);
  if (payload.address) formData.set("address", payload.address);
  if (payload.source) formData.set("source", payload.source);
  if (payload.course) formData.set("course", payload.course);
  formData.set("cfTurnstileResponse", payload.cfTurnstileResponse);

  try {
    const res = await fetch("/api/create_lead", {
      method: "POST",
      body: formData,
    });
    const data = (await res.json()) as LeadApiResponse;
    if (data.success) {
      const { trackLeadSubmit } = await import("@/lib/analytics");
      trackLeadSubmit(payload.source || "unknown_source", payload.course);
    }
    return data;
  } catch (err) {
    console.error(err);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message:
        "Could not reach the server. Please check your connection and try again.",
    };
  }
}
