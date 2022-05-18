import { useEffect, useState } from 'react';
import ContentEditable from 'react-contenteditable';
import { Dropdown } from '@contentstack/venus-components';
import { ReactComponent as CellActions } from '../../assets/cellActions.svg';
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

  function handleClick(e) {
    let tableActions = document.getElementById('table-actions')!;
    // let cellDropdown = document.getElementById('table-actions')!;

    // console.log('e.target', e.target, e.target.nextElementSibling);

    tableActions.style.display = 'block';
    // e.target.nextElementSibling.style.display = 'block';
  }

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
        <div
          className="label"
          onClick={(e) => dataDispatch({ type: 'delete_row', rowIndex: index })}
        >
          Delete Row
        </div>
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
          // tabIndex={0}
          className="cell"
          // onFocus={(e: any) => {
          //   console.log('onFocus', e.target?.parentNode);
          //   e.target?.parentNode.focus();

          //   e.target.parentNode.getElementsByClassName('cell-dropdown')[0].style.visibility =
          //     'visible';
          // }}
          // onBlur={(e: any) => {
          //   console.log('onBlur', e.target?.parentNode);
          //   e.target.parentNode.getElementsByClassName('cell-dropdown')[0].style.visibility =
          //     'hidden';
          // }}
        >
          {/* <input type="text" className="data-input" /> */}
          <ContentEditable
            html={(value.value && value.value.toString()) || ''}
            onChange={onChange}
            onClick={handleClick}
            // onFocus={(e) => {
            //   console.log('onfocus', e);
            // }}
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
                  label: (
                    <>
                      <InsertRowAbove />
                      <div
                        onClick={(e) => dataDispatch({ type: 'insert_row_above', rowIndex: index })}
                      >
                        Insert Row Above
                      </div>
                    </>
                  ),
                },
                {
                  default: true,
                  label: (
                    <>
                      <InsertRowBelow />
                      <div
                        onClick={(e) => dataDispatch({ type: 'insert_row_below', rowIndex: index })}
                      >
                        Insert Row Below
                      </div>
                    </>
                  ),
                },
                {
                  label: <CustomDelete />,
                },
                {
                  default: true,
                  label: (
                    <>
                      <InsertColumnLeft />
                      <div
                        onClick={(e) => dataDispatch({ type: 'insert_column_left', columnId: id })}
                      >
                        Insert Column Left
                      </div>
                    </>
                  ),
                },
                {
                  default: true,
                  label: (
                    <>
                      <InsertColumnRight />
                      <div
                        onClick={(e) => dataDispatch({ type: 'insert_column_right', columnId: id })}
                      >
                        Insert Column Right
                      </div>
                    </>
                  ),
                },
                {
                  label: (
                    <>
                      <DeleteColumn />
                      <div
                        className="label"
                        onClick={(e) => dataDispatch({ type: 'delete_column', columnId: id })}
                      >
                        Delete Column
                      </div>
                    </>
                  ),
                },
              ]}
              testId="cs-dropdown"
              type="click"
              viewAs="label"
            >
              <CellActions />
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
