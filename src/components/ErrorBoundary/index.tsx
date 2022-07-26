import React from 'react';
import { TrackJS } from 'trackjs';

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

TrackJS.addMetadata('application_type', 'marketplace');
TrackJS.addMetadata('application_name', 'Table App');

class ErrorBoundary extends React.Component<MyProps, MyState> {
  componentDidCatch(error: any) {
    // error tracker for error reporting service
    TrackJS.track(error);
  }

  render() {
    return this.props.children;
  }
}

export default ErrorBoundary;
