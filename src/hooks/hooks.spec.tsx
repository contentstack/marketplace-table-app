import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { TrackJS } from "trackjs";
import useJsErrorTracker from "./useJsErrorTracker";
import useAnalytics from "./useAnalytics";

vi.mock("trackjs", () => ({ TrackJS: { install: vi.fn(), addMetadata: vi.fn(), track: vi.fn() } }));

describe("useJsErrorTracker", () => {
  it("forwards metadata and errors to TrackJS", () => {
    const { result } = renderHook(() => useJsErrorTracker());
    const err = new Error("boom");
    result.current.addMetadata("k", "v");
    result.current.trackError(err);
    expect(TrackJS.addMetadata).toHaveBeenCalledWith("k", "v");
    expect(TrackJS.track).toHaveBeenCalledWith(err);
  });
});

describe("useAnalytics", () => {
  it("does not throw before the SDK is initialised", () => {
    const { result } = renderHook(() => useAnalytics());
    expect(result.current.trackEvent("Clicked", { property: "x" })).toBeUndefined();
  });
});
