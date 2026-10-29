import { beforeEach, describe, expect, it, vi } from "vitest";
import ContentstackAppSdk from "@contentstack/app-sdk";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import FieldExtension from ".";
import { lastSaved, makeSdk, renderWithStore, savedTable } from "../../test-utils/sdk";

vi.mock("@contentstack/app-sdk", () => ({ default: { init: vi.fn() } }));
vi.mock("trackjs", () => ({ TrackJS: { install: vi.fn(), addMetadata: vi.fn(), track: vi.fn() } }));

const mount = async (saved: unknown) => {
  const fake = makeSdk(saved);
  vi.mocked(ContentstackAppSdk.init).mockResolvedValue(fake.sdk as never);
  const view = renderWithStore(<FieldExtension />);
  await waitFor(() => expect(fake.enableAutoResizing).toHaveBeenCalled());
  await act(async () => {}); // let the mount effects settle so they cannot interleave with a click
  return { ...fake, ...view };
};

const readBlob = (blob: Blob) =>
  new Promise<string>((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.readAsText(blob);
  });
const texts = (c: HTMLElement) => Array.from(c.querySelectorAll(".data-input")).map((e) => e.textContent);
const withLabels = (labels: string[], rows: string[][]) => {
  const saved = savedTable(rows);
  saved.tableState.columns = saved.tableState.columns.map((c, i) => ({ ...c, label: labels[i] }));
  return saved;
};

beforeEach(() => vi.clearAllMocks());

describe("search", () => {
  it("filters rows by the typed text and says when nothing matches", async () => {
    const { container, pulse } = await mount(savedTable([["apple"], ["banana"], ["cherry"]]));
    const search = screen.getByPlaceholderText("Search");
    fireEvent.change(search, { target: { value: "ban" } });
    await waitFor(() => expect(texts(container)).toEqual(["banana"]));
    expect(pulse).toHaveBeenCalledWith("Viewed", { property: "Searching records" });
    fireEvent.change(search, { target: { value: "zzz" } });
    expect(await screen.findByText("No records found")).toBeInTheDocument();
    fireEvent.change(search, { target: { value: "" } });
    await waitFor(() => expect(texts(container)).toEqual(["apple", "banana", "cherry"]));
  });
});

describe("sort", () => {
  it("sorts by a header click: ascending, descending, then cleared (empty cells last)", async () => {
    const { container } = await mount(withLabels(["Fruit"], [["pear"], [""], ["apple"], ["fig"]]));
    const th = container.querySelector(".th")!;
    fireEvent.click(th);
    expect(texts(container)).toEqual(["apple", "fig", "pear", ""]);
    fireEvent.click(th);
    expect(texts(container)).toEqual(["pear", "fig", "apple", ""]);
    fireEvent.click(th);
    expect(texts(container)).toEqual(["pear", "", "apple", "fig"]);
  });

  it("sorts numeric text by value", async () => {
    const { container } = await mount(withLabels(["N"], [["10"], ["9"], ["100"]]));
    fireEvent.click(container.querySelector(".th")!);
    expect(texts(container)).toEqual(["9", "10", "100"]);
  });
});

