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

function uniqueIdGenerator() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
  uniqueIdGenerator,
};

export default utils;
