import { useCallback, useEffect, useState } from 'react';
import ContentEditable from 'react-contenteditable';
import { Dropdown, Icon } from '@contentstack/venus-components';
import { ReactComponent as InsertRowAbove } from '../../assets/insertRowAbove.svg';
import { ReactComponent as InsertRowBelow } from '../../assets/insertRowBelow.svg';
import { ReactComponent as DeleteRow } from '../../assets/deleteRow.svg';
import { ReactComponent as InsertColumnLeft } from '../../assets/insertColumnLeft.svg';
import { ReactComponent as InsertColumnRight } from '../../assets/insertColumnRight.svg';
import { ReactComponent as DeleteColumn } from '../../assets/deleteColumn.svg';
import { useAnalytics } from 'hooks/useMixPanel';
import CustomDelete from './customDelete';
import { useTableData } from './store';
import utils from '../../common/utils';
import { map } from 'lodash';

const useColumns = () => {
  const [tableState, dispatch] = useTableData();
  return {
    addColumn: useCallback(
      (direction: string, columnId: string): string[] => {
        const index = tableState.columns.findIndex((column) => column.id === columnId);
        const newId: string = utils.shortId();
        const flag = direction === 'right' ? 1 : 0;

        // create the new columns array
        const columns = [
          ...tableState.columns.slice(0, index + flag),
          {
            id: newId,
            label: '',
            accessor: newId,
            dataType: 'text',
            created: false,
            options: [],
          },
          ...tableState.columns.slice(index + flag, tableState.columns.length),
        ];
        dispatch({ type: `insert_column_${direction}`, columns });
        return map(columns, 'id');
      },
      [tableState],
    ),
  };
};

export default function Cell({
  value: initialValue,
  row: { index },
  column: { id, dataType, options },
  dataDispatch,
  headerColumnChange,
  setColumnOrder,
}) {
  const { addColumn } = useColumns();
  const [value, setValue] = useState({ value: initialValue, update: true });
  const onChange = (e) => {
    setValue({ value: e.target.value, update: true });
  };
  const [showAdd, setShowAdd] = useState(false);
  const [addSelectRef, setAddSelectRef] = useState<any>(null);
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    setValue({ value: initialValue, update: true });
  }, [initialValue]);

  useEffect(() => {
    if (value.update) {
      dataDispatch({ type: 'update_cell', columnId: id, rowIndex: index, value: value.value });
    }
  }, [value, dataDispatch, id, index]);

  const handleClick = (e) => {
    dataDispatch({ type: 'enable_table_action' });
  };

  const insertRowAbove = () => {
    dataDispatch({ type: 'insert_row_above', rowIndex: index });
    //mixpanel event
    trackEvent('Insert row above');
  };

  const insertRowBelow = () => {
    dataDispatch({ type: 'insert_row_below', rowIndex: index });
    //mixpanel event
    trackEvent('Insert row below');
  };

  const deleteRow = () => {
    dataDispatch({ type: 'delete_row', rowIndex: index });
    //mixpanel event
    trackEvent('Delete row');
  };

  const insertColumnLeft = () => {
    const newColumns = addColumn('left', id);
    setColumnOrder(newColumns);
    //mixpanel event
    trackEvent('Insert column left');
  };

  const insertColumnRight = () => {
    const newColumns = addColumn('right', id);
    setColumnOrder(newColumns);
    //mixpanel event
    trackEvent('Insert column right');
  };

  const deleteColumn = () => {
    dataDispatch({ type: 'delete_column', columnId: id });
    //mixpanel event
    trackEvent('Delete column');
  };

  useEffect(() => {
    if (addSelectRef && showAdd) {
      addSelectRef.focus();
    }
  }, [addSelectRef, showAdd]);

  let list = [
    {
      default: true,
      action: insertRowAbove,
      label: (
        <>
          <InsertRowAbove />
          <div>Insert Row Above</div>
        </>
      ),
    },
    {
      default: true,
      action: insertRowBelow,
      label: (
        <>
          <InsertRowBelow />
          <div>Insert Row Below</div>
        </>
      ),
    },
    {
      action: deleteRow,
      label: <CustomDelete text={'Delete Row'} Icon={<DeleteRow />} type={'row'} />,
    },
    {
      default: true,
      action: insertColumnRight,
      label: (
        <>
          <InsertColumnRight />
          <div>Insert Column Right</div>
        </>
      ),
    },
  ];

  if (!headerColumnChange) {
    list.push(
      {
        default: true,
        action: insertColumnLeft,
        label: (
          <>
            <InsertColumnLeft />
            <div>Insert Column Left</div>
          </>
        ),
      },
      {
        action: deleteColumn,
        label: <CustomDelete text={'Delete Column'} Icon={<DeleteColumn />} type={'column'} />,
      },
    );
  }

  let element;
  switch (dataType) {
    case 'text':
      element = (
        <div
          className="cell"
          onFocus={(e: any) => {
            document
              .querySelector('.cs-extension-table .cell.active-cell')
              ?.classList.remove('active-cell');

            e.target?.parentNode.focus();

            e.target?.parentNode.classList.add('active-cell');
          }}
        >
          <ContentEditable
            html={(value.value && value.value.toString()) || ''}
            onChange={onChange}
            onClick={handleClick}
            onBlur={() => setValue((old) => ({ value: old.value, update: true }))}
            className="data-input"
          />
          <div className="cell-dropdown">
            <Dropdown
              adjustWidthForContent={false}
              arrowSecondary={false}
              closeAfterSelect={false}
              dropDownPosition="bottom"
              dropDownType="primary"
              highlightActive={false}
              isMultiCheck={false}
              list={list}
              testId="cs-dropdown"
              type="click"
              viewAs="label"
            >
              <Icon icon={'DownArrowEnabled'} size="small" />
            </Dropdown>
          </div>
        </div>
      );
      break;
    default:
      element = <span></span>;
      break;
  }

  return element;
}
