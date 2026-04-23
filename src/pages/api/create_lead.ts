import { z } from "astro/zod";
import type { APIRoute } from "astro";
import { supabase } from "@/lib/db/supabase.ts";

export const prerender = false;

const leadSchema = z.object({
  name: z.string().min(1, { message: "Enter a name" }),
  phone: z.e164({ message: "Phone number must be a valid format" }),
  email: z.email({ message: "Email must be a valid format" }),
  address: z.string().nullable().optional(),
  source: z.string().optional(),
  cfTurnstileResponse: z
    .string()
    .min(1, { message: "Captcha token is missing" }),
});

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
        secret: import.meta.env.TURNSTILE_SECRET_KEY,
        response: token,
        ...(remoteIP && { remoteip: remoteIP }),
      }),
    },
  );

  const data = await res.json();
  return data.success === true;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const formData = await request.formData();

    const parsed = await leadSchema.parseAsync({
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
      source: formData.get("source") as string,
      cfTurnstileResponse: formData.get("cfTurnstileResponse") as string,
    });

    // Verify captcha before touching the DB
    const isHuman = await verifyTurnstile(
      parsed.cfTurnstileResponse,
      clientAddress,
    );
    if (!isHuman) {
      return new Response(
        JSON.stringify({ error: "Captcha verification failed" }),
        {
          status: 403,
        },
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
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      //@ts-expect-error dummy eer
      return new Response(JSON.stringify({ errors: err.errors }), {
        status: 400,
      });
    }
    console.error(err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Internal Server Error",
      }),
      { status: 500 },
    );
  }
};
