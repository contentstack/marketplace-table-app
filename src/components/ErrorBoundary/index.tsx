import React from 'react';
import { TrackJS } from 'trackjs';

import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
  applicationId: `${process.env.REACT_APP_DATADOG_RUM_APPLICATION_ID}`,
  clientToken: `${process.env.REACT_APP_DATADOG_RUM_CLIENT_TOKEN}`,
  site: 'datadoghq.com',
  // service: 'my-web-application',
  service: 'marketplace-table-app',
  // Specify a version number to identify the deployed version of your application in Datadog
  //version: "1",
  sampleRate: 100,
  sessionReplaySampleRate: 20,
  trackInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'mask-user-input',
  useCrossSiteSessionCookie: true,
});
//captures and visually replay users' web browsing experience for review
datadogRum.startSessionReplayRecording();

interface MyProps {
  children: React.ReactElement;
}

interface MyState {
  hasError: boolean;
}

TrackJS.install({
  token: `${process.env.REACT_APP_TRACKER_TOKEN}`,
  application: process.env.REACT_APP_TRACKER_ENV,
  console: { display: process.env.NODE_ENV === 'development' },
});
//adding metadata to datadogRUM
datadogRum.addAction('App Metadata', {
  application_type: 'marketplace',
  application_name: 'Table App',
});
TrackJS.addMetadata('application_type', 'marketplace');
TrackJS.addMetadata('application_name', 'Table App');

class ErrorBoundary extends React.Component<MyProps, MyState> {
  componentDidCatch(error: any) {
    // error tracker for error reporting service
    TrackJS.track(error);
    //error tracking by dataDog RUM
    datadogRum.addError(error);
  }

  render() {
    return this.props.children;
  }
}

export default ErrorBoundary;
