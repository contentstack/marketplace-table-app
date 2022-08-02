import React, { useState } from 'react';
import {
  Button,
  cbModal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Radio,
} from '@contentstack/venus-components';
import './styles.scss';
import strings from 'common/locale/en-us';
import { useAnalytics } from 'hooks/useMixPanel';
import { ReactComponent as ImportTableIcon } from '../../assets/importTableIcon.svg';

export const ImportCSVModal = (props: { onCancel: () => void; onSave: (bAppend) => void }) => {
  const onClose = () => {
    props.onCancel();
  };

  return cbModal({
    component: (modalProps) => {
      const [appendData, setAppendData] = useState(true);
      const { trackEvent } = useAnalytics();

      const onCancel = () => {
        modalProps.closeModal();
        props.onCancel();
        //mixpanel event
        trackEvent('Import CSV Modal Closed');
      };

      const onSave = () => {
        modalProps.closeModal();
        props.onSave(appendData);
        //mixpanel event
        trackEvent('Import CSV Completed');
      };

      const handleToggleAppendData = (value) => {
        setAppendData(value);
        //mixpanel event
        trackEvent('Import CSV Radio Option Changed', {
          'Selected Option': value === true ? 'Append Data' : 'Replace Data',
        });
      };

      return (
        <div>
          <ModalHeader title={strings.importCSVTitleText} closeModal={onCancel}></ModalHeader>
          <ModalBody className="modalBodyCustomClass">
            <p className="dialog-body">{strings.importCSVDialogBody}</p>
            <span className="radio-block">
              <div className="Radio-wrapper">
                <Radio
                  defaultChecked
                  label={strings.appendDataText}
                  name="option"
                  value="AppendData"
                  onClick={() => handleToggleAppendData(true)}
                />
              </div>
              <div className="Radio-wrapper">
                <Radio
                  label={strings.replaceDataText}
                  name="option"
                  value="ReplaceData"
                  onClick={() => handleToggleAppendData(false)}
                />
              </div>
            </span>
          </ModalBody>
          <ModalFooter>
            <div className="footer--actions">
              <Button buttonType="outline" onClick={onCancel}>
                {' '}
                {strings.cancelText}{' '}
              </Button>
              <Button buttonType="primary" onClick={onSave}>
                <ImportTableIcon /> {strings.importTableText}{' '}
              </Button>
            </div>
          </ModalFooter>
        </div>
      );
    },
    modalProps: {
      onClose: onClose,
      shouldCloseOnOverlayClick: true,
      size: 'xsmall',
    },
  });
};
