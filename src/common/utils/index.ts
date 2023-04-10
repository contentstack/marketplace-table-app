function makeData(count) {
  let data: any = [];

  for (let i = 0; i < count; i++) {
    let row = {
      column1: '',
      column2: '',
      column3: '',
    };

    data.push(row);
  }

  let columns = [
    {
      id: 'column1',
      accessor: 'column1',
      dataType: 'text',
    },
    {
      id: 'column2',
      accessor: 'column2',
      dataType: 'text',
    },
    {
      id: 'column3',
      accessor: 'column3',
      dataType: 'text',
    },
  ];

  return { columns: columns, data: data, skipReset: false };
}

function shortId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

function randomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 95%, 90%)`;
}

const utils = {
  makeData,
  shortId,
  randomColor,
};

export const eventNames: { [key: string]: string } = {
  USED_IMPORT_CSV: 'Used import CSV',
  IMPORT_RADIO_OPTIONS: 'Import CSV Radio Option Changed',
  EXPORT_OPTION: 'Used Export CSV',
  ADD_TABLE: 'Add Table',
  DELETE_TABLE: 'Delete Table',
  SEARCH_RECORDS: 'Searching records',
  FULLSCREEN_MODE: 'FullScreen Enabled',
  APP_INITIALIZE: 'App Loaded Successfully',
  APP_INITIALIZE_FAILURE: 'App Load Failure',
};

export default utils;
