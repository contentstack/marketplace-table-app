import { useAppSdk } from "./useAppSdk";

const useAnalytics = () => {
  const [appSdk] = useAppSdk();

  const trackEvent = (event: string, eventData: any = {}) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return appSdk?.pulse(event, eventData);
  };

  return { trackEvent };
};

export default useAnalytics;
