import React, { forwardRef } from 'react';
import _, { isEmpty } from 'lodash';
import MaterialTable, { Icons } from 'material-table';
import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import { ReactComponent as SortArrow } from '../../assets/sortArrow.svg';

const tableIcons: Icons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <SortArrow {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

export const CellEditable = () => {
  const { useState } = React;

  const [columns, setColumns] = useState<any>([
    {
      title: 'Name',
      field: 'name',
      // cellStyle: {
      //   // backgroundColor: '#039be5',
      //   borderBottom: 'none',
      // },
    },
    { title: 'Surname', field: 'surname' },
    {
      title: 'Birth Place',
      field: 'birthCity',
    },
  ]);

  const [data, setData] = useState<any>([
    { name: 'Mehmet', surname: 'Baran', birthYear: 1987, birthCity: 63 },
    { name: 'Zerya Betül', surname: 'Baran', birthYear: 2017, birthCity: 34 },
  ]);

  // const tableIcons: Icons = {
  //   Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  //   SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  // };

  return (
    <MaterialTable
      icons={tableIcons}
      columns={columns}
      options={{
        toolbar: false,
        draggable: true,
        paging: false,
        tableLayout: 'fixed',
        headerStyle: {
          backgroundColor: '#F5F5F5',
          color: '#222222',
          fontWeight: 600,
          fontFamily: 'Inter',
          border: '1px solid #F5F5F5',
        },
        rowStyle: {
          border: '1px solid #F5F5F5',
        },
      }}
      style={{
        border: '1px solid #F5F5F5',
        borderRadius: '10px',
        color: '#222222',
        boxShadow: 'none',
      }}
      data={data}
      cellEditable={{
        onCellEditApproved: (newValue, oldValue, rowData: any, columnDef: any) => {
          return new Promise((resolve, reject) => {
            console.log('newValue: ' + newValue, oldValue, rowData, columnDef);

            setTimeout(() => {
              if (!isEmpty(data)) {
                console.log('data', data);
                const dataUpdate: any = [...data];
                const index: any = rowData.tableData.id;
                dataUpdate[index][columnDef.field] = newValue;

                setData([...dataUpdate]);

                resolve();
              }
            }, 1000);
          });
        },
      }}
    />
  );
};
