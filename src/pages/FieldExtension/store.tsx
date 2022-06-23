import utils from '../../common/utils';
import { map, omit } from 'lodash';
import { atom } from 'jotai';
import { useReducerAtom } from 'jotai/utils';

function createEmptyRow(columnCount) {
  let row = {};
  for (let colIndex = 0; colIndex < columnCount; colIndex++) {
    let columnKey: string;
    columnKey = 'column' + (colIndex + 1);

    row[columnKey] = '';
  }
  return row;
}

function reducer(tableState, action) {
  switch (action.type) {
    case 'add_option_to_column':
      const optionIndex = tableState.columns.findIndex((column) => column.id === action.columnId);
      return {
        ...tableState,
        skipReset: true,
        columns: [
          ...tableState.columns.slice(0, optionIndex),
          {
            ...tableState.columns[optionIndex],
            options: [
              ...tableState.columns[optionIndex].options,
              { label: action.option, backgroundColor: action.backgroundColor },
            ],
          },
          ...tableState.columns.slice(optionIndex + 1, tableState.columns.length),
        ],
      };
    case 'add_row':
      return {
        ...tableState,
        skipReset: true,
        data: [...tableState.data, {}, []],
      };
    case 'insert_row_above':
      const emptyRowAbove = createEmptyRow(tableState.columns.length);
      return {
        ...tableState,
        skipReset: true,
        data: [
          ...tableState.data.slice(0, action.rowIndex),
          emptyRowAbove,
          ...tableState.data.slice(action.rowIndex, tableState.data.length),
        ],
      };
    case 'insert_row_below':
      const emptyRowBelow = createEmptyRow(tableState.columns.length);
      return {
        ...tableState,
        skipReset: true,
        data: [
          ...tableState.data.slice(0, action.rowIndex + 1),
          emptyRowBelow,
          ...tableState.data.slice(action.rowIndex + 1, tableState.data.length),
        ],
      };
    case 'delete_row':
      // tableState.data[action.rowIndex].classList.add('delete-option');
      //TODO : If table has only one row then delete the table
      return {
        ...tableState,
        skipReset: true,
        data: [
          ...tableState.data.slice(0, action.rowIndex),
          ...tableState.data.slice(action.rowIndex + 1, tableState.data.length),
        ],
      };
    case 'update_column_type':
      const typeIndex = tableState.columns.findIndex((column) => column.id === action.columnId);
      switch (action.dataType) {
        case 'number':
          if (tableState.columns[typeIndex].dataType === 'number') {
            return tableState;
          } else {
            return {
              ...tableState,
              columns: [
                ...tableState.columns.slice(0, typeIndex),
                { ...tableState.columns[typeIndex], dataType: action.dataType },
                ...tableState.columns.slice(typeIndex + 1, tableState.columns.length),
              ],
              data: tableState.data.map((row) => ({
                ...row,
                [action.columnId]: isNaN(row[action.columnId])
                  ? ''
                  : Number.parseInt(row[action.columnId]),
              })),
            };
          }
        case 'select':
          if (tableState.columns[typeIndex].dataType === 'select') {
            return {
              ...tableState,
              columns: [
                ...tableState.columns.slice(0, typeIndex),
                { ...tableState.columns[typeIndex], dataType: action.dataType },
                ...tableState.columns.slice(typeIndex + 1, tableState.columns.length),
              ],
              skipReset: true,
            };
          } else {
            let options: any = [];
            tableState.data.forEach((row) => {
              if (row[action.columnId]) {
                options.push({
                  label: row[action.columnId],
                  backgroundColor: utils.randomColor(),
                });
              }
            });
            return {
              ...tableState,
              columns: [
                ...tableState.columns.slice(0, typeIndex),
                {
                  ...tableState.columns[typeIndex],
                  dataType: action.dataType,
                  options: [...tableState.columns[typeIndex].options, ...options],
                },
                ...tableState.columns.slice(typeIndex + 1, tableState.columns.length),
              ],
              skipReset: true,
            };
          }
        case 'text':
          if (tableState.columns[typeIndex].dataType === 'text') {
            return tableState;
          } else if (tableState.columns[typeIndex].dataType === 'select') {
            return {
              ...tableState,
              skipReset: true,
              columns: [
                ...tableState.columns.slice(0, typeIndex),
                { ...tableState.columns[typeIndex], dataType: action.dataType },
                ...tableState.columns.slice(typeIndex + 1, tableState.columns.length),
              ],
            };
          } else {
            return {
              ...tableState,
              skipReset: true,
              columns: [
                ...tableState.columns.slice(0, typeIndex),
                { ...tableState.columns[typeIndex], dataType: action.dataType },
                ...tableState.columns.slice(typeIndex + 1, tableState.columns.length),
              ],
              data: tableState.data.map((row) => ({
                ...row,
                [action.columnId]: row[action.columnId] + '',
              })),
            };
          }
        default:
          return tableState;
      }
    case 'insert_column_left':
      const leftIndex = tableState.columns.findIndex((column) => column.id === action.columnId);
      let leftId = utils.shortId();
      return {
        ...tableState,
        skipReset: true,
        columns: [
          ...tableState.columns.slice(0, leftIndex),
          {
            id: leftId,
            label: '',
            accessor: leftId,
            dataType: 'text',
            created: action.focus && true,
            options: [],
          },
          ...tableState.columns.slice(leftIndex, tableState.columns.length),
        ],
      };
    case 'insert_column_right':
      const rightIndex = tableState.columns.findIndex((column) => column.id === action.columnId);
      const rightId = utils.shortId();
      return {
        ...tableState,
        skipReset: true,
        columns: [
          ...tableState.columns.slice(0, rightIndex + 1),
          {
            id: rightId,
            label: '',
            accessor: rightId,
            dataType: 'text',
            created: action.focus && true,
            options: [],
          },
          ...tableState.columns.slice(rightIndex + 1, tableState.columns.length),
        ],
      };
    case 'delete_column':
      const deleteIndex = tableState.columns.findIndex((column) => column.id === action.columnId);
      return {
        ...tableState,
        skipReset: true,
        columns: [
          ...tableState.columns.slice(0, deleteIndex),
          ...tableState.columns.slice(deleteIndex + 1, tableState.columns.length),
        ],
      };
    case 'enable_reset':
      return {
        ...tableState,
        skipReset: false,
      };
    case 'update_cell':
      tableState.data[action.rowIndex][action.columnId] = action.value;
      return { ...tableState };
    case 'add_row_header':
      const firstRow = tableState.data[0];
      Object.keys(firstRow).map((value, index) => {
        tableState.columns[index] = {
          id: value,
          label: firstRow[value],
          accessor: value,
          dataType: 'text',
        };
      });

      tableState.headerRowAdded = true;
      tableState.data.slice(1);
      return { ...tableState, data: [...tableState.data.slice(1)] };
    case 'remove_row_header':
      let labels = tableState.columns.map((a) => a.label);
      let columnIds = tableState.columns.map((a) => a.id);
      let row: any = {};
      columnIds.map((value, index) => {
        row[value] = labels[index];
      });

      let columns = map(tableState.columns, (o) => omit(o, ['label']));
      tableState.headerRowAdded = false;
      return {
        ...tableState,
        skipReset: true,
        columns: [...columns],
        data: [row, ...tableState.data],
      };
    case 'delete_table':
      return { ...tableState, columns: [], data: [] };
    case 'initial_data':
      return {
        ...tableState,
        skipReset: true,
        columns: [...action.payload.columns],
        data: [...action.payload.data],
      };
    case 'initial_table':
      return {
        ...tableState,
        columns: [...action.payload.columns],
        data: [...action.payload.data],
      };
    case 'update_sort_type':
      const colIndex = tableState.columns.findIndex((column) => column.id === action.columnId);
      return {
        ...tableState,
        columns: [
          ...tableState.columns.slice(0, colIndex),
          { ...tableState.columns[colIndex], sortState: action.newSortType },
          ...tableState.columns.slice(colIndex + 1, tableState.columns.length),
        ],
        //data: [...tableState.data],
      };
    case 'append_data_to_table':
      const columnsArray = [
        ...tableState.columns.slice(0, tableState.columns.length),
        ...action.payload.columns.slice(tableState.columns.length, action.payload.columns.length),
      ];
      return {
        ...tableState,
        columns: columnsArray,
        data: [...tableState.data.slice(0, tableState.data.length), ...action.payload.data],
      };
    case 'enable_table_action':
      tableState.tableActionEnabled = true;
      return {
        ...tableState,
        tableActionEnabled: true,
      };
    case 'drag_rows_update':
      return {
        ...tableState,
        data: action.payload.data,
      };
    default:
      return tableState;
  }
}

export const tableStateAtom = atom(utils.makeData(3));

export const useTableData = () => {
  return useReducerAtom(tableStateAtom, reducer);
};
