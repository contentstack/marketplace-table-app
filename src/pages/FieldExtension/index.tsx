import React, { useState, useEffect } from 'react';
import { isEmpty, has } from 'lodash';
import ContentstackAppSdk from '@contentstack/app-sdk';
import { Button, Dropdown, ToggleSwitch } from '@contentstack/venus-components';
import strings from 'common/locale/en-us';
import utils from '../../common/utils';
import Table from './table';
import CustomDelete from './customDelete';
import { ReactComponent as TableActions } from '../../assets/tableActions.svg';
import { ReactComponent as HeaderRow } from '../../assets/headerRow.svg';
import { ReactComponent as HeaderColumn } from '../../assets/headerColumn.svg';
import { ReactComponent as DeleteTable } from '../../assets/deleteTable.svg';
import './styles.scss';
import { fullScreenAtom, useTableData } from './store';
import useJsErrorTracker from 'hooks/useJsErrorTracker';
import useAnalytics from 'hooks/useAnalytics';
import { useAppSdk } from 'hooks/useAppSdk';
import { useAtom } from 'jotai';

export type fullScreenProps = {
  fullScreen: boolean;
};

const FieldExtension: React.FC<fullScreenProps> = ({ fullScreen = false }) => {
  // error tracking hook
  const [appSdk, setAppSdk] = useAppSdk();
  const { addMetadata } = useJsErrorTracker();
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
  const [headerRowChange, setHeaderRowChange] = useState<boolean>(false);
  const [headerColumnChange, setHeaderColumnChange] = useState<boolean>(false);
  const [tableState, dispatch] = useTableData();
  const { trackEvent } = useAnalytics();
  const [fullScreenMode] = useAtom(fullScreenAtom);

  useEffect(() => {
    try {
      ContentstackAppSdk.init().then(async (appSdk) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.iframeRef = document.getElementById('root');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.postRobot = appSdk.postRobot;
        const config = await appSdk.getConfig();
        let initialData = appSdk.location.CustomField?.field.getData();

        // app Sdk atom for pulse method being utilized in hooks.
        setAppSdk(appSdk);

        // Heap analytic

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        appSdk['pulse'] = console.log;

        /**
         * Heap analytic ts ignore would be removed later
         * Event name would be updated.
         */
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        appSdk?.pulse('App Loaded Successfully');

        if (
          !isEmpty(initialData) &&
          !isEmpty(initialData.tableState.columns) &&
          !isEmpty(initialData.tableState.data)
        ) {
          setTable(true);
          if (has(initialData.tableState, 'columns[0].label')) {
            setHeaderRowChange(true);
            initialData.tableState.headerRowAdded = true;
          } else {
            initialData.tableState.headerRowAdded = false;
          }
          if (initialData.tableState.headerColumnAdded) {
            setHeaderColumnChange(true);
          } else {
            setHeaderColumnChange(false);
            initialData.tableState.headerColumnAdded = false;
          }

          dispatch({ type: 'initial_data', payload: initialData.tableState });
        }
        // setting metadata for js error tracker
        addMetadata('stack', `${appSdk?.stack._data.name}`);
        addMetadata('organization', `${appSdk?.currentUser.defaultOrganization}`);
        addMetadata('api_key', `${appSdk?.stack._data.api_key}`);
        addMetadata('user_uid', `${appSdk?.stack._data.collaborators[0].uid}`);
        appSdk.location.CustomField?.frame.enableAutoResizing();
        setState({ config, appSdkInitialized: true, location: appSdk.location });
      });
    } catch (error) {
      console.error(error);
      /**
       * Heap analytic ts ignore would be removed later.
       * Event name would be updated.
       */
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      appSdk?.pulse('App Load Failure');
    }
  }, []);

  useEffect(() => {
    dispatch({ type: 'enable_reset' });
  }, [tableState.data, tableState.columns]);

  useEffect(() => {
    if (has(tableState, 'columns[0].label')) setHeaderRowChange(true);
    else setHeaderRowChange(false);
  }, [tableState.headerRowAdded]);

  useEffect(() => {
    if (tableState.headerColumnAdded) setHeaderColumnChange(true);
    else setHeaderColumnChange(false);
  }, [tableState.headerColumnAdded]);

  useEffect(() => {
    const { location } = state;
    location.CustomField?.field.setData({ tableState: tableState });
  }, [tableState]);

  const handleClick = () => {
    // Heap event ** event text would be updated **
    trackEvent('Add Table');
    setTable(true);
    dispatch({ type: 'initial_table', payload: utils.makeData(3) });
  };

  const handleHeaderRowChange = () => {
    if (!headerRowChange) {
      dispatch({ type: 'add_row_header' });
    } else {
      dispatch({ type: 'remove_row_header' });
    }

    setHeaderRowChange(!headerRowChange);
  };

  const handleHeaderColumnChange = () => {
    if (!headerColumnChange) {
      dispatch({ type: 'add_col_header' });
    } else {
      dispatch({ type: 'remove_col_header' });
    }

    setHeaderColumnChange(!headerColumnChange);
  };

  const deleteTable = () => {
    // Heap event ** event text would be updated **
    trackEvent('Delete Table');
    setTable(false);
    dispatch({ type: 'delete_table' });
  };

  if (fullScreenMode && !fullScreen) {
    return null;
  }

  return (
    <div className={'field-extension' + (fullScreen ? ' app-height' : '')}>
      {state.appSdkInitialized && (
        <div className="field-extension-wrapper">
          {table ? (
            <>
              {tableState.tableActionEnabled && (
                <div
                  className={
                    'table-actions' +
                    (fullScreen
                      ? ' table-action-fullscreen-placement'
                      : ' table-action-normal-placement')
                  }
                  id="table-actions"
                >
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
                            <HeaderRow />
                            <div className="table-option">Header Row</div>
                            <div className="toggle">
                              <ToggleSwitch
                                name="headerRowChange"
                                id="headerRowChange"
                                onChange={handleHeaderRowChange}
                                checked={headerRowChange}
                                testId="cs-toggle-switch"
                              />
                            </div>
                          </>
                        ),
                      },
                      {
                        default: true,
                        label: (
                          <>
                            <HeaderColumn />
                            <div className="table-option">Header Column</div>
                            <div className="toggle">
                              <ToggleSwitch
                                name="headerColumnChange"
                                id="headerColumnChange"
                                onChange={handleHeaderColumnChange}
                                checked={headerColumnChange}
                                testId="cs-toggle-switch"
                              />
                            </div>
                          </>
                        ),
                      },
                      {
                        action: deleteTable,
                        label: (
                          <CustomDelete
                            text={'Delete Table'}
                            Icon={<DeleteTable />}
                            type={'table'}
                          />
                        ),
                      },
                    ]}
                    testId="cs-dropdown"
                    type="click"
                    viewAs="label"
                  >
                    <TableActions />
                  </Dropdown>
                </div>
              )}
              <Table
                columns={[...tableState.columns]}
                data={[...tableState.data]}
                dispatch={dispatch}
                skipReset={tableState.skipReset}
                headerRowChange={headerRowChange}
                headerColumnChange={headerColumnChange}
                fullScreen={fullScreen}
              />
            </>
          ) : (
            <div className="no-asset">
              <span>{strings.tableNotAddedText}</span>
            </div>
          )}
          {!table && (
            <span>
              <Button
                className="add-product-btn"
                buttonType="control"
                onClick={() => handleClick()}
              >
                {strings.ctaText}
              </Button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FieldExtension;
