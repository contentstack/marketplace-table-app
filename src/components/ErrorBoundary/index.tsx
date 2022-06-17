import React from 'react';
import { TrackJS } from 'trackjs';

interface MyProps {
  children: React.ReactElement;
}

interface MyState {
  hasError: boolean;
}

TrackJS.install({
  token: process.env.REACT_APP_TRACKER_TOKEN as string,
  console: { display: false },
});

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
