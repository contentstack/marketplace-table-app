import mixpanel from 'mixpanel-browser';

interface SuperProps {
  Stack: string;
  Organization: string;
  'Application Type': string;
  'Application Name': string;
  [key: string]: string;
}

const { REACT_APP_MIXPANEL_TOKEN } = process.env;

mixpanel.init(REACT_APP_MIXPANEL_TOKEN, {
  debug: false,
  ignore_dnt: true,
});

const useAnalytics = () => {
  const trackEvent = (event: string, eventData: any = {}) => {
    return REACT_APP_MIXPANEL_TOKEN ? mixpanel.track(event, eventData) : undefined;
  };
  const setUserId = (userId: string) => {
    return REACT_APP_MIXPANEL_TOKEN ? mixpanel.identify(userId) : undefined;
  };

  const setGlobalData = (properties: SuperProps) => {
    return REACT_APP_MIXPANEL_TOKEN ? mixpanel.register(properties) : undefined;
  };

  return { trackEvent, setUserId, setGlobalData };
};

const useMixPanelGroups = () => {
  const setGroups = (groupKey: string, groupId: string[] = []) => {
    return REACT_APP_MIXPANEL_TOKEN ? mixpanel.set_group(groupKey, groupId) : undefined;
  };
  return { setGroups };
};

export { useAnalytics, useMixPanelGroups };
