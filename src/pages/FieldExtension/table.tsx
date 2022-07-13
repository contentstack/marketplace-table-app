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
  useAbsoluteLayout,
  useColumnOrder,
} from 'react-table';
import styled from 'styled-components';
import { has } from 'lodash';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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
import { ReactComponent as DragIcon } from '../../assets/dragIcon.svg';
import { useAnalytics, useMixPanelGroups } from 'hooks/useMixPanel';

const { trackEvent } = useAnalytics();

const defaultColumn = {
  minWidth: 50,
  maxWidth: 400,
  Cell: Cell,
  Header: Header,
  sortType: 'alphanumericFalsyLast',
};

const RowContainer = styled.div`
  cursor: ${({ isDragging }) => (isDragging ? 'grabbing' : 'grab')};
  position: relative;

  .tr {
    border: ${({ isDragging }) => isDragging && '1px solid #6c5ce7'};
  }

  .rowDragIcon {
    path {
      fill: ${({ isDragging }) => isDragging && '#f5f5f5'};
      &:first-child {
        fill: ${({ isDragging }) => isDragging && '#6c5ce7'};
      }
    }
  }
`;

const HeaderContainer = styled.div`
  border: ${({ isDragging }) => isDragging && '2px solid #6C5CE7'};
  height: ${({ isDragging, height }) => isDragging && height + 'px !important'};
  opacity: ${({ isDragging }) => isDragging && '0.5'};
  svg {
    path {
      fill: ${({ isDragging }) => isDragging && '#f5f5f5'};
      &:first-child {
        fill: ${({ isDragging }) => isDragging && '#6c5ce7'};
      }
    }
  }
`;

const Clone = styled(HeaderContainer)`
  + div {
    display: none !important;
  }
`;

const Wrapper = styled.div`
  .tippy-wrapper {
    width: ${({ width }) => width + 'px'};
  }
`;

const getItemStyle = ({ isDragging, isDropAnimating }, draggableStyle) => ({
  ...draggableStyle,
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',

  ...(!isDragging && {
    transform: 'translate(0,0)',
  }),
  ...(isDropAnimating && { transitionDuration: '0.001s' }),

  // styles we need to apply on draggables
});

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
  const currentColOrder = React.useRef<any>();

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

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return { columns: columns, data: result, skipReset: false };
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setColumnOrder,
    state,
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
    useColumnOrder,
    // useAbsoluteLayout,
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
      // mixpanel event export
      trackEvent('Export CSV Completed');
      return new Blob([csvString], { type: 'text/csv' });
    }
  }

  const openModal = () => {
    // mixpanel event
    trackEvent('Clicked on FullScreen Mode');
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
              <MaximizeScreen className="fullscreenBtn" type="button" onClick={openModal} />
            </Tooltip>
          )}
        </div>

        <div className="table-data" id="tableRef">
          <div>
            {headerRowChange &&
              headerGroups &&
              headerGroups.map((headerGroup) => (
                <DragDropContext
                  onDragStart={() => {
                    currentColOrder.current = headerGroup.headers.map((o) => o.id);
                  }}
                  onDragUpdate={(dragUpdateObj, b) => {
                    const colOrder = [...currentColOrder.current];
                    const sIndex = dragUpdateObj.source.index;
                    const dIndex = dragUpdateObj.destination && dragUpdateObj.destination.index;

                    if (typeof sIndex === 'number' && typeof dIndex === 'number') {
                      colOrder.splice(sIndex, 1);
                      colOrder.splice(dIndex, 0, dragUpdateObj.draggableId);
                      setColumnOrder(colOrder);
                    }
                  }}
                  onDragEnd={() => {
                    dataDispatch({
                      type: 'drag_column_update',
                      payload: { columns: headerGroups[0].headers, data: rows, skipReset: false },
                    });
                    // mixpanel event
                    trackEvent('Column Order Changed');
                  }}
                >
                  <Droppable droppableId="droppable" direction="horizontal">
                    {(droppableProvided, droppableSnapshot) => (
                      <Wrapper
                        {...headerGroup.getHeaderGroupProps()}
                        ref={droppableProvided.innerRef}
                        className="tr"
                        width={
                          !fullScreen
                            ? (document.getElementsByClassName('td')[0] as HTMLElement)?.offsetWidth
                            : (document.querySelectorAll('.fullscreen .td')[0] as HTMLElement)
                                ?.offsetWidth
                        }
                      >
                        {headerGroup.headers.map((column, index) => (
                          <Draggable
                            key={column.id}
                            draggableId={column.id}
                            index={index}
                            isDragDisabled={!column.accessor}
                          >
                            {(provided, snapshot) => {
                              return (
                                <Tooltip
                                  content={headerTooltip(column)}
                                  position="top"
                                  disabled={snapshot.isDragging ? true : false}
                                  showArrow={false}
                                >
                                  <>
                                    <HeaderContainer
                                      className="tooltip-wrapper"
                                      {...column.getHeaderProps(
                                        column.getSortByToggleProps({ title: undefined }),
                                      )}
                                      onMouseEnter={(e) => showButton(e, column.id)}
                                      onMouseLeave={(e) => hideButton(e)}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      ref={provided.innerRef}
                                      isDragging={snapshot.isDragging}
                                      height={document.getElementById('tableRef')?.clientHeight}
                                      style={{
                                        ...getItemStyle(snapshot, provided.draggableProps.style),
                                      }}
                                    >
                                      <DragIcon className="dragIcon" />
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
                                              column.id == hoveredColumnId
                                                ? displaySortIcon
                                                : 'notdisplayed'
                                            }
                                          />
                                        )}
                                      </div>
                                    </HeaderContainer>
                                    {snapshot.isDragging && (
                                      <Clone>{column.render('Header')}</Clone>
                                    )}
                                  </>
                                </Tooltip>
                              );
                            }}
                          </Draggable>
                        ))}
                        {droppableProvided.placeholder}
                      </Wrapper>
                    )}
                  </Droppable>
                </DragDropContext>
              ))}
          </div>
          <div {...getTableBodyProps()}>
            <DragDropContext
              onDragEnd={(result) => {
                if (!result.destination) {
                  return;
                }

                if (result.destination.index === result.source.index) {
                  return;
                }

                const records = reorder(data, result.source.index, result.destination.index);

                dataDispatch({ type: 'drag_rows_update', payload: records });
                // mixpanel event
                trackEvent('Row Order Changed');
              }}
            >
              <Droppable droppableId="table">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {rows.length > 0 ? (
                      rows.map((row, i) => {
                        prepareRow(row);
                        return (
                          <Draggable
                            key={row.id.toString()}
                            draggableId={row.id.toString()}
                            index={i}
                          >
                            {(provided, snapshot) => (
                              <RowContainer
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                isDragging={snapshot.isDragging}
                              >
                                <DragIcon className="rowDragIcon" />
                                <div {...row.getRowProps()} className="tr">
                                  {row.cells.map((cell) => (
                                    <div {...cell.getCellProps()} className="td">
                                      {cell.render('Cell')}
                                    </div>
                                  ))}
                                </div>
                              </RowContainer>
                            )}
                          </Draggable>
                        );
                      })
                    ) : (
                      <div className="not-found">
                        <span>No records found</span>
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>
    </>
  );
}
