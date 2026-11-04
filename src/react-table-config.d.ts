/* eslint-disable @typescript-eslint/no-empty-object-type -- module augmentation needs empty interfaces */
import {
  UseColumnOrderInstanceProps,
  UseFiltersColumnProps,
  UseFiltersInstanceProps,
  UseFiltersOptions,
  UseGlobalFiltersInstanceProps,
  UseGlobalFiltersOptions,
  UseGlobalFiltersState,
  UseResizeColumnsColumnProps,
  UseRowStateOptions,
  UseSortByColumnProps,
  UseSortByOptions,
} from "react-table";

declare module "react-table" {
  // Only the plugin options table.tsx passes to useTable, plus the two custom ones (read by Cell, Header and useExportData).
  export interface TableOptions<D extends object>
    extends UseSortByOptions<D>, UseFiltersOptions<D>, UseGlobalFiltersOptions<D>, UseRowStateOptions<D> {
    dataDispatch: (action: { type: string; [key: string]: unknown }) => void;
    getExportFileBlob: (args: { columns: unknown[]; data: unknown[]; fileType: string }) => Blob | undefined;
  }
  export interface TableInstance<D extends object = object>
    extends UseColumnOrderInstanceProps<D>, UseFiltersInstanceProps<D>, UseGlobalFiltersInstanceProps<D> {
    exportData: (fileType: string, onlyVisible?: boolean) => void;
  }
  export interface TableState<D extends object = object> extends UseGlobalFiltersState<D> {}
  export interface ColumnInstance<D extends object = object>
    extends UseFiltersColumnProps<D>, UseResizeColumnsColumnProps<D>, UseSortByColumnProps<D> {}
  export interface HeaderGroup<D extends object = object>
    extends UseResizeColumnsColumnProps<D>, UseSortByColumnProps<D> {
    accessor?: any;
  }
}
