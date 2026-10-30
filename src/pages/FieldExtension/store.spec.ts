import { describe, expect, it } from "vitest";
import { reducer } from "./store";

const base = () => ({
  columns: [
    { id: "a", accessor: "a", dataType: "text", options: [] as unknown[] },
    { id: "b", accessor: "b", dataType: "text", options: [] as unknown[] },
  ],
  data: [
    { a: "1", b: "x" },
    { a: "two", b: "" },
  ],
  skipReset: false,
});

describe("reducer: rows", () => {
  it("inserts an empty row above and below the index", () => {
    const above = reducer(base(), { type: "insert_row_above", rowIndex: 1 });
    expect(above.data).toEqual([
      { a: "1", b: "x" },
      { column1: "", column2: "" },
      { a: "two", b: "" },
    ]);
    const below = reducer(base(), { type: "insert_row_below", rowIndex: 0 });
    expect(below.data).toEqual([
      { a: "1", b: "x" },
      { column1: "", column2: "" },
      { a: "two", b: "" },
    ]);
  });
  it("deletes the row at the index", () => {
    expect(reducer(base(), { type: "delete_row", rowIndex: 0 }).data).toEqual([{ a: "two", b: "" }]);
  });
  it("updates one cell", () => {
    const s = reducer(base(), { type: "update_cell", rowIndex: 1, columnId: "b", value: "new" });
    expect(s.data[1]).toEqual({ a: "two", b: "new" });
  });
  it("replaces row order on drag", () => {
    const data = [
      { a: "two", b: "" },
      { a: "1", b: "x" },
    ];
    expect(reducer(base(), { type: "drag_rows_update", payload: { data } }).data).toEqual(data);
  });
});

describe("reducer: columns", () => {
  it("replaces columns on insert left and right", () => {
    const columns = [{ id: "n" }];
    expect(reducer(base(), { type: "insert_column_left", columns }).columns).toEqual(columns);
    expect(reducer(base(), { type: "insert_column_right", columns }).columns).toEqual(columns);
  });
  it("deletes a column by id", () => {
    expect(reducer(base(), { type: "delete_column", columnId: "a" }).columns.map((c) => c.id)).toEqual(["b"]);
  });
  it("sets and clears a header label, ignoring unknown columns", () => {
    const s = reducer(base(), { type: "update_column_header", columnId: "b", label: "B" });
    expect(s.columns[1]).toMatchObject({ label: "B" });
    expect(reducer(s, { type: "update_column_header", columnId: "b" }).columns[1]).toMatchObject({ label: "" });
    const unknown = base();
    expect(reducer(unknown, { type: "update_column_header", columnId: "zz", label: "x" })).toBe(unknown);
  });
  it("keeps only id, label, accessor and dataType after a column drag, accessor = id", () => {
    const cols = [{ id: "b", label: "B", accessor: "zzz", dataType: "text", options: [], sortState: 1 }];
    const s = reducer(base(), { type: "drag_column_update", payload: { columns: cols } });
    expect(s.columns).toEqual([{ id: "b", label: "B", accessor: "b", dataType: "text" }]);
  });
});

