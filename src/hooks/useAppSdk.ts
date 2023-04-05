/**
 * useAppSdk
 * @return the appSdk instance after initialization
 * This hook is to utilize for appSdk pulse method and its an exception for dev tools app.
 */
import { atom, useAtom } from 'jotai';
import Extension from '@contentstack/app-sdk/dist/src/extension';

export const appSdkRefAtom = atom<Extension | null>(null);

/**
 * Getter and setter for appSdk instance.
 * To be used during Sdk initialization
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
export const useAppSdk = (): [Extension | null, any] => {
  return useAtom(appSdkRefAtom);
};
