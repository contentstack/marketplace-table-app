import React, { useState, useEffect } from 'react';
import _, { isEmpty } from 'lodash';
import ContentstackAppSdk from '@contentstack/app-sdk';
import { Button } from '@contentstack/venus-components';
import { CellEditable } from './editTable';
import strings from 'common/locale/en-us';
import './styles.scss';

const FieldExtension: React.FC = () => {
  const [state, setState] = useState<{
    config: any;
    location: Partial<{ customField: { [key: string]: any }; [key: string]: any }>;
    appSdkInitialized: boolean;
  }>({
    config: {},
    location: {},
    appSdkInitialized: false,
  });
  const [table, setTable] = useState<boolean>();
  const [tableData, setTableData] = useState<any[]>([]);

  useEffect(() => {
    ContentstackAppSdk.init().then(async (appSdk) => {
      const config = await appSdk.getConfig();
      const initialData = appSdk.location.CustomField?.field.getData();

      if (initialData !== null && initialData !== undefined && !isEmpty(initialData)) {
        setTableData(initialData);
      }

      appSdk.location.CustomField?.frame.enableAutoResizing();
      setState({ config, appSdkInitialized: true, location: appSdk.location });
    });
  }, []);

  useEffect(() => {
    const { location } = state;
    location.CustomField?.field.setData(tableData);
  }, [tableData]);

  const handleClick = () => {
    console.log('Clicked ----> Add table');
    setTable(true);
  };

  return (
    <div className="field-extension">
      {state.appSdkInitialized && (
        <div className="field-extension-wrapper">
          {table ? (
            <CellEditable />
          ) : (
            <div className="no-asset">
              <span>{strings.tableNotAddedText}</span>
            </div>
          )}
          <Button className="add-product-btn" buttonType="control" onClick={() => handleClick()}>
            {strings.ctaText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FieldExtension;
