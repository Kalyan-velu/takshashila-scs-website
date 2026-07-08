import { beforeEach, describe, expect, it, vi } from "vitest";
import type { APIContext } from "astro";

const insertMock = vi.fn();
const fromMock = vi.fn(() => ({ insert: insertMock }));

vi.mock("@/lib/db/supabase.ts", () => ({
  supabase: { from: fromMock },
}));

const { POST } = await import("./create_lead");

function buildFormData(overrides: Record<string, string> = {}): FormData {
  const fields = {
    name: "Jane Doe",
    phone: "+911234567890",
    email: "jane@example.com",
    address: "123 Street",
    source: "contact-page",
    cfTurnstileResponse: "valid-token",
    ...overrides,
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return formData;
}

function buildContext(
  formData: FormData,
): Pick<APIContext, "request" | "clientAddress"> {
  return {
    request: new Request("http://localhost/api/create_lead", {
      method: "POST",
      body: formData,
    }),
    clientAddress: "127.0.0.1",
  };
}

describe("POST /api/create_lead", () => {
  beforeEach(() => {
    insertMock.mockReset();
    insertMock.mockResolvedValue({ error: null });
    fromMock.mockClear();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: async () => ({ success: true }) }),
    );
  });

  it("returns 400 with per-field errors when validation fails, without hitting captcha or the db", async () => {
    const formData = buildFormData({ email: "not-an-email", phone: "123" });

    const response = await POST(buildContext(formData) as APIContext);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toMatchObject({ success: false, code: "VALIDATION_ERROR" });
    expect(body.fieldErrors.email).toContain("Email must be a valid format");
    expect(body.fieldErrors.phone).toContain(
      "Phone number must be a valid format",
    );
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("returns 403 when the captcha fails verification, without touching the db", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: async () => ({ success: false }) }),
    );

    const response = await POST(buildContext(buildFormData()) as APIContext);

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body).toMatchObject({ success: false, code: "CAPTCHA_FAILED" });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("returns 500 with a generic message when the db insert fails", async () => {
    insertMock.mockResolvedValue({
      error: { message: "duplicate key value violates unique constraint" },
    });

    const response = await POST(buildContext(buildFormData()) as APIContext);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toMatchObject({ success: false, code: "SERVER_ERROR" });
    expect(body.message).not.toContain("duplicate key");
  });

  it("returns 200 and inserts the lead without the captcha token on success", async () => {
    const response = await POST(buildContext(buildFormData()) as APIContext);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ success: true });

    expect(insertMock).toHaveBeenCalledTimes(1);
    const insertedPayload = insertMock.mock.calls[0][0];
    expect(insertedPayload).toMatchObject({
      name: "Jane Doe",
      phone: "+911234567890",
      email: "jane@example.com",
      address: "123 Street",
      source: "contact-page",
    });
    expect(insertedPayload).not.toHaveProperty("cfTurnstileResponse");
  });
});
