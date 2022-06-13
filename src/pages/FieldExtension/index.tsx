import React, { useState, useEffect, useReducer } from 'react';
import { isEmpty, has, omit, map } from 'lodash';
import ContentstackAppSdk from '@contentstack/app-sdk';
import { Button, Dropdown, ToggleSwitch } from '@contentstack/venus-components';
import strings from 'common/locale/en-us';
import utils from '../../common/utils';
import Table from './table';
import CustomDelete from './customDelete';
import { ReactComponent as TableActions } from '../../assets/tableActions.svg';
import { ReactComponent as HeaderRow } from '../../assets/headerRow.svg';
import { ReactComponent as DeleteTable } from '../../assets/deleteTable.svg';
import './styles.scss';

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
      return {
        ...tableState,
        skipReset: true,
        data: [
          ...tableState.data.slice(0, action.rowIndex),
          {},
          ...tableState.data.slice(action.rowIndex, tableState.data.length),
        ],
      };
    case 'insert_row_below':
      return {
        ...tableState,
        skipReset: true,
        data: [
          ...tableState.data.slice(0, action.rowIndex + 1),
          {},
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
    default:
      return tableState;
  }
}

const FieldExtension: React.FC = () => {
  const [state, setState] = useState<{
    config: any;
    location: Partial<{ customField: { [key: string]: any }; [key: string]: any }>;
    appSdkInitialized: boolean;
  }>({
    config: {},
    location: {},
    appSdkInitialized: false,
  });
  const [table, setTable] = useState<boolean>();
  const [tableData, setTableData] = useState<any>({});
  const [headerRowChange, setHeaderRowChange] = useState<boolean>(false);
  const [tableState, dispatch] = useReducer(reducer, utils.makeData(3));

  useEffect(() => {
    ContentstackAppSdk.init().then(async (appSdk) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.iframeRef = document.getElementById('root');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.postRobot = appSdk.postRobot;
      const config = await appSdk.getConfig();
      const initialData = appSdk.location.CustomField?.field.getData();

      if (
        !isEmpty(initialData) &&
        !isEmpty(initialData.tableState.columns) &&
        !isEmpty(initialData.tableState.data)
      ) {
        setTableData(initialData.tableState);
        setTable(true);
        if (has(tableData, 'columns[0].label')) setHeaderRowChange(true);
        dispatch({ type: 'initial_data', payload: tableData });
      }

      appSdk.location.CustomField?.frame.enableAutoResizing();
      setState({ config, appSdkInitialized: true, location: appSdk.location });
    });
  }, []);

  useEffect(() => {
    dispatch({ type: 'enable_reset' });
  }, [tableState.data, tableState.columns]);

  useEffect(() => {
    const { location } = state;
    location.CustomField?.field.setData({ tableState: tableState });
  }, [tableState]);

  const handleClick = () => {
    setTable(true);
    dispatch({ type: 'initial_table', payload: utils.makeData(3) });
  };

  const handleHeaderRowChange = () => {
    if (!headerRowChange) {
      dispatch({ type: 'add_row_header' });
    } else {
      dispatch({ type: 'remove_row_header' });
    }

    setHeaderRowChange(!headerRowChange);
  };

  const deleteTable = () => {
    setTable(false);
    dispatch({ type: 'delete_table' });
  };

  return (
    <div className="field-extension">
      {state.appSdkInitialized && (
        <div className="field-extension-wrapper">
          {table ? (
            <>
              <div className="table-actions" id="table-actions">
                <Dropdown
                  adjustWidthForContent={false}
                  arrowSecondary={false}
                  closeAfterSelect={false}
                  dropDownPosition="bottom"
                  dropDownType="primary"
                  highlightActive={false}
                  isMultiCheck={false}
                  list={[
                    {
                      default: true,
                      label: (
                        <>
                          <HeaderRow />
                          <div>Header Row</div>
                          <div className="toggle">
                            <ToggleSwitch
                              name="headerRowChange"
                              id="headerRowChange"
                              onChange={handleHeaderRowChange}
                              checked={headerRowChange}
                              testId="cs-toggle-switch"
                            />
                          </div>
                        </>
                      ),
                    },
                    {
                      action: deleteTable,
                      label: (
                        <CustomDelete text={'Delete Table'} Icon={<DeleteTable />} type={'table'} />
                      ),
                    },
                  ]}
                  testId="cs-dropdown"
                  type="click"
                  viewAs="label"
                >
                  <TableActions />
                </Dropdown>
              </div>
              <Table
                columns={[...tableState.columns]}
                data={[...tableState.data]}
                dispatch={dispatch}
                skipReset={tableState.skipReset}
                headerRowChange={headerRowChange}
              />
            </>
          ) : (
            <div className="no-asset">
              <span>{strings.tableNotAddedText}</span>
            </div>
          )}
          {!table && (
            <span>
              <Button
                className="add-product-btn"
                buttonType="control"
                onClick={() => handleClick()}
              >
                {strings.ctaText}
              </Button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FieldExtension;
