import React, { useMemo, useState } from 'react';
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
import { ReactComponent as HoverSortIcon } from '../../assets/hoverSortIcon.svg';
import { ReactComponent as SortedDescUpArrow } from '../../assets/sortDescUpArrow.svg';
import { ReactComponent as SortedAscDownArrow } from '../../assets/sortAscDownArrow.svg';
import { Tooltip, Button } from '@contentstack/venus-components';
import { ImportCSVModal } from 'components/csvImport/csvImportDialog';
import { ExcelRenderer } from 'react-excel-renderer';
import { ReactComponent as ImportCSV } from '../../assets/importCSV.svg';
import strings from 'common/locale/en-us';

const defaultColumn = {
  minWidth: 50,
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
  headerRowChange,
}) {
  const [hoveredColumnId, setColumnId] = useState('');
  const [displaySortIcon, setDisplay] = useState('notdisplayed');
  const [appendData, setAppendData] = useState(true);
  const showButton = (e, columnId) => {
    e.preventDefault();
    setDisplay('sort-displayed');
    setColumnId(columnId);
  };

  const hideButton = (e) => {
    e.preventDefault();
    setDisplay('notdisplayed');
    setColumnId('');
  };

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

  function headerTooltip(column) {
    const tooltip = column.isSorted
      ? column.isSortedDesc
        ? 'Clear Sorting'
        : 'Sort Descending'
      : column.id == hoveredColumnId
      ? 'Sort Ascending'
      : '';

    return tooltip;
  }

  const ImportCSVClicked = () => {
    ImportCSVModal({
      onCancel: () => {
        console.log('onRuledCancelled');
      },
      onSave: (bAppend) => {
        console.log('onSave : ', bAppend);
        setAppendData(bAppend);
        let el = document.getElementById('fileElem');
        if (el) {
          el.click();
        }
      },
    });
  };

  const fileHandler = (e) => {
    let fileObj = e.target.files[0];
    console.log(fileObj);

    //just pass the fileObj as parameter
    ExcelRenderer(fileObj, (err, resp) => {
      if (err) {
        console.log(err);
      } else {
        console.log(resp);
        let newData = convertExcelToTableData(resp);
        if (appendData) dataDispatch({ type: 'append_data_to_table', payload: newData });
        else dataDispatch({ type: 'initial_table', payload: newData });
      }
    });
    e.target.value = '';
  };

  function convertExcelToTableData(excelData) {
    let data: any = [];
    let columnCount = excelData?.cols?.length;

    for (let i = 0; i < excelData?.rows?.length; i++) {
      let row = {};
      for (let j = 0; j < columnCount; j++) {
        let columnKey: string;
        columnKey = 'column' + (j + 1);

        row[columnKey] = excelData?.rows[i][j];
      }

      data.push(row);
    }

    let columns: any = [];
    for (let j = 0; j < columnCount; j++) {
      let columnKey: string;
      let column = {};
      columnKey = 'column' + (j + 1);
      column['id'] = columnKey;
      column['accessor'] = columnKey;
      column['dataType'] = 'text';
      columns.push(column);
    }

    return { columns: columns, data: data, skipReset: false };
  }

  return (
    <>
      <div
        {...getTableProps()}
        className={clsx('table cs-extension-table', isTableResizing() && 'noselect')}
      >
        <div className="toolbar">
          <GlobalFilter
            preGlobalFilteredRows={preGlobalFilteredRows}
            globalFilter={state.globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
          <Tooltip content={strings.importCSVTitleText} position="auto" showArrow={true}>
            <ImportCSV className="importCSV" type="button" onClick={() => ImportCSVClicked()} />
          </Tooltip>
          <input
            type="file"
            id="fileElem"
            style={{ display: 'none' }}
            accept=".csv, text/csv"
            onChange={fileHandler}
          />
        </div>
        <div>
          {headerRowChange &&
            headerGroups &&
            headerGroups.map((headerGroup) => (
              <div {...headerGroup.getHeaderGroupProps()} className="tr">
                {/* {headerGroup.headers.map((column) => column.render('Header'))} */}
                {headerGroup.headers.map((column) => (
                  <Tooltip content={headerTooltip(column)} position="top" showArrow={false}>
                    <div
                      className="tooltip-wrapper"
                      {...column.getHeaderProps(column.getSortByToggleProps({ title: undefined }))}
                      onMouseEnter={(e) => showButton(e, column.id)}
                      onMouseLeave={(e) => hideButton(e)}
                    >
                      {column.render('Header')}
                      <div className="sort-box">
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <SortedDescUpArrow />
                          ) : (
                            <SortedAscDownArrow />
                          )
                        ) : (
                          <HoverSortIcon
                            className={
                              column.id == hoveredColumnId ? displaySortIcon : 'notdisplayed'
                            }
                          />
                        )}
                      </div>
                    </div>
                  </Tooltip>
                ))}
              </div>
            ))}
        </div>

        <div {...getTableBodyProps()}>
          {rows.length > 0 ? (
            rows.map((row, i) => {
              prepareRow(row);
              return (
                <div {...row.getRowProps()} className="tr">
                  {row.cells.map((cell) => (
                    <div {...cell.getCellProps()} className="td">
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
        </div>
      </div>
    </>
  );
}
