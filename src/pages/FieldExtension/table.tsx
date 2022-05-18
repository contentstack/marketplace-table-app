import React, { useMemo } from 'react';
import clsx from 'clsx';
import {
  useTable,
  useFlexLayout,
  useResizeColumns,
  useSortBy,
  useAsyncDebounce,
  useFilters,
  useGlobalFilter,
} from 'react-table';
import Cell from './cell';
import Header from './header';
import { ReactComponent as Search } from '../../assets/search.svg';

const defaultColumn = {
  minWidth: 50,
  width: 150,
  maxWidth: 400,
  Cell: Cell,
  Header: Header,
  sortType: 'alphanumericFalsyLast',
};

function GlobalFilter({ preGlobalFilteredRows, globalFilter, setGlobalFilter }) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <div className="search-wrapper">
      <div className="Search Search--medium Search--secondary">
        <div>
          <Search />
        </div>
        <div className="Search-input-show">
          <input
            className="Search__input"
            value={value || ''}
            onChange={(e) => {
              setValue(e.target.value);
              onChange(e.target.value);
            }}
            placeholder={`Search`}
          />
        </div>
      </div>
    </div>
  );
}

export default function Table({
  columns,
  data,
  dispatch: dataDispatch,
  skipReset,
  headerColumnChange,
  headerRowChange,
}) {
  const sortTypes = useMemo(
    () => ({
      alphanumericFalsyLast(rowA, rowB, columnId, desc) {
        if (!rowA.values[columnId] && !rowB.values[columnId]) {
          return 0;
        }

        if (!rowA.values[columnId]) {
          return desc ? -1 : 1;
        }

        if (!rowB.values[columnId]) {
          return desc ? 1 : -1;
        }

        return isNaN(rowA.values[columnId])
          ? rowA.values[columnId].localeCompare(rowB.values[columnId])
          : rowA.values[columnId] - rowB.values[columnId];
      },
    }),
    [],
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    visibleColumns,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      dataDispatch,
      autoResetSortBy: !skipReset,
      autoResetFilters: !skipReset,
      autoResetRowState: !skipReset,
      sortTypes,
    },
    useFlexLayout,
    useResizeColumns,
    useFilters,
    useGlobalFilter,
    useSortBy,
  );

  function isTableResizing() {
    for (let headerGroup of headerGroups) {
      for (let column of headerGroup.headers) {
        if (column.isResizing) {
          return true;
        }
      }
    }

    return false;
  }

  return (
    <>
      <div {...getTableProps()} className={clsx('table', isTableResizing() && 'noselect')}>
        <GlobalFilter
          preGlobalFilteredRows={preGlobalFilteredRows}
          globalFilter={state.globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
        <div>
          {headerRowChange &&
            headerGroups &&
            headerGroups.map((headerGroup) => (
              <div {...headerGroup.getHeaderGroupProps()} className="tr">
                {headerGroup.headers.map((column) => column.render('Header'))}
              </div>
            ))}
          {/* {headerColumnChange &&
            headerGroups &&
            headerGroups.map((headerGroup) => (
              <div {...headerGroup.getHeaderGroupProps()} className="tr">
                {headerGroup.headers.map((column) => column.render('Header'))}
              </div>
            ))} */}
        </div>

        <div {...getTableBodyProps()}>
          {rows.length > 0 ? (
            rows.map((row, i) => {
              prepareRow(row);
              return (
                <div {...row.getRowProps()} className="tr">
                  {row.cells.map((cell, index) => (
                    <div {...cell.getCellProps()} key={index} className="td">
                      {cell.render('Cell')}
                    </div>
                  ))}
                </div>
              );
            })
          ) : (
            <div className="not-found">
              <span>No records found</span>
            </div>
          )}
          {/* <div className="tr add-row" onClick={() => dataDispatch({ type: 'add_row' })}>
            <span className="svg-icon svg-gray" style={{ marginRight: 4 }}></span>
            New
          </div> */}
        </div>
      </div>
    </>
  );
}
