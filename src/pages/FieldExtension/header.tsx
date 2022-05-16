import React, { useState, useEffect } from 'react';
import { usePopper } from 'react-popper';
import { grey } from './colors';
import ArrowUpIcon from '../../assets/ArrowUp';
import ArrowDownIcon from '../../assets/ArrowDown';
import ArrowLeftIcon from '../../assets/ArrowLeft';
import ArrowRightIcon from '../../assets/ArrowRight';
import TrashIcon from '../../assets/Trash';
import TextIcon from '../../assets/Text';
import MultiIcon from '../../assets/Multi';
import HashIcon from '../../assets/Hash';
import { ReactComponent as PlusIcon } from '../../assets/plusIcon.svg';
import { shortId } from './utils';
import { ReactComponent as SortIcon } from '../../assets/Sort.svg';
//import { ReactComponent as SortDesc } from '../../assets/Sort.svg';

export default function Header({
  column: { id, created, label, dataType, getResizerProps, getHeaderProps, sortState },
  setSortBy,
  dataDispatch,
}) {
  const [expanded, setExpanded] = useState(created || false);
  const [referenceElement, setReferenceElement] = useState<any>(null);
  const [popperElement, setPopperElement] = useState<any>(null);
  const [inputRef, setInputRef] = useState<any>(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'bottom',
    strategy: 'absolute',
  });
  const [header, setHeader] = useState(label);
  const [typeReferenceElement, setTypeReferenceElement] = useState<any>(null);
  const [typePopperElement, setTypePopperElement] = useState<any>(null);
  const [showType, setShowType] = useState(false);
  const buttons = [
    {
      onClick: (e) => {
        dataDispatch({ type: 'update_column_header', columnId: id, label: header });
        setSortBy([{ id: id, desc: false }]);
        setExpanded(false);
      },
      icon: <ArrowUpIcon />,
      label: 'Sort ascending',
    },
    {
      onClick: (e) => {
        dataDispatch({ type: 'update_column_header', columnId: id, label: header });
        setSortBy([{ id: id, desc: true }]);
        setExpanded(false);
      },
      icon: <ArrowDownIcon />,
      label: 'Sort descending',
    },
    {
      onClick: (e) => {
        dataDispatch({ type: 'update_column_header', columnId: id, label: header });
        dataDispatch({ type: 'add_column_to_left', columnId: id, focus: false });
        setExpanded(false);
      },
      icon: <ArrowLeftIcon />,
      label: 'Insert left',
    },
    {
      onClick: (e) => {
        dataDispatch({ type: 'update_column_header', columnId: id, label: header });
        dataDispatch({ type: 'add_column_to_right', columnId: id, focus: false });
        setExpanded(false);
      },
      icon: <ArrowRightIcon />,
      label: 'Insert right',
    },
    {
      onClick: (e) => {
        dataDispatch({ type: 'update_column_header', columnId: id, label: header });
        dataDispatch({ type: 'delete_column', columnId: id });
        setExpanded(false);
      },
      icon: <TrashIcon />,
      label: 'Delete',
    },
  ];

  const types = [
    {
      onClick: (e) => {
        dataDispatch({ type: 'update_column_type', columnId: id, dataType: 'select' });
        setShowType(false);
        setExpanded(false);
      },
      icon: <MultiIcon />,
      label: 'Select',
    },
    {
      onClick: (e) => {
        dataDispatch({ type: 'update_column_type', columnId: id, dataType: 'text' });
        setShowType(false);
        setExpanded(false);
      },
      icon: <TextIcon />,
      label: 'Text',
    },
    {
      onClick: (e) => {
        dataDispatch({ type: 'update_column_type', columnId: id, dataType: 'number' });
        setShowType(false);
        setExpanded(false);
      },
      icon: <HashIcon />,
      label: 'Number',
    },
  ];

  let propertyIcon;
  switch (dataType) {
    case 'number':
      propertyIcon = <HashIcon />;
      break;
    case 'text':
      propertyIcon = <TextIcon />;
      break;
    case 'select':
      propertyIcon = <MultiIcon />;
      break;
    default:
      break;
  }

  useEffect(() => {
    if (created) {
      setExpanded(true);
    }
  }, [created]);

  useEffect(() => {
    setHeader(label);
  }, [label]);

  useEffect(() => {
    if (inputRef) {
      inputRef.focus();
      inputRef.select();
    }
  }, [inputRef]);

  const typePopper = usePopper(typeReferenceElement, typePopperElement, {
    placement: 'right',
    strategy: 'fixed',
  });

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      dataDispatch({ type: 'update_column_header', columnId: id, label: header });
      setExpanded(false);
    }
  }

  function handleChange(e) {
    setHeader(e.target.value);
  }

  function css(element, style) {
    for (const property in style) element.style[property] = style[property];
  }

  function setSortType(id, type) {
    setSortBy([{ id: id, desc: type }]);

    const note = document.querySelector('.note');
    css(note, {
      'background-color': 'yellow',
      color: 'red',
    });
  }

  function performSort(e) {
    if (sortState == undefined) {
      dataDispatch({ type: 'update_sort_type', columnId: id, newSortType: true });
      const myTimeout = setTimeout(() => setSortType(id, false), 500);
      //setSortBy([{ id: id, desc: false }]);
      //sortState = true;
    } else if (sortState) {
      dataDispatch({ type: 'update_sort_type', columnId: id, newSortType: false });
      const myTimeout = setTimeout(() => setSortType(id, true), 500);
      //setSortBy([{ id: id, desc: true }]);
      //sortState = false;
    } else {
      dataDispatch({ type: 'update_sort_type', columnId: id, newSortType: true });
      const myTimeout = setTimeout(() => setSortType(id, false), 500);
      //setSortBy([{ id: id, desc: false }]);
      //sortState = true;
    }
  }

  function handleBlur(e) {
    e.preventDefault();
    dataDispatch({ type: 'update_column_header', columnId: id, label: header });
  }

  return id !== 999999 ? (
    <>
      <div {...getHeaderProps({ style: { display: 'inline-block' } })} className="th noselect">
        <div className="th-content" ref={setReferenceElement}>
          {/* <span className="svg-icon svg-gray icon-margin">{propertyIcon}</span> */}
          {label}
          <div className="sort-box">
            <SortIcon onClick={performSort} />
            {/* <SortAsc onClick={() => setSortBy([{ id: id, desc: false }])} /> */}
          </div>
        </div>
        <div {...getResizerProps()} className="resizer" />
      </div>
      {expanded && <div className="overlay" onClick={() => setExpanded(false)} />}
      {expanded && (
        <div ref={setPopperElement} style={{ ...styles.popper, zIndex: 3 }} {...attributes.popper}>
          <div
            className="bg-white shadow-5 border-radius-md"
            style={{
              width: 240,
            }}
          >
            <div style={{ paddingTop: '0.75rem', paddingLeft: '0.75rem', paddingRight: '0.75rem' }}>
              <div className="is-fullwidth" style={{ marginBottom: 12 }}>
                <input
                  className="form-input"
                  ref={setInputRef}
                  type="text"
                  value={header}
                  style={{ width: '100%' }}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <span
                className="font-weight-600 font-size-75"
                style={{ textTransform: 'uppercase', color: grey(500) }}
              >
                Property Type
              </span>
            </div>
            <div style={{ padding: '4px 0px' }}>
              <button
                className="sort-button"
                type="button"
                onMouseEnter={() => setShowType(true)}
                onMouseLeave={() => setShowType(false)}
                ref={setTypeReferenceElement}
              >
                <span className="svg-icon svg-text icon-margin">{propertyIcon}</span>
                <span style={{ textTransform: 'capitalize' }}>{dataType}</span>
              </button>
              {showType && (
                <div
                  className="shadow-5 bg-white border-radius-m"
                  ref={setTypePopperElement}
                  onMouseEnter={() => setShowType(true)}
                  onMouseLeave={() => setShowType(false)}
                  {...typePopper.attributes.popper}
                  style={{
                    ...typePopper.styles.popper,
                    width: 200,
                    backgroundColor: 'white',
                    zIndex: 4,
                    padding: '4px 0px',
                  }}
                >
                  {types.map((type) => (
                    <button className="sort-button" onClick={type.onClick}>
                      <span className="svg-icon svg-text icon-margin">{type.icon}</span>
                      {type.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div
              key={shortId()}
              style={{
                borderTop: `2px solid ${grey(200)}`,
                padding: '4px 0px',
              }}
            >
              {buttons.map((button) => (
                <button type="button" className="sort-button" onMouseDown={button.onClick}>
                  <span className="svg-icon svg-text icon-margin">{button.icon}</span>
                  {button.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  ) : (
    <div {...getHeaderProps({ style: { display: 'inline-block' } })} className="th noselect">
      <div
        className="th-content"
        style={{ display: 'flex', justifyContent: 'center' }}
        onClick={(e) => dataDispatch({ type: 'add_column_to_left', columnId: 999999, focus: true })}
      >
        <span className="svg-icon-sm svg-gray">
          <PlusIcon />
        </span>
      </div>
    </div>
  );
}
