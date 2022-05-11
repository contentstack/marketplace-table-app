import React, { useEffect, useState } from 'react';
import ContentEditable from 'react-contenteditable';
import { Button, Dropdown, ToggleSwitch } from '@contentstack/venus-components';
import Relationship from './Relationship';
import { usePopper } from 'react-popper';
import { grey } from './colors';
import { ReactComponent as PlusIcon } from '../../assets/plusIcon.svg';
import { randomColor } from './utils';

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
  const [selectRef, setSelectRef] = useState<any>(null);
  const [selectPop, setSelectPop] = useState<any>(null);
  const [showSelect, setShowSelect] = useState(false);
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

  function handleOptionKeyDown(e) {
    if (e.key === 'Enter') {
      if (e.target.value !== '') {
        dataDispatch({
          type: 'add_option_to_column',
          option: e.target.value,
          backgroundColor: randomColor(),
          columnId: id,
        });
      }
      setShowAdd(false);
    }
  }

  function handleAddOption(e) {
    setShowAdd(true);
  }

  function deleteRow(e) {
    dataDispatch({
      type: 'delete_row',
      rowIndex: index,
    });
  }

  function HandleRowOperations(e, operation) {
    if (e.target.value !== '') {
      dataDispatch({
        type: operation,
        rowIndex: index,
      });
    }
  }

  function deleteColumn(e) {
    dataDispatch({
      type: 'delete_column',
      columnId: id,
    });
  }

  function handleOptionBlur(e) {
    if (e.target.value !== '') {
      dataDispatch({
        type: 'add_option_to_column',
        option: e.target.value,
        backgroundColor: randomColor(),
        columnId: id,
      });
    }
    setShowAdd(false);
  }

  const { styles, attributes } = usePopper(selectRef, selectPop, {
    placement: 'bottom-start',
    strategy: 'fixed',
  });

  function getColor() {
    let match = options.find((option) => option.label === value.value);
    return (match && match.backgroundColor) || grey(300);
  }

  useEffect(() => {
    if (addSelectRef && showAdd) {
      addSelectRef.focus();
    }
  }, [addSelectRef, showAdd]);

  let element;
  switch (dataType) {
    case 'text':
      element = (
        <div className="cell">
          <ContentEditable
            html={(value.value && value.value.toString()) || ''}
            onChange={onChange}
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
                        className="label"
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
                        className="label"
                        onClick={(e) => dataDispatch({ type: 'insert_row_below', rowIndex: index })}
                      >
                        Insert Row Below
                      </div>
                    </>
                  ),
                },
                {
                  // action: deleteTable,
                  label: (
                    <>
                      <DeleteRow />
                      <div
                        className="label"
                        onClick={(e) => dataDispatch({ type: 'delete_row', rowIndex: index })}
                      >
                        Delete Row
                      </div>
                    </>
                  ),
                },
                {
                  default: true,
                  label: (
                    <>
                      <InsertColumnLeft />
                      <div
                        className="label"
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
                        className="label"
                        onClick={(e) => dataDispatch({ type: 'insert_column_right', columnId: id })}
                      >
                        Insert Column Right
                      </div>
                    </>
                  ),
                },
                {
                  // action: deleteTable,
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
    case 'number':
      element = (
        <ContentEditable
          html={(value.value && value.value.toString()) || ''}
          onChange={onChange}
          onBlur={() => setValue((old) => ({ value: old.value, update: true }))}
          className="data-input text-align-right"
        />
      );
      break;
    case 'select':
      element = (
        <>
          <div
            ref={setSelectRef}
            className="cell-padding d-flex cursor-default align-items-center flex-1"
            onClick={() => setShowSelect(true)}
          >
            {value.value && <Relationship value={value.value} backgroundColor={getColor()} />}
          </div>
          {showSelect && <div className="overlay" onClick={() => setShowSelect(false)} />}
          {showSelect && (
            <div
              className="shadow-5 bg-white border-radius-md"
              ref={setSelectPop}
              {...attributes.popper}
              style={{
                ...styles.popper,
                zIndex: 4,
                minWidth: 200,
                maxWidth: 320,
                padding: '0.75rem',
              }}
            >
              <div className="d-flex flex-wrap-wrap" style={{ marginTop: '-0.5rem' }}>
                {options.map((option) => (
                  <div
                    className="cursor-pointer"
                    style={{ marginRight: '0.5rem', marginTop: '0.5rem' }}
                    onClick={() => {
                      setValue({ value: option.label, update: true });
                      setShowSelect(false);
                    }}
                  >
                    <Relationship value={option.label} backgroundColor={option.backgroundColor} />
                  </div>
                ))}
                {showAdd && (
                  <div
                    style={{
                      marginRight: '0.5rem',
                      marginTop: '0.5rem',
                      width: 120,
                      padding: '2px 4px',
                      backgroundColor: grey(200),
                      borderRadius: 4,
                    }}
                  >
                    <input
                      type="text"
                      className="option-input"
                      onBlur={handleOptionBlur}
                      ref={setAddSelectRef}
                      onKeyDown={handleOptionKeyDown}
                    />
                  </div>
                )}
                <div
                  className="cursor-pointer"
                  style={{ marginRight: '0.5rem', marginTop: '0.5rem' }}
                  onClick={handleAddOption}
                >
                  <Relationship
                    value={
                      <span className="svg-icon-sm svg-text">
                        <PlusIcon />
                      </span>
                    }
                    backgroundColor={grey(200)}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      );
      break;
    default:
      element = <span></span>;
      break;
  }

  return element;
}
