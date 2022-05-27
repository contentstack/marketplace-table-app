import React, { useEffect } from 'react';

export type IconProps = {
  text: string;
  Icon: JSX.Element;
};

const CustomDelete: React.FC<IconProps> = ({ text, Icon }) => {
  useEffect(() => {
    const collection = document.getElementsByClassName('label')!;

    for (let i = 0; i <= collection.length; i++) {
      collection[i]?.parentElement?.parentElement?.classList.add('delete-option');
    }
  }, []);

  return (
    <div
      style={{ display: 'flex' }}
      onMouseEnter={(e) => {
        let el = e.relatedTarget;
        let rowEl = (el as Element)?.closest('.tr');
        let tableEl = (el as Element)?.closest('.table-actions')?.nextSibling
          ?.lastChild as HTMLElement;

        // let x = document.getElementsByClassName('tr');
        // console.log('rorrrr-----------', x);
        // for (let i = 0; i < x.length; i++) {
        //   console.log('rorrrr', x[i].getElementsByClassName('td'));
        //   console.log(Array.prototype.indexOf.call(x, x[i]));
        // }

        // console.log('mouseOver', rowEl, tableEl, e);
        tableEl?.classList.add('highlight-table');
        rowEl?.classList.add('highlight-row');
      }}
      onMouseLeave={(e) => {
        let el = e.relatedTarget;
        if (el) {
          let rowEl = (el as Element)?.closest('.tr');
          let tableEl = (el as Element)?.closest('.table-actions')?.nextSibling
            ?.lastChild as HTMLElement;

          // console.log('onMouseLeave', rowEl, tableEl);
          tableEl?.classList.remove('highlight-table');
          rowEl?.classList.remove('highlight-row');
        }
      }}
    >
      {Icon}
      <div className="label">{text}</div>
    </div>
  );
};

export default CustomDelete;
