/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_TRACKER_TOKEN: string;
  readonly VITE_TRACKER_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.svg" {
  import * as React from "react";
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;
  const src: string;
  export default src;
}

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}

declare module "react-table-plugins" {
  export function useExportData<D extends object = {}>(hooks: any): void;
}
