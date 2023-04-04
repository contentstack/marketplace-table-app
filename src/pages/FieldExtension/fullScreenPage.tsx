import React, { useEffect } from 'react';
import FieldExtension from '.';
import '@contentstack/venus-components/build/main.css';
import './styles.scss';
import { Icon } from '@contentstack/venus-components';
import strings from 'common/locale/en-us';
import  useAnalytics  from 'hooks/useAnalytics';

export type fullScreenProps = {
  closeModal: () => void;
};

const FullScreenPage: React.FC<fullScreenProps> = ({ closeModal }) => {
  const { trackEvent } = useAnalytics();
  return (
    <div
      style={{
        width: 'calc(100vw - 100px)',
        height: 'calc(100vh - 100px)',
        borderRadius: 'inherit',
      }}
    >
      <div className="flex FullPage_Modal_Header">
        <h6 className="ml-30 mt-20"> {strings.fullScreenTitle} </h6>
        <Icon
          icon="Compress"
          size="small"
          className="Tab__icon mt-20"
          hover={true}
          hoverType="secondary"
          style={{ marginRight: '30px', marginLeft: 'auto', cursor: 'pointer' }}
          onClick={() => {
            // Heap event ** event text would be updated **
            trackEvent('Closed Full Screen Mode');
            closeModal();
          }}
        />
      </div>
      <div className="fullscreen">
        <FieldExtension fullScreen={true} />
      </div>
    </div>
  );
};

export default FullScreenPage;
