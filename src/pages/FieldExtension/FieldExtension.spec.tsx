import { beforeEach, describe, expect, it, vi } from "vitest";
import ContentstackAppSdk from "@contentstack/app-sdk";
import { TrackJS } from "trackjs";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import FieldExtension from ".";
import { lastSaved, makeSdk, renderWithStore, savedTable } from "../../test-utils/sdk";

vi.mock("@contentstack/app-sdk", () => ({ default: { init: vi.fn() } }));
vi.mock("trackjs", () => ({ TrackJS: { install: vi.fn(), addMetadata: vi.fn(), track: vi.fn() } }));

const mount = async (saved?: unknown, config?: unknown) => {
  const fake = makeSdk(saved, config);
  vi.mocked(ContentstackAppSdk.init).mockResolvedValue(fake.sdk as never);
  const view = renderWithStore(<FieldExtension />);
  await waitFor(() => expect(fake.enableAutoResizing).toHaveBeenCalled());
  return { ...fake, ...view };
};

const mountNew = async () => {
  const m = await mount();
  fireEvent.click(await screen.findByText("Add Table"));
  return m;
};

const cells = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLElement>(".data-input"));
// cell (row, col) of a table with `cols` columns
const cellAt = (c: HTMLElement, row: number, col: number, cols = 3) => cells(c)[row * cols + col];
const typeInto = (el: HTMLElement, text: string) => {
  // jsdom has no innerText; the app reads it on change/blur like a browser would
  (el as HTMLElement & { innerText: string }).innerText = text;
  fireEvent.blur(el);
};
const cellMenu = (c: HTMLElement, row: number, col: number, item: string, cols = 3) => {
  const dropdown = cellAt(c, row, col, cols).closest(".cell")!.querySelector(".cell-dropdown .Dropdown__header")!;
  // the menu stays open after a pick (closeAfterSelect=false); only open it when closed
  if (!screen.queryByText(item)) fireEvent.click(dropdown);
  fireEvent.click(screen.getByText(item));
};
const tableMenu = (c: HTMLElement) => {
  fireEvent.click(cells(c)[0]); // first click on a cell enables the table-actions dropdown
  return c.querySelector("#table-actions .Dropdown__header") as HTMLElement;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("empty field", () => {
  it("offers to add a table and saves nothing until one is added", async () => {
    const { setData } = await mount();
    expect(screen.getByText("Table has not been added")).toBeInTheDocument();
    expect(screen.getByText("Add Table")).toBeInTheDocument();
    expect(setData).not.toHaveBeenCalled();
  });

  it("Add Table creates a 3 x 3 text table and saves {tableState}", async () => {
    const { setData, pulse, container } = await mountNew();
    expect(cells(container)).toHaveLength(9);
    expect(screen.queryByText("Add Table")).not.toBeInTheDocument();
    const saved = lastSaved(setData);
    expect(saved.columns.map((c: { id: string }) => c.id)).toEqual(["column1", "column2", "column3"]);
    expect(saved.columns.every((c: { dataType: string }) => c.dataType === "text")).toBe(true);
    expect(saved.data).toEqual([
      { column1: "", column2: "", column3: "" },
      { column1: "", column2: "", column3: "" },
      { column1: "", column2: "", column3: "" },
    ]);
    expect(setData.mock.calls.at(-1)?.[0]).toHaveProperty("tableState");
    expect(pulse).toHaveBeenCalledWith("Clicked", { property: "Add Table" });
  });
});

describe("loading", () => {
  it("shows the saved table, reads config and reports a successful load", async () => {
    const { sdk, pulse, container } = await mount(
      savedTable([
        ["a", "b"],
        ["c", "d"],
      ]),
      { some: "config" },
    );
    expect(sdk.getConfig).toHaveBeenCalled();
    expect(cells(container).map((e) => e.textContent)).toEqual(["a", "b", "c", "d"]);
    expect(pulse).toHaveBeenCalledWith("App Loaded Successfully");
    expect(TrackJS.addMetadata).toHaveBeenCalledWith("stack", "stack-name");
    expect(TrackJS.addMetadata).toHaveBeenCalledWith("organization", "org-ref");
    expect(TrackJS.addMetadata).toHaveBeenCalledWith("api_key", "stack-ref");
  });

  it("re-saves the loaded table in the {tableState} shape", async () => {
    const { setData } = await mount(
      savedTable([
        ["a", "b"],
        ["c", "d"],
      ]),
    );
    const saved = lastSaved(setData);
    expect(saved.data).toEqual([
      { column1: "a", column2: "b" },
      { column1: "c", column2: "d" },
    ]);
  });

  it("treats a saved table with no columns or rows as empty", async () => {
    await mount({ tableState: { columns: [], data: [] } });
    expect(screen.getByText("Table has not been added")).toBeInTheDocument();
  });

  it("restores a saved header row (column labels) and header column flag", async () => {
    const saved = savedTable([["r1c1", "r1c2"]], { headerColumnAdded: true });
    saved.tableState.columns = saved.tableState.columns.map((c, i) => ({ ...c, label: `Head ${i + 1}` }));
    const { container, setData } = await mount(saved);
    expect(screen.getByText("Head 1")).toBeInTheDocument();
    expect(screen.getByText("Head 2")).toBeInTheDocument();
    expect(container.querySelector(".cell-header")).not.toBeNull();
    const out = lastSaved(setData);
    expect(out.headerColumnAdded).toBe(true);
    expect(out.headerRowAdded).toBe(true);
  });

  it("drops stray row keys that have no column when saving", async () => {
    const saved = savedTable([["a", "b"]]);
    saved.tableState.data[0]["gone"] = "x";
    const { setData } = await mount(saved);
    expect(lastSaved(setData).data[0]).toEqual({ column1: "a", column2: "b" });
  });

  it("shows markup in a cell as literal text and stores it verbatim", async () => {
    const { container, setData } = await mount(savedTable([["<img src=x onerror=alert(1)>", "<b>bold</b>"]]));
    expect(container.querySelector(".data-input img")).toBeNull();
    expect(container.querySelector(".data-input b")).toBeNull();
    expect(cellAt(container, 0, 0, 2).textContent).toBe("<img src=x onerror=alert(1)>");
    expect(lastSaved(setData).data[0].column2).toBe("<b>bold</b>");
  });

  it("strips markup from column headers", async () => {
    const saved = savedTable([["a"]]);
    saved.tableState.columns[0]["label"] = "<img src=x onerror=alert(1)>Name";
    const { container } = await mount(saved);
    expect(container.querySelector(".header-editable img")).toBeNull();
    expect(container.querySelector(".header-editable")?.textContent).toBe("Name");
  });
});

describe("editing", () => {
  it("saves a cell edit", async () => {
    const { container, setData } = await mountNew();
    typeInto(cellAt(container, 1, 2), "hello");
    expect(lastSaved(setData).data[1].column3).toBe("hello");
    expect(lastSaved(setData).data[0].column3).toBe("");
  });

  it("inserts a row above and below", async () => {
    const { container, setData } = await mountNew();
    typeInto(cellAt(container, 0, 0), "x");
    cellMenu(container, 0, 0, "Insert Row Below");
    expect(lastSaved(setData).data).toHaveLength(4);
    expect(lastSaved(setData).data[0].column1).toBe("x");
    cellMenu(container, 0, 0, "Insert Row Above");
    expect(lastSaved(setData).data).toHaveLength(5);
    expect(lastSaved(setData).data[0].column1).toBe("");
    expect(lastSaved(setData).data[1].column1).toBe("x");
  });

  it("deletes a row", async () => {
    const { container, setData } = await mountNew();
    typeInto(cellAt(container, 0, 0), "first");
    typeInto(cellAt(container, 1, 0), "second");
    cellMenu(container, 0, 0, "Delete Row");
    const data = lastSaved(setData).data;
    expect(data).toHaveLength(2);
    expect(data[0].column1).toBe("second");
  });

  it("inserts a column to the right and to the left", async () => {
    const { container, setData } = await mountNew();
    cellMenu(container, 0, 0, "Insert Column Right");
    let ids = lastSaved(setData).columns.map((c: { id: string }) => c.id);
    expect(ids).toHaveLength(4);
    expect(ids[0]).toBe("column1");
    expect(ids[2]).toBe("column2");
    cellMenu(container, 0, 0, "Insert Column Left", 4);
    ids = lastSaved(setData).columns.map((c: { id: string }) => c.id);
    expect(ids).toHaveLength(5);
    expect(ids[1]).toBe("column1");
  });

  it("deletes a column and its cells", async () => {
    const { container, setData } = await mountNew();
    typeInto(cellAt(container, 0, 1), "mid");
    cellMenu(container, 0, 1, "Delete Column");
    const saved = lastSaved(setData);
    expect(saved.columns.map((c: { id: string }) => c.id)).toEqual(["column1", "column3"]);
    expect(Object.keys(saved.data[0]).sort()).toEqual(["column1", "column3"]);
  });

  it("deletes the whole table and offers Add Table again", async () => {
    const { container, setData, pulse } = await mountNew();
    fireEvent.click(tableMenu(container));
    fireEvent.click(screen.getByText("Delete Table"));
    expect(lastSaved(setData)).toMatchObject({ columns: [], data: [] });
    expect(screen.getByText("Add Table")).toBeInTheDocument();
    expect(pulse).toHaveBeenCalledWith("Clicked", { property: "Delete Table" });
  });

  it("header row toggle turns the first row into column labels and back", async () => {
    const { container, setData } = await mountNew();
    typeInto(cellAt(container, 0, 0), "Name");
    typeInto(cellAt(container, 0, 1), "Age");
    fireEvent.click(tableMenu(container));
    const toggle = () => container.ownerDocument.querySelector<HTMLInputElement>("#headerRowChange")!;
    fireEvent.click(toggle());
    let saved = lastSaved(setData);
    expect(saved.columns.map((c: { label: string }) => c.label)).toEqual(["Name", "Age", ""]);
    expect(saved.data).toHaveLength(2);
    expect(saved.headerRowAdded).toBe(true);
    fireEvent.click(toggle());
    saved = lastSaved(setData);
    expect(saved.data).toHaveLength(3);
    expect(saved.data[0]).toMatchObject({ column1: "Name", column2: "Age" });
    expect(saved.columns[0]).not.toHaveProperty("label");
    expect(saved.headerRowAdded).toBe(false);
  });

  it("header column toggle is saved and hides column actions on the header column", async () => {
    const { container, setData } = await mountNew();
    fireEvent.click(tableMenu(container));
    const toggle = () => container.ownerDocument.querySelector<HTMLInputElement>("#headerColumnChange")!;
    fireEvent.click(toggle());
    expect(lastSaved(setData).headerColumnAdded).toBe(true);
    expect(container.querySelector(".cell-header")).not.toBeNull();
    fireEvent.click(cellAt(container, 0, 0).closest(".cell")!.querySelector(".cell-dropdown .Dropdown__header")!);
    expect(screen.getByText("Delete Row")).toBeInTheDocument();
    expect(screen.queryByText("Delete Column")).not.toBeInTheDocument();
    fireEvent.click(container.querySelector("#table-actions .Dropdown__header")!);
    fireEvent.click(toggle());
    expect(lastSaved(setData).headerColumnAdded).toBe(false);
  });

  it("edits a column header (header row on) and saves the label", async () => {
    const saved = savedTable([["a", "b"]]);
    saved.tableState.columns = saved.tableState.columns.map((c) => ({ ...c, label: "Old" }));
    const { container, setData } = await mount(saved);
    const header = container.querySelector<HTMLElement>(".header-editable")!;
    header.innerHTML = "New";
    fireEvent.input(header);
    expect(lastSaved(setData).columns[0].label).toBe("New");
  });
});

describe("init", () => {
  it("only logs when the SDK throws synchronously (no visible error, no failure event)", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(ContentstackAppSdk.init).mockImplementation(() => {
      throw new Error("sdk down");
    });
    renderWithStore(<FieldExtension />);
    await waitFor(() => expect(spy).toHaveBeenCalled());
    expect(screen.queryByText("Add Table")).not.toBeInTheDocument();
    spy.mockRestore();
  });

  // BUG: MKT-19818 - init failure shows the user nothing (blank field) and the App Load Failure event is never sent
  // (the catch calls pulse on the still-null SDK state, and a rejected init() promise is not caught at all).
  it.skip("tells the user the field could not load when init fails", async () => {
    vi.mocked(ContentstackAppSdk.init).mockRejectedValue(new Error("sdk down"));
    renderWithStore(<FieldExtension />);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});

describe("size limit", () => {
  // Needs owner: the public docs say only 10 KB of JSON can be stored in a custom field, but not what the user should
  // see past it. The app has no check, so setData is called with an oversized value. Only "not saved" is asserted.
  it.skip("does not save when the table exceeds 10 KB of JSON", async () => {
    const big = "x".repeat(11 * 1024);
    const { setData } = await mount(savedTable([[big]]));
    expect(JSON.stringify(lastSaved(setData)).length).toBeLessThanOrEqual(10 * 1024);
  });
});
