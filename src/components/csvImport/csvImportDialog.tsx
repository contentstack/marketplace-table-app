import React, { useEffect, useState, useRef } from 'react';
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

export const ImportCSVModal = (props: { onCancel: () => void; onSave: (bAppend) => void }) => {
  const onClose = (_data: any) => {
    props.onCancel();
  };

  return cbModal({
    component: (modalProps) => {
      const [appendData, setAppendData] = useState(true);
      const radioOptionAppend = useRef(null);

      useEffect(() => {
        // Update the document title using the browser API
        console.log('radioOptionAppend..', radioOptionAppend);
      }, []);

      const onCancel = () => {
        modalProps.closeModal();
        props.onCancel();
      };

      const onSave = () => {
        modalProps.closeModal();
        props.onSave(appendData);
      };

      const handleToggleAppendData = (value) => {
        setAppendData(value);
        console.log(value);
      };

      return (
        <div>
          <ModalHeader title={strings.importCSVTitleText} closeModal={onCancel}></ModalHeader>
          <ModalBody className="modalBodyCustomClass">
            <p className="dialog-body">{strings.importCSVDialogBody}</p>
            <span className="radio-block">
              <div className="Radio-wrapper">
                <Radio
                  //checked={true}
                  ref={radioOptionAppend}
                  label={strings.appendDataText}
                  name="option"
                  value="AppendData"
                  //onChange={handleToggleAppendData(true)}
                  //onClick={console.log('appendData')}
                  onClick={() => handleToggleAppendData(true)}
                  //onChange={(e) => handleToggleAppendData(e)}
                />
              </div>
              <div className="Radio-wrapper">
                <Radio
                  label={strings.replaceDataText}
                  name="option"
                  value="ReplaceData"
                  //onChange={console.log('ReplaceData')}
                  //onClick={console.log('ReplaceData')}
                  onClick={() => handleToggleAppendData(false)}
                  //onChange={(e) => handleToggleAppendData(e)}
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
                {' '}
                {strings.importTableText}{' '}
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