describe("reducer: column types", () => {
  it("text to number turns numeric text into numbers and non-numeric into empty", () => {
    const s = reducer(base(), { type: "update_column_type", columnId: "a", dataType: "number" });
    expect(s.columns[0].dataType).toBe("number");
    expect(s.data.map((r) => r.a)).toEqual([1, ""]);
  });
  it("number to number changes nothing", () => {
    const n = reducer(base(), { type: "update_column_type", columnId: "a", dataType: "number" });
    expect(reducer(n, { type: "update_column_type", columnId: "a", dataType: "number" })).toBe(n);
  });
  it("text to select makes an option from each non-empty value", () => {
    const s = reducer(base(), { type: "update_column_type", columnId: "b", dataType: "select" });
    expect(s.columns[1].dataType).toBe("select");
    expect(s.columns[1].options.map((o: { label: string }) => o.label)).toEqual(["x"]);
  });
  it("select to select keeps the options", () => {
    const sel = reducer(base(), { type: "update_column_type", columnId: "b", dataType: "select" });
    const again = reducer(sel, { type: "update_column_type", columnId: "b", dataType: "select" });
    expect(again.columns[1].options).toHaveLength(1);
  });
  it("select to text keeps the data; number to text stringifies it", () => {
    const sel = reducer(base(), { type: "update_column_type", columnId: "b", dataType: "select" });
    expect(reducer(sel, { type: "update_column_type", columnId: "b", dataType: "text" }).columns[1].dataType).toBe(
      "text",
    );
    const num = reducer(base(), { type: "update_column_type", columnId: "a", dataType: "number" });
    const txt = reducer(num, { type: "update_column_type", columnId: "a", dataType: "text" });
    expect(txt.data.map((r) => r.a)).toEqual(["1", ""]);
  });
  it("text to text changes nothing, an unknown type changes nothing", () => {
    const s = base();
    expect(reducer(s, { type: "update_column_type", columnId: "a", dataType: "text" })).toBe(s);
    expect(reducer(s, { type: "update_column_type", columnId: "a", dataType: "date" })).toBe(s);
  });
});

describe("reducer: header row and column", () => {
  it("add_row_header moves the first row into column labels", () => {
    const s = reducer(base(), { type: "add_row_header" });
    expect(s.columns.map((c: { label: string }) => c.label)).toEqual(["1", "x"]);
    expect(s.data).toEqual([{ a: "two", b: "" }]);
  });
  it("remove_row_header puts the labels back as the first row and drops the label keys", () => {
    const withHeader = reducer(base(), { type: "add_row_header" });
    const s = reducer(withHeader, { type: "remove_row_header" });
    expect(s.data[0]).toEqual({ a: "1", b: "x" });
    expect(s.columns[0]).not.toHaveProperty("label");
  });
  it("toggles the header column flag", () => {
    expect(reducer(base(), { type: "add_col_header" })).toMatchObject({ headerColumnAdded: true });
    expect(reducer(base(), { type: "remove_col_header" })).toMatchObject({ headerColumnAdded: false });
  });
});

describe("reducer: whole table", () => {
  it("delete_table empties columns and data", () => {
    expect(reducer(base(), { type: "delete_table" })).toMatchObject({ columns: [], data: [] });
  });
  it("initial_data merges the saved state", () => {
    const s = reducer(base(), { type: "initial_data", payload: { headerColumnAdded: true, data: [] } });
    expect(s).toMatchObject({ headerColumnAdded: true, data: [] });
  });
  it("initial_table replaces columns and data", () => {
    const s = reducer(base(), { type: "initial_table", payload: { columns: [{ id: "q" }], data: [{ q: 1 }] } });
    expect(s.columns).toEqual([{ id: "q" }]);
    expect(s.data).toEqual([{ q: 1 }]);
  });
  it("append_data_to_table adds rows and any extra columns", () => {
    const payload = {
      columns: [{ id: "a" }, { id: "b" }, { id: "c" }],
      data: [{ a: "9", b: "9", c: "9" }],
    };
    const s = reducer(base(), { type: "append_data_to_table", payload });
    expect(s.columns.map((c: { id: string }) => c.id)).toEqual(["a", "b", "c"]);
    expect(s.data).toHaveLength(3);
  });
  it("enable_table_action and enable_reset set their flags", () => {
    expect(reducer(base(), { type: "enable_table_action" })).toMatchObject({ tableActionEnabled: true });
    expect(reducer({ ...base(), skipReset: true }, { type: "enable_reset" }).skipReset).toBe(false);
  });
  it("ignores unknown actions", () => {
    const s = base();
    expect(reducer(s, { type: "nope" })).toBe(s);
  });
});
