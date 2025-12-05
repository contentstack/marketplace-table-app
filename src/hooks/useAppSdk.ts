/**
 * useAppSdk
 * @return the appSdk instance after initialization
 * This hook is to utilize for appSdk pulse method and its an exception for dev tools app.
 */
import { atom, useAtom } from "jotai";

// Type for the appSdk instance
type AppSdkInstance = {
  pulse: (event: string, data?: any) => void;
  stack: {
    _data: {
      name: string;
      api_key: string;
    };
  };
  currentUser: {
    defaultOrganization: string;
  };
  location: {
    CustomField?: {
      field: {
        getData: () => any;
        setData: (data: any) => void;
      };
      frame: {
        enableAutoResizing: () => void;
      };
    };
  };
  getConfig: () => Promise<any>;
  postRobot: any;
} | null;

export const appSdkRefAtom = atom<AppSdkInstance>(null);

/**
 * Getter and setter for appSdk instance.
 * To be used during Sdk initialization
 */
export const useAppSdk = (): [AppSdkInstance, (value: AppSdkInstance) => void] => {
  return useAtom(appSdkRefAtom);
};
