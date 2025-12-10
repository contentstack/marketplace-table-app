import { TrackJS } from "trackjs";

const useJsErrorTracker = () => {
  const addMetadata = (key: string, value: string) => {
    TrackJS.addMetadata(key, value);
  };
  const trackError = (error: any) => {
    TrackJS.track(error);
  };
  return { addMetadata, trackError };
};

export default useJsErrorTracker;
