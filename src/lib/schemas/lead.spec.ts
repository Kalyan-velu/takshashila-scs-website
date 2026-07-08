import { z } from "astro/zod";
import { describe, expect, it } from "vitest";
import { leadSchema } from "./lead";

const validInput = {
  name: "Jane Doe",
  phone: "+911234567890",
  email: "jane@example.com",
  address: "123 Street",
  source: "contact-page",
  cfTurnstileResponse: "token",
};

describe("leadSchema", () => {
  it("accepts a fully valid lead", () => {
    expect(leadSchema.safeParse(validInput).success).toBe(true);
  });

  it("allows address to be omitted or null", () => {
    const { address, ...withoutAddress } = validInput;
    expect(leadSchema.safeParse(withoutAddress).success).toBe(true);
    expect(leadSchema.safeParse({ ...validInput, address: null }).success).toBe(
      true,
    );
  });

  it("rejects a missing name", () => {
    const result = leadSchema.safeParse({ ...validInput, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      expect(fieldErrors.name).toContain("Enter a name");
    }
  });

  it("rejects an invalid email", () => {
    const result = leadSchema.safeParse({
      ...validInput,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      expect(fieldErrors.email).toContain("Email must be a valid format");
    }
  });

  it("rejects a phone number that isn't E.164", () => {
    const result = leadSchema.safeParse({ ...validInput, phone: "12345" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      expect(fieldErrors.phone).toContain(
        "Phone number must be a valid format",
      );
    }
  });

  it("rejects a missing captcha token", () => {
    const result = leadSchema.safeParse({
      ...validInput,
      cfTurnstileResponse: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      expect(fieldErrors.cfTurnstileResponse).toContain(
        "Captcha token is missing",
      );
    }
  });

  it("reports every invalid field at once", () => {
    const result = leadSchema.safeParse({
      name: "",
      phone: "12345",
      email: "not-an-email",
      cfTurnstileResponse: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      expect(Object.keys(fieldErrors).sort()).toEqual([
        "cfTurnstileResponse",
        "email",
        "name",
        "phone",
      ]);
    }
  });
});
