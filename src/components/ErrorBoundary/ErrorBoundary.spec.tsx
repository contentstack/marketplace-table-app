import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrackJS } from "trackjs";
import ErrorBoundary from ".";

vi.mock("trackjs", () => ({ TrackJS: { install: vi.fn(), addMetadata: vi.fn(), track: vi.fn() } }));

describe("ErrorBoundary", () => {
  it("renders children", () => {
    render(
      <ErrorBoundary>
        <p>fine</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("fine")).toBeInTheDocument();
  });

  it("reports a render error to TrackJS", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const Bomb = () => {
      throw new Error("render failed");
    };
    // the boundary reports but has no fallback UI, so React unmounts the tree and rethrows to the test
    try {
      render(
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>,
      );
    } catch {
      /* expected */
    }
    expect(TrackJS.track).toHaveBeenCalledWith(expect.objectContaining({ message: "render failed" }));
  });

  it("tags errors as the Table App", () => {
    expect(TrackJS.addMetadata).toHaveBeenCalledWith("application_name", "Table App");
  });
});
