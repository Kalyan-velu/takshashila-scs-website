import { describe, expect, it } from "vitest";
import {
  buildHeroLeadPayload,
  normalizeHeroPhone,
} from "./heroLeadForm";

describe("normalizeHeroPhone", () => {
  it("normalizes local phone numbers to the expected +91 format", () => {
    expect(normalizeHeroPhone("  98765-43210 ")).toBe("+919876543210");
  });

  it("preserves an explicit international prefix", () => {
    expect(normalizeHeroPhone(" +1 (202) 555-0101 ")).toBe("+12025550101");
  });
});

describe("buildHeroLeadPayload", () => {
  const validInput = {
    name: "  Jane Doe  ",
    phone: "  98765-43210  ",
    course: "apsc",
    cfTurnstileResponse: "turnstile-token",
  };

  it("builds a normalized payload for valid input", () => {
    const result = buildHeroLeadPayload(validInput);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.payload).toEqual({
      name: "Jane Doe",
      phone: "+919876543210",
      email: "919876543210@phone.takshashilascs.com",
      course: "apsc",
      source: "homepage-hero-form",
      address: null,
      cfTurnstileResponse: "turnstile-token",
    });
  });

  it("rejects missing required fields at once", () => {
    const result = buildHeroLeadPayload({
      name: "",
      phone: "abc",
      course: "",
      cfTurnstileResponse: null,
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.fieldErrors.name).toContain("Enter a name");
    expect(result.fieldErrors.phone).toContain(
      "Phone number must be a valid format",
    );
    expect(result.fieldErrors.course).toContain("Select a course");
    expect(result.fieldErrors.cfTurnstileResponse).toContain(
      "Captcha token is missing",
    );
  });

  it("rejects unsupported course values", () => {
    const result = buildHeroLeadPayload({
      ...validInput,
      course: "other",
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.fieldErrors.course).toContain("Select a course");
  });
});
