import { FullConfig } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import { uninstallApp, deleteApp, deleteContentType, getInstalledApp } from "./utils/pre-installation-setup";

// Minimal shared state shape; more fields can be appended by tests over time
interface StateData {
  authToken?: string;
  appUID?: string;
  contentTypeUID?: string;
  installationId?: string;
}

const readJsonIfExists = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  } catch (e) {
    console.warn(`Failed to read ${filePath}:`, e);
  }
  return null;
};

async function globalTeardown(config: FullConfig) {
  // Read local state files
  const statePath = path.resolve(process.cwd(), "tests/e2e/.state.json");
  const dataJsonPath = path.resolve(process.cwd(), "data.json");

  const state = (readJsonIfExists(statePath) || {}) as StateData;
  const dataJson = readJsonIfExists(dataJsonPath) || {};

  const authToken: string | undefined = state.authToken || dataJson.authToken || process.env.AUTH_TOKEN;

  const useGlobalTeardown = process.env.USE_GLOBAL_TEARDOWN === "true";

  // Optional: remote cleanup if IDs are present and feature-flag enabled
  if (useGlobalTeardown && authToken) {
    try {
      const { appUID, contentTypeUID, installationId } = state;

      if (appUID) {
        try {
          // If installationId not present, try to resolve via API
          let installId = installationId;
          if (!installId) {
            const installations = await getInstalledApp(authToken, appUID);
            installId = installations?.data?.[0]?.uid;
          }
          if (installId) {
            await uninstallApp(authToken, installId);
            console.log(`✅ Uninstalled app installation: ${installId}`);
          }
        } catch (e) {
          console.warn("Uninstall app failed (continuing):", e);
        }
        try {
          await deleteApp(authToken, appUID);
          console.log(`✅ Deleted app: ${appUID}`);
        } catch (e) {
          console.warn("Delete app failed (continuing):", e);
        }
      }

      if (contentTypeUID) {
        try {
          await deleteContentType(authToken, contentTypeUID);
          console.log(`✅ Deleted content type: ${contentTypeUID}`);
        } catch (e) {
          console.warn("Delete content type failed (continuing):", e);
        }
      }
    } catch (e) {
      console.warn("Remote cleanup encountered issues (continuing):", e);
    }
  } else {
    console.log("Skipping remote cleanup in global teardown. Set USE_GLOBAL_TEARDOWN=true to enable.");
  }

  // Always clean local state artifacts
  try {
    fs.rmSync(statePath, { force: true });
  } catch (e) {
    console.warn("Failed to remove state file:", e);
  }
  try {
    fs.rmSync(dataJsonPath, { force: true });
  } catch (e) {
    console.warn("Failed to remove data.json:", e);
  }

  console.log("✅ Global teardown complete.");
}

export default globalTeardown;
