/* eslint-disable @typescript-eslint/no-empty-object-type -- module augmentation needs empty interfaces */
import {
  UseColumnOrderInstanceProps,
  UseFiltersColumnProps,
  UseFiltersInstanceProps,
  UseGlobalFiltersInstanceProps,
  UseGlobalFiltersState,
  UseResizeColumnsColumnProps,
  UseSortByColumnProps,
} from "react-table";

declare module "react-table" {
  export interface TableOptions<D extends object> extends Record<string, any> {}
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