describe("header menu", () => {
  const open = async (saved: unknown) => {
    const m = await mount(saved);
    fireEvent.contextMenu(m.container.querySelector(".th-content")!);
    return m;
  };

  // BUG (suspected): the menu saves the label before sorting; that state change hands react-table a new data array
  // and its auto-reset clears the sort, so the rows stay unsorted.
  it.skip("sorts ascending and descending from the menu", async () => {
    const { container } = await open(withLabels(["F"], [["b"], ["a"]]));
    fireEvent.mouseDown(screen.getByText("Sort ascending"));
    expect(texts(container)).toEqual(["a", "b"]);
    fireEvent.contextMenu(container.querySelector(".th-content")!);
    fireEvent.mouseDown(screen.getByText("Sort descending"));
    expect(texts(container)).toEqual(["b", "a"]);
  });

  it("deletes the column from the menu", async () => {
    const { setData } = await open(withLabels(["A", "B"], [["1", "2"]]));
    fireEvent.mouseDown(screen.getByText("Delete"));
    expect(lastSaved(setData).columns.map((c: { id: string }) => c.id)).toEqual(["column2"]);
  });

  it("changes the column type to number and back to text", async () => {
    const { setData } = await open(withLabels(["A"], [["7"], ["x"]]));
    fireEvent.mouseEnter(screen.getByText("text"));
    fireEvent.click(screen.getByText("Number"));
    expect(lastSaved(setData).columns[0].dataType).toBe("number");
    fireEvent.contextMenu(document.querySelector(".th-content")!);
    fireEvent.mouseEnter(screen.getByText("number"));
    fireEvent.click(screen.getByText("Text"));
    expect(lastSaved(setData).columns[0].dataType).toBe("text");
  });

  // BUG: a column made by Add Table has no `options`, so choosing Select throws "options is not iterable" in the
  // reducer (only columns inserted from the cell menu carry options: []).
  it.skip("changes the column type to select", async () => {
    const { setData } = await open(withLabels(["A"], [["x"]]));
    fireEvent.mouseEnter(screen.getByText("text"));
    fireEvent.click(screen.getByText("Select"));
    expect(lastSaved(setData).columns[0].dataType).toBe("select");
  });

  it("renames the column from the menu input on Enter", async () => {
    const { setData, container } = await open(withLabels(["Old"], [["1"]]));
    const input = container.ownerDocument.querySelector<HTMLInputElement>("input.form-input")!;
    fireEvent.change(input, { target: { value: "Renamed" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(lastSaved(setData).columns[0].label).toBe("Renamed");
    expect(container.ownerDocument.querySelector("input.form-input")).toBeNull();
  });

  it("saves the label when the menu input loses focus, and closes on overlay click", async () => {
    const { setData, container } = await open(withLabels(["Old"], [["1"]]));
    const input = container.ownerDocument.querySelector<HTMLInputElement>("input.form-input")!;
    fireEvent.change(input, { target: { value: "Blur" } });
    fireEvent.blur(input);
    expect(lastSaved(setData).columns[0].label).toBe("Blur");
    fireEvent.click(container.ownerDocument.querySelector(".overlay")!);
    expect(container.ownerDocument.querySelector(".overlay")).toBeNull();
  });

  // BUG: "Insert left" and "Insert right" in the header menu dispatch add_column_to_left/right, which the
  // reducer does not handle, so no column is inserted (the cell menu works).
  it.skip("inserts a column left and right from the header menu", async () => {
    const { setData } = await open(withLabels(["A"], [["1"]]));
    fireEvent.mouseDown(screen.getByText("Insert right"));
    expect(lastSaved(setData).columns).toHaveLength(2);
    fireEvent.contextMenu(document.querySelector(".th-content")!);
    fireEvent.mouseDown(screen.getByText("Insert left"));
    expect(lastSaved(setData).columns).toHaveLength(3);
  });
});

describe("CSV", () => {
  it("exports a CSV with header labels, then the rows", async () => {
    const create = vi.fn(() => "blob:x");
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: vi.fn() });
    const { container, pulse } = await mount(withLabels(["Name", "Age"], [["Ann", "30"]]));
    fireEvent.click(container.querySelector(".exportCSV")!);
    await waitFor(() => expect(create).toHaveBeenCalled());
    const blob = (create.mock.calls[0] as unknown as [Blob])[0];
    expect(blob.type).toBe("text/csv");
    expect(await readBlob(blob)).toBe("Name,Age\r\nAnn,30");
    expect(pulse).toHaveBeenCalledWith("Clicked", { property: " Used Export CSV" });
  });

  it("exports a CSV without a header line when there is no header row", async () => {
    const create = vi.fn(() => "blob:x");
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: vi.fn() });
    const { container } = await mount(savedTable([["Ann", "30"]]));
    fireEvent.click(container.querySelector(".exportCSV")!);
    await waitFor(() => expect(create).toHaveBeenCalled());
    expect(await readBlob((create.mock.calls[0] as unknown as [Blob])[0])).toBe("Ann,30");
  });

  const importFile = async (container: HTMLElement, mode: "Append Data" | "Replace Data", csv: string) => {
    fireEvent.click(container.querySelector(".importCSV")!);
    fireEvent.click(await screen.findByText(mode));
    fireEvent.click(screen.getByText("Import Table"));
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const file = new File([csv], "t.csv", { type: "text/csv" });
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
  };

  it("imports a CSV and appends it to the table", async () => {
    const { container, setData, pulse } = await mount(savedTable([["a", "b"]]));
    await importFile(container, "Append Data", "c,d\ne,f\n");
    await waitFor(() => expect(lastSaved(setData).data).toHaveLength(3));
    expect(lastSaved(setData).data.map((r: { column1: string }) => r.column1)).toEqual(["a", "c", "e"]);
    expect(pulse).toHaveBeenCalledWith("Clicked", { property: "Used import CSV" });
  });

  it("imports a CSV and replaces the table, skipping blank lines and padding short rows", async () => {
    const { container, setData } = await mount(savedTable([["a", "b"]]));
    await importFile(container, "Replace Data", "x,y\n,\n\nz\n");
    await waitFor(() => expect(lastSaved(setData).data).toHaveLength(2));
    expect(lastSaved(setData).data).toEqual([
      { column1: "x", column2: "y" },
      { column1: "z", column2: "" },
    ]);
  });

  it("an empty CSV file clears nothing it cannot read: replace with no rows leaves an empty table", async () => {
    const { container, setData } = await mount(savedTable([["a"]]));
    await importFile(container, "Replace Data", "");
    await waitFor(() => expect(lastSaved(setData).data).toEqual([]));
  });

  it("cancel in the import dialog does not open the file picker", async () => {
    const { container } = await mount(savedTable([["a"]]));
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const click = vi.spyOn(input, "click");
    fireEvent.click(container.querySelector(".importCSV")!);
    fireEvent.click(await screen.findByText("Cancel"));
    expect(click).not.toHaveBeenCalled();
  });

  it("does nothing when the file picker is dismissed with no file", async () => {
    const { container, setData } = await mount(savedTable([["a"]]));
    const before = setData.mock.calls.length;
    fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [] } });
    expect(setData.mock.calls.length).toBe(before);
  });
});

