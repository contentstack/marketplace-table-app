import ContentstackAppSDK from "@contentstack/app-sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSdk, savedTable } from "./test-utils/sdk";

vi.mock("@contentstack/app-sdk", () => ({ default: { init: vi.fn() } }));
vi.mock("trackjs", () => ({ TrackJS: { install: vi.fn(), addMetadata: vi.fn(), track: vi.fn() } }));

// Contentstack loads the field in an iframe at the manifest path /field-extension, with or without a hash.
describe("entry", () => {
  beforeEach(() => {
    vi.resetModules();
    const { sdk } = makeSdk(savedTable([["hello", "world"]]));
    vi.mocked(ContentstackAppSDK.init).mockResolvedValue(sdk as never);
    document.body.innerHTML = '<div id="root"></div>';
  });

  const boot = async () => {
    await import("./main");
    document.dispatchEvent(new Event("DOMContentLoaded"));
  };

  it.each([
    ["/#/field-extension", "hash URL"],
    ["/field-extension", "path URL"],
  ])("renders the saved table at %s (%s)", async (url) => {
    window.history.pushState({}, "", url);
    await boot();
    await vi.waitFor(() => expect(document.querySelector(".cs-extension-table")).not.toBeNull());
    expect(document.querySelector(".data-input")?.textContent).toBe("hello");
  });

  it("renders nothing for a path the manifest does not use", async () => {
    window.history.pushState({}, "", "/somewhere-else");
    await boot();
    expect(document.querySelector(".field-extension")).toBeNull();
  });

  it("does nothing when the page has no #root", async () => {
    document.body.innerHTML = "";
    await boot();
    expect(document.body.innerHTML).toBe("");
  });
});
