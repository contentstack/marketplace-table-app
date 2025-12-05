import React from "react";
import { TrackJS } from "trackjs";

interface MyProps {
  children: React.ReactElement;
}

interface MyState {
  hasError: boolean;
}

TrackJS.install({
  token: `${import.meta.env.VITE_TRACKER_TOKEN}`,
  application: import.meta.env.VITE_TRACKER_ENV,
  console: { display: import.meta.env.DEV },
});

TrackJS.addMetadata("application_type", "marketplace");
TrackJS.addMetadata("application_name", "Table App");

class ErrorBoundary extends React.Component<MyProps, MyState> {
  componentDidCatch(error: Error) {
    TrackJS.track(error);
  }

  render() {
    return this.props.children;
  }
}

export default ErrorBoundary;
