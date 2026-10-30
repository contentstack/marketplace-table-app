import { vi } from "vitest";
import { render } from "@testing-library/react";
import { getDefaultStore } from "jotai";
import { appSdkRefAtom } from "../hooks/useAppSdk";
import { fullScreenAtom, tableStateAtom } from "../pages/FieldExtension/store";
import utils from "../common/utils";
import type { ReactElement } from "react";

export const col = (n: number, extra = {}) => ({
  id: `column${n}`,
  accessor: `column${n}`,
  dataType: "text",
  ...extra,
});

export const savedTable = (rows: string[][], extra: Record<string, unknown> = {}) => ({
  tableState: {
    columns: rows[0].map((_, i) => col(i + 1)),
    data: rows.map((r) => Object.fromEntries(r.map((v, i) => [`column${i + 1}`, v]))),
    ...extra,
  },
});

// Fake of what ContentstackAppSDK.init() resolves to for a custom field.
export const makeSdk = (saved: unknown = undefined, config: unknown = {}) => {
  const setData = vi.fn();
  const enableAutoResizing = vi.fn();
  const pulse = vi.fn();
  const sdk = {
    location: { CustomField: { field: { getData: vi.fn(() => saved), setData }, frame: { enableAutoResizing } } },
    getConfig: vi.fn().mockResolvedValue(config),
    pulse,
    postRobot: {},
    stack: { _data: { name: "stack-name", api_key: ["stack", "ref"].join("-") } },
    currentUser: { defaultOrganization: "org-ref" },
  };
  return { sdk, setData, enableAutoResizing, pulse };
};

// Production has no jotai Provider (modals render in their own React roots and share the default store),
// so tests use the default store too and reset its atoms so state never leaks between tests.
export const renderWithStore = (ui: ReactElement) => {
  const store = getDefaultStore();
  store.set(tableStateAtom, utils.makeData(3));
  store.set(appSdkRefAtom, null);
  store.set(fullScreenAtom, false);
  return render(ui);
};

export const lastSaved = (setData: ReturnType<typeof vi.fn>) => setData.mock.calls.at(-1)?.[0].tableState;
