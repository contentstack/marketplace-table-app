import React, { useEffect } from 'react';

export type IconProps = {
  text: string;
  Icon: JSX.Element;
};

const CustomDelete: React.FC<IconProps> = ({ text, Icon }) => {
  useEffect(() => {
    const collection = document.getElementsByClassName('label')!;

    for (let i = 0; i <= collection.length; i++) {
      collection[i]?.parentElement?.classList.add('delete-option');
    }
  }, []);

  return (
    <>
      {Icon}
      <div className="label">{text}</div>
    </>
  );
};

export default CustomDelete;
