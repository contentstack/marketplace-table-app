import { faker } from '@faker-js/faker';
import { randomColor } from './utils';

export default function makeData(count) {
  let data: any = [];
  let options: any = [];
  for (let i = 0; i < count; i++) {
    let row = {
      column1: '',
      column2: '',
      column3: '',
    };
    // options.push({ label: row.music, backgroundColor: randomColor() });

    data.push(row);
  }

  let columns = [
    {
      id: 'column1',
      // label: 'First Name',
      accessor: 'column1',
      // minWidth: 100,
      dataType: 'text',
      // options: [],
    },
    {
      id: 'column2',
      // label: 'Last Name',
      accessor: 'column2',
      // minWidth: 100,
      dataType: 'text',
      // options: [],
    },
    {
      id: 'column3',
      // label: 'Last Name',
      accessor: 'column3',
      // minWidth: 100,
      dataType: 'text',
      // options: [],
    },
    // {
    //   id: 999999,
    //   width: 10,
    //   // label: '+',
    //   // disableResizing: true,
    //   dataType: 'null',
    // },
  ];
  return { columns: columns, data: data, skipReset: false };
}
