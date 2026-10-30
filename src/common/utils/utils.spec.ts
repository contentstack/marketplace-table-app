import { describe, expect, it } from "vitest";
import utils, { eventNames } from ".";

describe("escapeHtml", () => {
  it("escapes & < > so markup is shown as text", () => {
    expect(utils.escapeHtml("<b>a & b</b>")).toBe("&lt;b&gt;a &amp; b&lt;/b&gt;");
  });
  it("returns an empty string for null, undefined, objects, arrays and NaN", () => {
    for (const v of [null, undefined, {}, [], NaN]) expect(utils.escapeHtml(v)).toBe("");
  });
  it("stringifies numbers", () => {
    expect(utils.escapeHtml(42)).toBe("42");
  });
});

describe("stripHtml", () => {
  it("removes all tags and keeps the text", () => {
    expect(utils.stripHtml("<b>Name</b><img src=x onerror=alert(1)>")).toBe("Name");
  });
  it("handles unclosed tags", () => {
    expect(utils.stripHtml("Name<script")).not.toContain("<");
  });
  it("returns an empty string for null, undefined, objects, arrays and NaN", () => {
    for (const v of [null, undefined, {}, [], NaN]) expect(utils.stripHtml(v)).toBe("");
  });
});

describe("makeData", () => {
  it("builds a table with three text columns and the requested number of empty rows", () => {
    const { columns, data, skipReset } = utils.makeData(2);
    expect(columns.map((c) => c.id)).toEqual(["column1", "column2", "column3"]);
    expect(data).toEqual([
      { column1: "", column2: "", column3: "" },
      { column1: "", column2: "", column3: "" },
    ]);
    expect(skipReset).toBe(false);
  });
});

describe("ids and colours", () => {
  it("shortId is prefixed with an underscore and differs between calls", () => {
    expect(utils.shortId()).toMatch(/^_[a-z0-9]+$/);
    expect(utils.shortId()).not.toBe(utils.shortId());
  });
  it("randomColor returns an hsl colour", () => {
    expect(utils.randomColor()).toMatch(/^hsl\(\d+, 95%, 90%\)$/);
  });
});

describe("safePopperAttributes", () => {
  it("keeps only the popper data attributes", () => {
    expect(
      utils.safePopperAttributes({ "data-popper-placement": "top", onclick: "alert(1)", "data-popper-escaped": "" }),
    ).toEqual({ "data-popper-placement": "top", "data-popper-escaped": "" });
  });
  it("returns an empty object when there are none", () => {
    expect(utils.safePopperAttributes(undefined)).toEqual({});
  });
});

describe("eventNames", () => {
  it("is frozen and has the load success and failure events", () => {
    expect(Object.isFrozen(eventNames)).toBe(true);
    expect(eventNames.APP_INITIALIZE_SUCCESS).toBe("App Loaded Successfully");
    expect(eventNames.APP_INITIALIZE_FAILURE).toBe("App Load Failure");
  });
});
