import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import MobileMenu from "./MobileMenu.vue";

describe("MobileMenu.vue", () => {
  it("renders menu items", () => {
    const wrapper = mount(MobileMenu, {
      props: {
        menu: "mobileMenu",
      },
    });

    // Check if the menu is visible based on the prop
    expect(wrapper.html()).toContain("UPSC - APSC");
    expect(wrapper.html()).toContain("Team");
    expect(wrapper.html()).toContain("About");
    expect(wrapper.html()).toContain("Current Affairs");
    expect(wrapper.html()).toContain("Contact");
  });

  it("emits closeMenu when a link is clicked", async () => {
    const wrapper = mount(MobileMenu, {
      props: {
        menu: "mobileMenu",
      },
    });

    // Find the first link and click it
    await wrapper.find("a").trigger("click");

    // Assert that the event was emitted
    expect(wrapper.emitted()).toHaveProperty("closeMenu");
  });
});
