import React, { useEffect } from 'react';

export type IconProps = {
  text: string;
  Icon: JSX.Element;
  type: string;
};

const CustomDelete: React.FC<IconProps> = ({ text, Icon, type }) => {
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

        if (type === 'row') {
          let rowEl = (el as Element)?.closest('.tr');

          rowEl?.classList.add('highlight-row');
        } else if (type === 'column') {
          let colEl: any = (el as Element)?.closest('.td') as HTMLElement;
          let trEls = document.getElementsByClassName('tr');

          const index = Array.from(colEl.parentElement.children).indexOf(colEl);

          Array.from(trEls).forEach((trEl) => {
            trEl.children[index].classList.add('highlight-column');
          });
        } else {
          let tableEl = (el as Element)?.closest('.table-actions')?.nextSibling
            ?.lastChild as HTMLElement;

          tableEl?.classList.add('highlight-table');
        }
      }}
      onMouseLeave={(e) => {
        let el = e.relatedTarget;
        if (type === 'row') {
          let rowEl = (el as Element)?.closest('.tr');

          rowEl?.classList.remove('highlight-row');
        } else if (type === 'column') {
          let colEl: any = (el as Element)?.closest('.td') as HTMLElement;
          let trEls = document.getElementsByClassName('tr');

          const index = Array.from(colEl.parentElement.children).indexOf(colEl);

          Array.from(trEls).forEach((trEl) => {
            trEl.children[index].classList.remove('highlight-column');
          });
        } else {
          let tableEl = (el as Element)?.closest('.table-actions')?.nextSibling
            ?.lastChild as HTMLElement;

          tableEl?.classList.remove('highlight-table');
        }
      }}
    >
      {Icon}
      <div className="label option">{text}</div>
    </div>
  );
};

export default CustomDelete;
