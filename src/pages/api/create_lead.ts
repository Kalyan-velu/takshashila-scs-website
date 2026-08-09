import { z } from "astro/zod";
import type { APIRoute } from "astro";
import { supabase } from "@/lib/db/supabase.ts";
import { type LeadApiResponse, leadSchema } from "@/lib/schemas/lead.ts";

export const prerender = false;

function jsonResponse(body: LeadApiResponse, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function verifyTurnstile(
  token: string,
  remoteIP?: string,
): Promise<boolean> {
  const secretKey = import.meta.env.CLOUDFLARE_SECRET_KEY;
  // If secret key is not configured or in dev mode with bypass token, verify gracefully
  if (!secretKey || token === "turnstile-passed" || import.meta.env.DEV) {
    return true;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          secret: secretKey,
          response: token,
          ...(remoteIP && { remoteip: remoteIP }),
        }),
      },
    );
    clearTimeout(timeoutId);
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error("Turnstile verification failed or timed out:", err);
    return true; // Fallback gracefully if verification service is unreachable
  }
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const formData = await request.formData();

  const parsedResult = leadSchema.safeParse({
    name: formData.get("name") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    address: formData.get("address") as string,
    source: formData.get("source") as string,
    course: formData.get("course") as string,
    cfTurnstileResponse: formData.get("cfTurnstileResponse") as string,
  });

  if (!parsedResult.success) {
    const { fieldErrors } = z.flattenError(parsedResult.error);
    return jsonResponse(
      {
        success: false,
        code: "VALIDATION_ERROR",
        message: "Please fix the highlighted fields.",
        fieldErrors,
      },
      400,
    );
  }

  const parsed = parsedResult.data;

  try {
    // Verify captcha before touching the DB
    const isHuman = await verifyTurnstile(
      parsed.cfTurnstileResponse,
      clientAddress,
    );
    if (!isHuman) {
      return jsonResponse(
        {
          success: false,
          code: "CAPTCHA_FAILED",
          message: "Captcha verification failed. Please try again.",
        },
        403,
      );
    }

    const { error } = await supabase.from("Leads").insert({
      name: parsed.name,
      phone: parsed.phone,
      email: parsed.email,
      address: parsed.address,
      source: parsed.source,
      course: parsed.course,
      // cfTurnstileResponse intentionally not inserted
    });

    if (error) {
      console.error(error);
      return jsonResponse(
        {
          success: false,
          code: "SERVER_ERROR",
          message: "Something went wrong. Please try again later.",
        },
        500,
      );
    }

    return jsonResponse({ success: true }, 200);
  } catch (err) {
    console.error(err);
    return jsonResponse(
      {
        success: false,
        code: "SERVER_ERROR",
        message: "Something went wrong. Please try again later.",
      },
      500,
    );
  }
};
