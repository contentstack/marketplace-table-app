export type CellValue = string | number | null;

export interface TableColumn {
  id: string;
  accessor: string;
  dataType: "text" | "number" | "select";
  /** Present only while a header row is on. */
  label?: string;
  options?: { label: string; backgroundColor: string }[];
  sortState?: unknown;
}

export interface TableState {
  columns: TableColumn[];
  data: Record<string, CellValue>[];
  skipReset: boolean;
  headerRowAdded?: boolean;
  headerColumnAdded?: boolean;
  tableActionEnabled?: boolean;
}
