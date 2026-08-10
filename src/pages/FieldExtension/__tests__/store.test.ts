import { describe, it, expect } from "vitest";

type Column = {
  id: string;
  accessor: string;
  dataType: string;
  label: string;
  tooltip?: string;
  sortable?: boolean;
  options?: unknown[];
  sortState?: string;
};

type TableState = {
  columns: Column[];
  data: unknown[];
  headerRowAdded: boolean;
  headerColumnAdded: boolean;
  skipReset: boolean;
};

type Action =
  | { type: "update_column_tooltip"; columnId: string; tooltip: string }
  | { type: "toggle_column_sortable"; columnId: string }
  | { type: string; [key: string]: unknown };

function reducer(tableState: TableState, action: Action): TableState {
  switch (action.type) {
    case "update_column_tooltip":
      return {
        ...tableState,
        skipReset: true,
        columns: tableState.columns.map((col) =>
          col.id === action.columnId ? { ...col, tooltip: action.tooltip } : col,
        ),
      };
    // Toggles the renderer-level sortable flag on a column.
    // NOTE: This is NOT authoring-time sort (reorder rows). It is a per-column boolean
    // that the live website renderer reads to show/hide sort controls on the published page.
    case "toggle_column_sortable":
      return {
        ...tableState,
        columns: tableState.columns.map((col) =>
          col.id === action.columnId ? { ...col, sortable: !col.sortable } : col,
        ),
      };
    default:
      return tableState;
  }
}

const makeState = (columns: Column[]): TableState => ({
  columns,
  data: [],
  headerRowAdded: false,
  headerColumnAdded: false,
  skipReset: false,
});

describe("reducer – update_column_tooltip", () => {
  it("sets tooltip on the matching column", () => {
    const state = makeState([{ id: "col1", accessor: "col1", dataType: "text", label: "Rate" }]);
    const next = reducer(state, { type: "update_column_tooltip", columnId: "col1", tooltip: "APR info" });
    expect(next.columns[0].tooltip).toBe("APR info");
  });

  it("does not mutate other columns", () => {
    const state = makeState([
      { id: "col1", accessor: "col1", dataType: "text", label: "Rate" },
      { id: "col2", accessor: "col2", dataType: "number", label: "Amount" },
    ]);
    const next = reducer(state, { type: "update_column_tooltip", columnId: "col1", tooltip: "APR info" });
    expect(next.columns[1].tooltip).toBeUndefined();
    expect(next.columns[1].label).toBe("Amount");
  });

  it("overwrites an existing tooltip", () => {
    const state = makeState([{ id: "col1", accessor: "col1", dataType: "text", label: "Rate", tooltip: "old" }]);
    const next = reducer(state, { type: "update_column_tooltip", columnId: "col1", tooltip: "new value" });
    expect(next.columns[0].tooltip).toBe("new value");
  });

  it("sets skipReset to true", () => {
    const state = makeState([{ id: "col1", accessor: "col1", dataType: "text", label: "Rate" }]);
    const next = reducer(state, { type: "update_column_tooltip", columnId: "col1", tooltip: "tip" });
    expect(next.skipReset).toBe(true);
  });

  it("does nothing when columnId does not match", () => {
    const state = makeState([{ id: "col1", accessor: "col1", dataType: "text", label: "Rate" }]);
    const next = reducer(state, { type: "update_column_tooltip", columnId: "nonexistent", tooltip: "tip" });
    expect(next.columns[0].tooltip).toBeUndefined();
  });
});
