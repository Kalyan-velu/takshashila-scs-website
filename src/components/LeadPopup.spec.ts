import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { ref } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LeadPopup from "./LeadPopup.vue";
import { submitLead } from "@/lib/submitLead";

const resetTurnstile = vi.fn();
const mountTurnstile = vi.fn();

vi.mock("@/lib/submitLead", () => ({
  submitLead: vi.fn(),
}));

vi.mock("@/lib/useTurnstile", () => ({
  useTurnstile: () => ({
    token: ref("test-turnstile-token"),
    container: ref(null),
    mount: mountTurnstile,
    reset: resetTurnstile,
  }),
}));

const submitLeadMock = vi.mocked(submitLead);

async function fillAndSubmit(wrapper: VueWrapper) {
  // onMounted flips isVisible to true asynchronously, so the popup markup
  // isn't in the DOM until the initial mount's microtasks are flushed.
  await flushPromises();
  await wrapper.find("#lead-name").setValue("Jane Doe");
  await wrapper.find("#lead-email").setValue("jane@example.com");
  await wrapper.find("#lead-phone").setValue("+911234567890");
  await wrapper.find("form").trigger("submit");
  await flushPromises();
}

describe("LeadPopup.vue", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    submitLeadMock.mockReset();
    resetTurnstile.mockClear();
  });

  it("submits the payload and closes the popup on success", async () => {
    submitLeadMock.mockResolvedValue({ success: true });
    const wrapper = mount(LeadPopup);

    await fillAndSubmit(wrapper);

    expect(submitLeadMock).toHaveBeenCalledWith({
      name: "Jane Doe",
      phone: "+911234567890",
      email: "jane@example.com",
      source: "lead-popup",
      cfTurnstileResponse: "test-turnstile-token",
    });
    expect(localStorage.getItem("leadPopupSubmitted")).toBe("true");
    expect(wrapper.find(".fixed").exists()).toBe(false);
  });

  it("shows the message next to the offending field on a validation error", async () => {
    submitLeadMock.mockResolvedValue({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Please fix the highlighted fields.",
      fieldErrors: { email: ["Email must be a valid format"] },
    });
    const wrapper = mount(LeadPopup);

    await fillAndSubmit(wrapper);

    expect(wrapper.text()).toContain("Email must be a valid format");
    expect(wrapper.find(".fixed").exists()).toBe(true);
    expect(resetTurnstile).not.toHaveBeenCalled();
  });

  it("shows a banner and resets turnstile when the captcha token fails validation", async () => {
    submitLeadMock.mockResolvedValue({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Please fix the highlighted fields.",
      fieldErrors: { cfTurnstileResponse: ["Captcha token is missing"] },
    });
    const wrapper = mount(LeadPopup);

    await fillAndSubmit(wrapper);

    expect(wrapper.text()).toContain("Please complete the captcha again.");
    expect(resetTurnstile).toHaveBeenCalledTimes(1);
  });

  it("shows a banner and resets turnstile when the captcha verification fails", async () => {
    submitLeadMock.mockResolvedValue({
      success: false,
      code: "CAPTCHA_FAILED",
      message: "Captcha verification failed. Please try again.",
    });
    const wrapper = mount(LeadPopup);

    await fillAndSubmit(wrapper);

    expect(wrapper.text()).toContain(
      "Captcha verification failed. Please try again.",
    );
    expect(resetTurnstile).toHaveBeenCalledTimes(1);
  });

  it("shows a banner and resets turnstile on a server error", async () => {
    submitLeadMock.mockResolvedValue({
      success: false,
      code: "SERVER_ERROR",
      message: "Something went wrong. Please try again later.",
    });
    const wrapper = mount(LeadPopup);

    await fillAndSubmit(wrapper);

    expect(wrapper.text()).toContain(
      "Something went wrong. Please try again later.",
    );
    expect(resetTurnstile).toHaveBeenCalledTimes(1);
  });
});
