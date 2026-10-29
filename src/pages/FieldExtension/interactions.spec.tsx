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
  await act(async () => {});
  return { ...fake, ...view };
};

const labelled = (labels: string[], rows: string[][], extra: Record<string, unknown> = {}) => {
  const saved = savedTable(rows, extra);
  saved.tableState.columns = saved.tableState.columns.map((c, i) => ({ ...c, label: labels[i] }));
  return saved;
};

const KEYS = { " ": 32, ArrowDown: 40, ArrowRight: 39, ArrowLeft: 37, Escape: 27 } as const;
const press = async (el: HTMLElement, key: keyof typeof KEYS) =>
  act(async () => {
    fireEvent.keyDown(el, { key, keyCode: KEYS[key] });
  });
const drag = async (handle: HTMLElement, keys: (keyof typeof KEYS)[]) => {
  handle.focus();
  await press(handle, " ");
  for (const k of keys) await press(handle, k);
};

beforeEach(() => vi.clearAllMocks());

describe("header row", () => {
  it("drags a column to the right with the keyboard and saves the new order", async () => {
    const { container, setData } = await mount(labelled(["A", "B", "C"], [["1", "2", "3"]]));
    const handle = container.querySelector<HTMLElement>('[data-rfd-drag-handle-draggable-id="column1"]')!;
    await drag(handle, ["ArrowRight", " "]);
    await waitFor(() =>
      expect(lastSaved(setData).columns.map((c: { id: string }) => c.id)).toEqual(["column2", "column1", "column3"]),
    );
    expect(lastSaved(setData).columns[1]).toMatchObject({ label: "A", accessor: "column1" });
  });

  it("with a header column on, the first column header is not draggable but sorts", async () => {
    const { container } = await mount(
      labelled(
        ["A", "B"],
        [
          ["y", "1"],
          ["x", "2"],
        ],
        { headerColumnAdded: true },
      ),
    );
    expect(container.querySelector('[data-rfd-drag-handle-draggable-id="column1"]')).toBeNull();
    const first = container.querySelector<HTMLElement>(".tooltip-wrapper")!;
    fireEvent.mouseEnter(first);
    fireEvent.click(first);
    expect(Array.from(container.querySelectorAll(".cell-header .data-input")).map((e) => e.textContent)).toEqual([
      "x",
      "y",
    ]);
    fireEvent.click(first);
    expect(Array.from(container.querySelectorAll(".cell-header .data-input")).map((e) => e.textContent)).toEqual([
      "y",
      "x",
    ]);
    fireEvent.mouseLeave(first);
  });

  it("shows sort state and hover icons on the other headers", async () => {
    const { container } = await mount(
      labelled(
        ["A", "B"],
        [
          ["y", "1"],
          ["x", "2"],
        ],
      ),
    );
    const second = container.querySelectorAll<HTMLElement>(".tooltip-wrapper")[1];
    fireEvent.mouseEnter(second);
    expect(second.querySelector(".sort-displayed")).not.toBeNull();
    fireEvent.click(second);
    expect(second.querySelector(".sort-box svg")).not.toBeNull();
    fireEvent.click(second);
    fireEvent.mouseLeave(second);
    expect(second.querySelector(".sort-box svg")).not.toBeNull();
  });

  it("marks the table as resizing while a column border is dragged", async () => {
    const { container } = await mount(labelled(["A", "B"], [["1", "2"]]));
    const resizer = container.querySelector<HTMLElement>(".resizer")!;
    fireEvent.mouseDown(resizer, { clientX: 100 });
    expect(container.querySelector(".table")).toHaveClass("noselect");
    fireEvent.mouseUp(document);
  });

  it("header menu actions close the menu and keep the label", async () => {
    const { container } = await mount(labelled(["A"], [["1"]]));
    const open = () => fireEvent.contextMenu(container.querySelector(".th-content")!);
    for (const item of ["Sort ascending", "Sort descending", "Insert left", "Insert right"]) {
      open();
      fireEvent.mouseDown(screen.getByText(item));
      expect(document.querySelector("input.form-input")).toBeNull();
    }
    open();
    const header = container.querySelector<HTMLElement>(".header-editable")!;
    fireEvent.keyDown(header, { key: "Enter" });
    fireEvent.click(header);
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("hovering the type row opens and then closes the type list", async () => {
    const { container } = await mount(labelled(["A"], [["1"]]));
    fireEvent.contextMenu(container.querySelector(".th-content")!);
    const typeButton = screen.getByText("text");
    fireEvent.mouseEnter(typeButton);
    const list = screen.getByText("Select").closest("div")!;
    fireEvent.mouseEnter(list);
    fireEvent.mouseLeave(list);
    await waitFor(() => expect(screen.queryByText("Select")).toBeNull());
  });
});

describe("cells", () => {
  it("shows empty for saved values that are not text (null, object, NaN) and numbers as text", async () => {
    const saved = savedTable([["x", "y", "z", "w"]]);
    const row = saved.tableState.data[0] as Record<string, unknown>;
    row.column1 = null;
    row.column2 = { a: 1 };
    row.column3 = NaN;
    row.column4 = 7;
    const { container } = await mount(saved);
    expect(Array.from(container.querySelectorAll(".data-input")).map((e) => e.textContent)).toEqual(["", "", "", "7"]);
  });

  it("marks the focused cell active and keeps Enter inside the cell", async () => {
    const { container } = await mount(savedTable([["a", "b"]]));
    const [a, b] = Array.from(container.querySelectorAll<HTMLElement>(".cell"));
    fireEvent.focus(a);
    expect(a).toHaveClass("active-cell");
    fireEvent.focus(b);
    expect(a).not.toHaveClass("active-cell");
    expect(b).toHaveClass("active-cell");
    const outer = vi.fn();
    document.body.addEventListener("keydown", outer);
    fireEvent.keyDown(b.querySelector(".data-input")!, { key: "Enter" });
    expect(outer).not.toHaveBeenCalled();
    fireEvent.keyDown(b.querySelector(".data-input")!, { key: "a" });
    expect(outer).toHaveBeenCalled();
  });
});

describe("row drag", () => {
  const rows = () => savedTable([["one"], ["two"], ["three"]]);

  it("leaves the order alone when a drag is cancelled", async () => {
    const { container, setData } = await mount(rows());
    const before = setData.mock.calls.length;
    await drag(container.querySelector<HTMLElement>('[data-rfd-drag-handle-draggable-id="0"]')!, [
      "ArrowDown",
      "Escape",
    ]);
    expect(setData.mock.calls.length).toBe(before);
  });

  it("leaves the order alone when a row is dropped where it started", async () => {
    const { container, setData } = await mount(rows());
    const before = setData.mock.calls.length;
    await drag(container.querySelector<HTMLElement>('[data-rfd-drag-handle-draggable-id="0"]')!, [" "]);
    expect(setData.mock.calls.length).toBe(before);
  });
});
