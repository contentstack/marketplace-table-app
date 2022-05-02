import React, { useState, useEffect, useReducer } from 'react';
import _, { isEmpty } from 'lodash';
import ContentstackAppSdk from '@contentstack/app-sdk';
import { Button } from '@contentstack/venus-components';
import strings from 'common/locale/en-us';
import './styles.scss';
import makeData from './makeData';
import Table from './table';
import { randomColor, shortId } from './utils';
import { grey } from './colors';

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
  const [tableData, setTableData] = useState<any[]>([]);

  useEffect(() => {
    ContentstackAppSdk.init().then(async (appSdk) => {
      const config = await appSdk.getConfig();
      const initialData = appSdk.location.CustomField?.field.getData();

      if (initialData !== null && initialData !== undefined && !isEmpty(initialData)) {
        setTableData(initialData);
      }

      appSdk.location.CustomField?.frame.enableAutoResizing();
      setState({ config, appSdkInitialized: true, location: appSdk.location });
    });
  }, []);

  const [tableState, dispatch] = useReducer(reducer, makeData(3));

  useEffect(() => {
    dispatch({ type: 'enable_reset' });
  }, [tableState.data, tableState.columns]);

  useEffect(() => {
    const { location } = state;
    location.CustomField?.field.setData(tableData);
  }, [tableData]);

  const handleClick = () => {
    console.log('Clicked ----> Add table');
    setTable(true);
  };

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
                    backgroundColor: randomColor(),
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

      case 'add_column_to_left':
        const leftIndex = tableState.columns.findIndex((column) => column.id === action.columnId);
        let leftId = shortId();
        return {
          ...tableState,
          skipReset: true,
          columns: [
            ...tableState.columns.slice(0, leftIndex),
            {
              id: leftId,
              label: 'Column',
              accessor: leftId,
              dataType: 'text',
              created: action.focus && true,
              options: [],
            },
            ...tableState.columns.slice(leftIndex, tableState.columns.length),
          ],
        };
      case 'add_column_to_right':
        const rightIndex = tableState.columns.findIndex((column) => column.id === action.columnId);
        const rightId = shortId();
        return {
          ...tableState,
          skipReset: true,
          columns: [
            ...tableState.columns.slice(0, rightIndex + 1),
            {
              id: rightId,
              label: 'Column',
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
      default:
        return tableState;
    }
  }

  return (
    <div className="field-extension">
      {state.appSdkInitialized && (
        <div className="field-extension-wrapper">
          {table ? (
            <Table
              columns={tableState.columns}
              data={tableState.data}
              dispatch={dispatch}
              skipReset={tableState.skipReset}
            />
          ) : (
            <div className="no-asset">
              <span>{strings.tableNotAddedText}</span>
            </div>
          )}
          <Button className="add-product-btn" buttonType="control" onClick={() => handleClick()}>
            {strings.ctaText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FieldExtension;

// import React, { useEffect, useReducer } from "react";
// import "./style.css";
// import makeData from "./makeData";
// import Table from "./Table";
// import { randomColor, shortId } from "./utils";
// import { grey } from "./colors";

// function reducer(state, action) {
//   switch (action.type) {
//     case "add_option_to_column":
//       const optionIndex = state.columns.findIndex(
//         (column) => column.id === action.columnId
//       );
//       return {
//         ...state,
//         skipReset: true,
//         columns: [
//           ...state.columns.slice(0, optionIndex),
//           {
//             ...state.columns[optionIndex],
//             options: [
//               ...state.columns[optionIndex].options,
//               { label: action.option, backgroundColor: action.backgroundColor }
//             ]
//           },
//           ...state.columns.slice(optionIndex + 1, state.columns.length)
//         ]
//       };
//     case "add_row":
//       return {
//         ...state,
//         skipReset: true,
//         data: [...state.data, {}, ...state.data]
//       };
//     case "update_column_type":
//       const typeIndex = state.columns.findIndex(
//         (column) => column.id === action.columnId
//       );
//       switch (action.dataType) {
//         case "number":
//           if (state.columns[typeIndex].dataType === "number") {
//             return state;
//           } else {
//             return {
//               ...state,
//               columns: [
//                 ...state.columns.slice(0, typeIndex),
//                 { ...state.columns[typeIndex], dataType: action.dataType },
//                 ...state.columns.slice(typeIndex + 1, state.columns.length)
//               ],
//               data: state.data.map((row) => ({
//                 ...row,
//                 [action.columnId]: isNaN(row[action.columnId])
//                   ? ""
//                   : Number.parseInt(row[action.columnId])
//               }))
//             };
//           }
//         case "select":
//           if (state.columns[typeIndex].dataType === "select") {
//             return {
//               ...state,
//               columns: [
//                 ...state.columns.slice(0, typeIndex),
//                 { ...state.columns[typeIndex], dataType: action.dataType },
//                 ...state.columns.slice(typeIndex + 1, state.columns.length)
//               ],
//               skipReset: true
//             };
//           } else {
//             let options = [];
//             state.data.forEach((row) => {
//               if (row[action.columnId]) {
//                 options.push({
//                   label: row[action.columnId],
//                   backgroundColor: randomColor()
//                 });
//               }
//             });
//             return {
//               ...state,
//               columns: [
//                 ...state.columns.slice(0, typeIndex),
//                 {
//                   ...state.columns[typeIndex],
//                   dataType: action.dataType,
//                   options: [...state.columns[typeIndex].options, ...options]
//                 },
//                 ...state.columns.slice(typeIndex + 1, state.columns.length)
//               ],
//               skipReset: true
//             };
//           }
//         case "text":
//           if (state.columns[typeIndex].dataType === "text") {
//             return state;
//           } else if (state.columns[typeIndex].dataType === "select") {
//             return {
//               ...state,
//               skipReset: true,
//               columns: [
//                 ...state.columns.slice(0, typeIndex),
//                 { ...state.columns[typeIndex], dataType: action.dataType },
//                 ...state.columns.slice(typeIndex + 1, state.columns.length)
//               ]
//             };
//           } else {
//             return {
//               ...state,
//               skipReset: true,
//               columns: [
//                 ...state.columns.slice(0, typeIndex),
//                 { ...state.columns[typeIndex], dataType: action.dataType },
//                 ...state.columns.slice(typeIndex + 1, state.columns.length)
//               ],
//               data: state.data.map((row) => ({
//                 ...row,
//                 [action.columnId]: row[action.columnId] + ""
//               }))
//             };
//           }
//         default:
//           return state;
//       }

//     case "add_column_to_left":
//       const leftIndex = state.columns.findIndex(
//         (column) => column.id === action.columnId
//       );
//       let leftId = shortId();
//       return {
//         ...state,
//         skipReset: true,
//         columns: [
//           ...state.columns.slice(0, leftIndex),
//           {
//             id: leftId,
//             label: "Column",
//             accessor: leftId,
//             dataType: "text",
//             created: action.focus && true,
//             options: []
//           },
//           ...state.columns.slice(leftIndex, state.columns.length)
//         ]
//       };
//     case "add_column_to_right":
//       const rightIndex = state.columns.findIndex(
//         (column) => column.id === action.columnId
//       );
//       const rightId = shortId();
//       return {
//         ...state,
//         skipReset: true,
//         columns: [
//           ...state.columns.slice(0, rightIndex + 1),
//           {
//             id: rightId,
//             label: "Column",
//             accessor: rightId,
//             dataType: "text",
//             created: action.focus && true,
//             options: []
//           },
//           ...state.columns.slice(rightIndex + 1, state.columns.length)
//         ]
//       };
//     case "delete_column":
//       const deleteIndex = state.columns.findIndex(
//         (column) => column.id === action.columnId
//       );
//       return {
//         ...state,
//         skipReset: true,
//         columns: [
//           ...state.columns.slice(0, deleteIndex),
//           ...state.columns.slice(deleteIndex + 1, state.columns.length)
//         ]
//       };
//     case "enable_reset":
//       return {
//         ...state,
//         skipReset: false
//       };
//     default:
//       return state;
//   }
// }

// function App() {
//   const [state, dispatch] = useReducer(reducer, makeData(10));

//   useEffect(() => {
//     dispatch({ type: "enable_reset" });
//   }, [state.data, state.columns]);

//   return (
//     <div
//       style={{
//         width: "100vw",
//         height: "100vh",
//         overflowX: "hidden"
//       }}
//     >
//       <div
//         style={{
//           height: 120,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           flexDirection: "column"
//         }}
//       >
//         <h1 style={{ color: grey(800) }}>Editable React Table</h1>
//       </div>
//       <div style={{ overflow: "auto", display: "flex" }}>
//         <div
//           style={{
//             flex: "1 1 auto",
//             padding: "1rem",
//             maxWidth: 1000,
//             marginLeft: "auto",
//             marginRight: "auto"
//           }}
//         >
//           <Table
//             columns={state.columns}
//             data={state.data}
//             dispatch={dispatch}
//             skipReset={state.skipReset}
//           />
//         </div>
//       </div>
//       <div
//         style={{
//           height: 140,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           flexDirection: "column"
//         }}
//       >
//         <p style={{ color: grey(600) }}>
//           Built by{" "}
//           <a
//             href="https://twitter.com/thesysarch"
//             style={{ color: grey(600), fontWeight: 600 }}
//           >
//             @thesysarch
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default App;
