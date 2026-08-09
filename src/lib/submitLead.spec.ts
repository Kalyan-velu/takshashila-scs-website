import { afterEach, describe, expect, it, vi } from "vitest";
import { submitLead } from "./submitLead";

const basePayload = {
  name: "Jane Doe",
  phone: "+911234567890",
  email: "jane@example.com",
  cfTurnstileResponse: "token",
};

describe("submitLead", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("posts the payload as form data and returns the parsed success response", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ json: async () => ({ success: true }) });
    vi.stubGlobal("fetch", fetchMock);

    const result = await submitLead({
      ...basePayload,
      course: "APSC Foundation Batch",
      source: "contact-page",
    });

    expect(result).toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/create_lead",
      expect.objectContaining({ method: "POST" }),
    );

    const body = fetchMock.mock.calls[0][1].body as FormData;
    expect(body.get("name")).toBe("Jane Doe");
    expect(body.get("phone")).toBe("+911234567890");
    expect(body.get("email")).toBe("jane@example.com");
    expect(body.get("course")).toBe("APSC Foundation Batch");
    expect(body.get("source")).toBe("contact-page");
    expect(body.get("cfTurnstileResponse")).toBe("token");
    // Omitted optional fields shouldn't be sent at all.
    expect(body.get("address")).toBeNull();
  });

  it("passes a validation error response through unchanged", async () => {
    const apiResponse = {
      success: false,
      code: "VALIDATION_ERROR",
      message: "Please fix the highlighted fields.",
      fieldErrors: { email: ["Email must be a valid format"] },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: async () => apiResponse }),
    );

    const result = await submitLead({ ...basePayload, email: "bad-email" });

    expect(result).toEqual(apiResponse);
  });

  it("passes a captcha failure response through unchanged", async () => {
    const apiResponse = {
      success: false,
      code: "CAPTCHA_FAILED",
      message: "Captcha verification failed. Please try again.",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: async () => apiResponse }),
    );

    const result = await submitLead(basePayload);

    expect(result).toEqual(apiResponse);
  });

  it("returns a NETWORK_ERROR result when the request itself fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );

    const result = await submitLead(basePayload);

    expect(result).toEqual({
      success: false,
      code: "NETWORK_ERROR",
      message:
        "Could not reach the server. Please check your connection and try again.",
    });
  });
});
