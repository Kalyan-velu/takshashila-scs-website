import { z } from "astro/zod";
import type { APIRoute } from "astro";
import { supabase } from "@/lib/db/supabase.ts";

export const prerender = false;

const leadSchema = z.object({
  name: z.string().min(1, { message: "Enter a name" }),
  phone: z.e164({
    message: "Phone number must be a valid format",
  }),
  email: z.email({
    message: "Email must be a valid format",
  }),
  address: z.string().nullable().optional(),
  source: z.string().optional(),
});
type Lead = z.infer<typeof leadSchema>;
export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();

    const parsed = await leadSchema.parseAsync({
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
      source: formData.get("source") as string,
    });

    const { error } = await supabase.from("Leads").insert({
      name: parsed.name,
      phone: parsed.phone,
      email: parsed.email,
      address: parsed.address,
      source: parsed.source,
    });
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error(err);
      // @ts-ignore
      return new Response(JSON.stringify({ errors: err.errors }), {
        status: 400,
      });
    }
    console.error(err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message! : "Internal Server Error",
      }),
      {
        status: 500,
      },
    );
  }
};
