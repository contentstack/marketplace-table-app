import { useEffect, useState } from 'react';
import ContentEditable from 'react-contenteditable';
import { Dropdown, Icon } from '@contentstack/venus-components';
import { ReactComponent as InsertRowAbove } from '../../assets/insertRowAbove.svg';
import { ReactComponent as InsertRowBelow } from '../../assets/insertRowBelow.svg';
import { ReactComponent as DeleteRow } from '../../assets/deleteRow.svg';
import { ReactComponent as InsertColumnLeft } from '../../assets/insertColumnLeft.svg';
import { ReactComponent as InsertColumnRight } from '../../assets/insertColumnRight.svg';
import { ReactComponent as DeleteColumn } from '../../assets/deleteColumn.svg';

export default function Cell({
  value: initialValue,
  row: { index },
  column: { id, dataType, options },
  dataDispatch,
}) {
  const [value, setValue] = useState({ value: initialValue, update: true });
  const onChange = (e) => {
    setValue({ value: e.target.value, update: true });
  };
  const [showAdd, setShowAdd] = useState(false);
  const [addSelectRef, setAddSelectRef] = useState<any>(null);

  useEffect(() => {
    setValue({ value: initialValue, update: true });
  }, [initialValue]);

  useEffect(() => {
    if (value.update) {
      dataDispatch({ type: 'update_cell', columnId: id, rowIndex: index, value: value.value });
    }
  }, [value, dataDispatch, id, index]);

  const handleClick = (e) => {
    let tableActions = document.getElementById('table-actions')!;
    tableActions.style.display = 'block';
  };

  const insertRowAbove = () => {
    dataDispatch({ type: 'insert_row_above', rowIndex: index });
  };

  const insertRowBelow = () => {
    dataDispatch({ type: 'insert_row_below', rowIndex: index });
  };

  const deleteRow = () => {
    dataDispatch({ type: 'delete_row', rowIndex: index });
  };

  const insertColumnLeft = () => {
    dataDispatch({ type: 'insert_column_left', columnId: id });
  };

  const insertColumnRight = () => {
    dataDispatch({ type: 'insert_column_right', columnId: id });
  };

  const deleteColumn = () => {
    dataDispatch({ type: 'delete_column', columnId: id });
  };

  const CustomDelete = () => {
    useEffect(() => {
      const collection = document.getElementsByClassName('label')!;

      for (let i = 0; i <= collection.length; i++) {
        collection[i]?.parentElement?.classList.add('delete-option');
      }
    }, []);

    return (
      <>
        <DeleteRow />
        <div className="label">Delete Row</div>
      </>
    );
  };

  useEffect(() => {
    if (addSelectRef && showAdd) {
      addSelectRef.focus();
    }
  }, [addSelectRef, showAdd]);

  let element;
  switch (dataType) {
    case 'text':
      element = (
        <div
          className="cell"
          onFocus={(e: any) => {
            console.log('onFocus', e.target?.parentNode, e.target);
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
              list={[
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
                  label: <CustomDelete />,
                },
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
                  default: true,
                  action: insertColumnRight,
                  label: (
                    <>
                      <InsertColumnRight />
                      <div>Insert Column Right</div>
                    </>
                  ),
                },
                {
                  action: deleteColumn,
                  label: (
                    <>
                      <DeleteColumn />
                      <div className="label">Delete Column</div>
                    </>
                  ),
                },
              ]}
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