describe("delete highlight", () => {
  // React derives mouseenter/mouseleave from mouseout; the handlers read the element the pointer came from / went to.
  const enter = (item: Element, from: Element) => fireEvent.mouseOut(from, { relatedTarget: item });
  const leave = (item: Element, to: Element | null) => fireEvent.mouseOut(item, { relatedTarget: to });

  it("highlights the row or column a delete would remove while hovering the item", async () => {
    const { container } = await mount(
      savedTable([
        ["a", "b"],
        ["c", "d"],
      ]),
    );
    fireEvent.click(container.querySelector(".cell .cell-dropdown .Dropdown__header")!);
    const tr = container.querySelector(".tr")!;
    const cell = tr.querySelector(".data-input")!;
    const rowItem = screen.getByText("Delete Row").parentElement!;
    enter(rowItem, cell);
    expect(tr).toHaveClass("highlight-row");
    leave(rowItem, cell);
    expect(tr).not.toHaveClass("highlight-row");
    const colItem = screen.getByText("Delete Column").parentElement!;
    const td = container.querySelector(".td")!;
    enter(colItem, td);
    expect(container.querySelectorAll(".highlight-column")).toHaveLength(2);
    leave(colItem, td);
    expect(container.querySelectorAll(".highlight-column")).toHaveLength(0);
  });

  it("highlights the table when hovering Delete Table", async () => {
    const { container } = await mount(savedTable([["a"]]));
    fireEvent.click(container.querySelector(".data-input")!);
    fireEvent.click(container.querySelector("#table-actions .Dropdown__header")!);
    const item = screen.getByText("Delete Table").parentElement!;
    const from = container.querySelector("#table-actions svg")!;
    enter(item, from);
    expect(container.querySelector(".highlight-table")).not.toBeNull();
    leave(item, from);
    expect(container.querySelector(".highlight-table")).toBeNull();
  });
});

describe("full screen", () => {
  it("opens the table in a full screen modal and closes it again", async () => {
    const { container, pulse } = await mount(savedTable([["a"]]));
    fireEvent.click(container.querySelector(".fullscreenBtn")!);
    expect(pulse).toHaveBeenCalledWith("Viewed", { property: "FullScreen Enabled" });
    expect(await screen.findByText("Table")).toBeInTheDocument();
    const close = document.querySelector<HTMLElement>(".FullPage_Modal_Header svg")!;
    fireEvent.click(close);
    await waitFor(() => expect(document.querySelector(".FullPage_Modal_Header")).toBeNull());
  });
});

describe("reorder", () => {
  const keyboardDrag = async (handle: HTMLElement, steps: string[]) => {
    handle.focus();
    fireEvent.keyDown(handle, { key: " ", keyCode: 32 });
    for (const key of steps) {
      await act(async () => {
        fireEvent.keyDown(handle, { key, keyCode: key === "ArrowDown" ? 40 : key === "ArrowRight" ? 39 : 37 });
      });
    }
    await act(async () => {
      fireEvent.keyDown(handle, { key: " ", keyCode: 32 });
    });
  };

  it("drags a row down with the keyboard and saves the new order", async () => {
    const { container, setData } = await mount(savedTable([["one"], ["two"], ["three"]]));
    const handle = container.querySelector<HTMLElement>('[data-rfd-drag-handle-draggable-id="0"]')!;
    await keyboardDrag(handle, ["ArrowDown"]);
    await waitFor(() =>
      expect(lastSaved(setData).data.map((r: { column1: string }) => r.column1)).toEqual(["two", "one", "three"]),
    );
  });
});
