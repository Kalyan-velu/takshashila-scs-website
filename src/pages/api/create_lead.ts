import { z } from "astro/zod";
import type { APIRoute } from "astro";
import { supabase } from "@/lib/db/supabase.ts";
import { leadSchema, type LeadApiResponse } from "@/lib/schemas/lead.ts";

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
  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: import.meta.env.CLOUDFLARE_SECRET_KEY,
        response: token,
        ...(remoteIP && { remoteip: remoteIP }),
      }),
    },
  );

  const data = await res.json();
  return data.success === true;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const formData = await request.formData();

  const parsedResult = leadSchema.safeParse({
    name: formData.get("name") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    address: formData.get("address") as string,
    source: formData.get("source") as string,
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
