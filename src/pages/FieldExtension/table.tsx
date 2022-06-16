import React, { useMemo, useState, useRef } from 'react';
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
import { has } from 'lodash';
import { useExportData } from 'react-table-plugins';
import Papa from 'papaparse';
import Cell from './cell';
import Header from './header';
import { ReactComponent as Search } from '../../assets/search.svg';
import { ReactComponent as HoverSortIcon } from '../../assets/hoverSortIcon.svg';
import { ReactComponent as SortedDescUpArrow } from '../../assets/sortDescUpArrow.svg';
import { ReactComponent as SortedAscDownArrow } from '../../assets/sortAscDownArrow.svg';
import { Tooltip, Button, cbModal } from '@contentstack/venus-components';
import { ImportCSVModal } from 'components/csvImport/csvImportDialog';
import { ExcelRenderer } from 'react-excel-renderer';
import { ReactComponent as ImportCSV } from '../../assets/importCSV.svg';
import { ReactComponent as ExportCSV } from '../../assets/exportCSV.svg';
import strings from 'common/locale/en-us';
import FullScreenPage from './fullScreenPage';
import { ReactComponent as MaximizeScreen } from '../../assets/maximize-button.svg';

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
  fullScreen,
}) {
  const [hoveredColumnId, setColumnId] = useState('');
  const [displaySortIcon, setDisplay] = useState('notdisplayed');
  const [appendData, setAppendData] = useState(true);
  const fileElement = useRef(null);
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
    exportData,
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
      getExportFileBlob,
    },
    useFlexLayout,
    useResizeColumns,
    useFilters,
    useGlobalFilter,
    useSortBy,
    useExportData,
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
        // do nothing.
      },
      onSave: (bAppend) => {
        setAppendData(bAppend);
        if (fileElement) {
          let elFile = fileElement.current;
          if (elFile) {
            // eslint-disable-next-line
            // @ts-ignore
            elFile.click();
          }
        }
      },
    });
  };

  const fileHandler = (e) => {
    let fileObj = e.target.files[0];

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

    for (let rowIndex = 0; rowIndex < excelData?.rows?.length; rowIndex++) {
      let row = {};
      for (let colIndex = 0; colIndex < columnCount; colIndex++) {
        let columnKey: string;
        columnKey = 'column' + (colIndex + 1);

        row[columnKey] = excelData?.rows[rowIndex][colIndex];
      }

      data.push(row);
    }

    let columns: any = [];
    for (let colIndex = 0; colIndex < columnCount; colIndex++) {
      let columnKey: string;
      let column = {};
      columnKey = 'column' + (colIndex + 1);
      column['id'] = columnKey;
      column['accessor'] = columnKey;
      column['dataType'] = 'text';
      columns.push(column);
    }

    return { columns: columns, data: data, skipReset: false };
  }

  function getExportFileBlob({ columns, data, fileType }) {
    if (fileType === 'csv') {
      let csvString;
      if (has(columns[0], 'label')) {
        const headerNames = columns.map((col) => col.label);
        csvString = Papa.unparse({ fields: headerNames, data });
      } else {
        csvString = Papa.unparse({ data });
      }

      return new Blob([csvString], { type: 'text/csv' });
    }
  }
  const openModal = () => {
    cbModal({
      component: (modalProps) => <FullScreenPage {...modalProps} fullScreen={true} />,
      modalProps: {
        size: 'customSize',
      },
    });
  };

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
            ref={fileElement}
            style={{ display: 'none' }}
            accept=".csv, text/csv"
            onChange={fileHandler}
          />
          <Tooltip content={strings.exportTableText} position="auto" showArrow={true}>
            <ExportCSV
              className="exportCSV"
              type="button"
              onClick={() => exportData('csv', true)}
            />
          </Tooltip>
          {!fullScreen && (
            <Tooltip content={strings.maximizerText} position="auto" showArrow={true}>
              <MaximizeScreen className="importCSV" type="button" onClick={openModal} />
            </Tooltip>
          )}
        </div>
        <div className="table-data">
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
                        {...column.getHeaderProps(
                          column.getSortByToggleProps({ title: undefined }),
                        )}
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
      </div>
    </>
  );
}
