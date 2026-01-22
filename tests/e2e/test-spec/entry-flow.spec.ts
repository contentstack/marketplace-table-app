/* eslint-disable prettier/prettier */
import { chromium, test } from "@playwright/test";
import { MarketplaceTable } from "../pages/marketplace-table";
import { MarketplacePage, APP_CONFIGS } from "../pages/MarketplacePage";
import {
  createEntry,
  createContentType,
  getExtensionFieldUid,
  createApp,
  updateApp,
  installApp,
  deleteApp,
  getInstalledApp,
  deleteContentType,
  uninstallApp,
} from "../utils/pre-installation-setup";
import * as jsonFile from "jsonfile";
import * as fs from "fs";
import * as path from "path";
import { TestHelpers } from "../utils/testHelpers";

let authToken: string;
let MP;
let marketplace: MarketplacePage;
const stackKey = process.env.STACK_API_KEY;

let appDetails = {
  apiKey: "",
  appUID: "",
  entryUID: "",
  contentTypeUID: "",
  installationId: "",
};

const writeState = (partial: Record<string, any>) => {
  try {
    const stateDir = path.resolve(process.cwd(), "tests/e2e");
    const statePath = path.join(stateDir, ".state.json");
    let current: Record<string, any> = {};
    if (fs.existsSync(statePath)) {
      current = JSON.parse(fs.readFileSync(statePath, "utf-8"));
    }
    const next = { ...current, ...partial };
    fs.writeFileSync(statePath, JSON.stringify(next, null, 2), "utf-8");
  } catch (e) {
    console.warn("Failed to write tests/e2e/.state.json:", e);
  }
};

//setting up the test data for entry page actions
test.beforeAll(async () => {
  // Validate env for clearer failures
  TestHelpers.validateEnvironment();

  const file = "data.json"; // global filename
  const token = await jsonFile.readFileSync(file); // read authToken from global file
  authToken = token.authToken;
  const browser = await chromium.launch();
  const context = await browser.newContext({
    storageState: "storageState.json",
    httpCredentials: {
      username: process.env.BASIC_AUTH_USERNAME || "",
      password: process.env.BASIC_AUTH_PASSWORD || "",
    },
  });
  const page = await context.newPage();
  MP = new MarketplaceTable(page);
  marketplace = new MarketplacePage(page, APP_CONFIGS.TABLE);
  try {
    if (authToken) {
      // If installing via marketplace UI (preferred for marketplace-listed apps)
      if (process.env.INSTALL_VIA_MARKETPLACE === "true") {
        const stackName = process.env.STACK_NAME;
        if (!stackName) {
          throw new Error("STACK_NAME is required when INSTALL_VIA_MARKETPLACE=true");
        }
        // Follow calendar pattern: validate, go to dashboard, verify, then switch org
        await marketplace.navigateToDashboard(stackKey);
        await marketplace.verifyDashboardLoaded();
        await marketplace.switchToOrganization();
        await marketplace.fullInstallFlow(stackName, false);
      } else {
        // Legacy API-based flow (kept for backward compatibility)
        const appId: string = await createApp(authToken); //Create table app on developerHub
        appDetails.appUID = appId;
        writeState({ appUID: appDetails.appUID });
        await updateApp(authToken, appId); // update ui location from table app
        const installationUid: string = await installApp(authToken, appId, stackKey); // install app on known stack
        appDetails.installationId = installationUid;
        writeState({ installationId: appDetails.installationId });
      }
      const extUID = await getExtensionFieldUid(authToken, stackKey, {
        nameContains: process.env.TABLE_APP_NAME || "Table",
      }); // finds correct extension uid
      const contentTypeResp = await createContentType(authToken, extUID, stackKey); // create content type
      if (contentTypeResp.notice === "Content Type created successfully.") {
        const entry = await createEntry(authToken, contentTypeResp.content_type.uid, stackKey); // create entry
        appDetails.contentTypeUID = contentTypeResp.content_type.uid;
        appDetails.entryUID = entry.uid;
        writeState({
          contentTypeUID: appDetails.contentTypeUID,
          entryUID: appDetails.entryUID,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return error;
  }
});

test.describe("Table app operations", () => {
  test("Basic table operations", async () => {
    await MP.openEntry(appDetails.entryUID, stackKey, appDetails.contentTypeUID); // Navigate to entry page
    await MP.createTable(); // Create a new table
    await MP.addTableContent(); // Add content to the table
    await MP.saveContent(); // Saves table content
    await MP.checkTableContent(); // Check table is properly saved
  });

  test("row operations", async () => {
    await MP.addRowAbove(0); // Add new row above operation
    await MP.checkTableData(["j", "k", "l", "a", "b", "c", "d", "e", "f", "g", "h", "i"]); // check table content after adding new row

    // Add new row below operation
    await MP.addRowBelow(0);
    await MP.checkTableData(["j", "k", "l", "m", "n", "o", "a", "b", "c", "d", "e", "f", "g", "h", "i"]); // check table content add adding new row
  });

  test("column operations", async () => {
    // Add new column to right operation
    await MP.addColumnToRight(0, false);
    await MP.checkTableData([
      "j",
      "p",
      "k",
      "l",
      "m",
      "q",
      "n",
      "o",
      "a",
      "r",
      "b",
      "c",
      "d",
      "s",
      "e",
      "f",
      "g",
      "t",
      "h",
      "i",
    ]); // check table content after adding new column
    await MP.addColumnToLeft(2, false); // Add new column to left operation
    await MP.checkTableData([
      "j",
      "p",
      "u",
      "k",
      "l",
      "m",
      "q",
      "v",
      "n",
      "o",
      "a",
      "r",
      "w",
      "b",
      "c",
      "d",
      "s",
      "x",
      "e",
      "f",
      "g",
      "t",
      "y",
      "h",
      "i",
    ]); // check table content after adding new column
  });

  test("table search operation", async () => {
    await MP.searchValue(); // Search particular keyword
    await MP.checkTableData(["d", "s", "x", "e", "f"]); // check search results
    await MP.clearSearch(); // Clear search filed
    await MP.saveContent(); // Save table content
  });

  test("row column delete operation", async () => {
    await MP.deleteCol(0); // Delete column operation
    await MP.deleteRow(0); // Delete row operation
  });

  test("Add Table header operation", async () => {
    await MP.enableTableHeader(0); // Create new a header for table
  });

  test.skip("ascending and descending operation", async () => {
    await MP.sortAscending(); // Sort ascending operation
    await MP.checkTableData(["a", "q", "b", "c", "d", "s", "e", "f", "g", "t", "h", "i", "m", "r", "n", "o"]);
    await MP.sortDescending(); // Sort descending operation
    await MP.checkTableData(["m", "r", "n", "o", "g", "t", "h", "i", "d", "s", "e", "f", "a", "q", "b", "c"]);
  });

  test("import export table operations", async () => {
    await MP.checkTableExport(); // check table export functionality
    await MP.checkTableImport(); // Check import operation
    await MP.checkTableData(["a", "b", "c", "d", "e", "f", "g", "h", "i"]); // check table content after importing csv file
  });

  test("fullscreen operations", async () => {
    await MP.checkFullscreen(); // Check fullscreen functionality
    await MP.checkTableData(["z", "A", "B", "a", "b", "c", "d", "e", "f", "g", "h", "i"]); // Check table after minimizing the table modal
    await MP.saveContent(); // Save table content
  });

  test("Delete table operations", async () => {
    await MP.deleteTable(); // Delete table from entry
    await MP.saveContent(); // Save table content
  });
});

test.describe("Header Row Edit functionality", () => {
  test("Edit header row cells", async () => {
    await MP.openEntry(appDetails.entryUID, stackKey, appDetails.contentTypeUID);
    await MP.createTable();
    await MP.addTableContent();
    // Click on first cell to make #table-actions visible
    await MP.clickFirstCell();
    await MP.testHeaderRowEdit();
  });

  test("Edit header row with long text and special characters", async () => {
    // Table and header row are already created/enabled from previous test
    // Just open the entry and edit the existing header row
    await MP.openEntry(appDetails.entryUID, stackKey, appDetails.contentTypeUID);
    await MP.initializeIframe();
    await MP.testHeaderRowEditWithLongText();
    await MP.deleteTable(); // Delete table from entry
    await MP.saveContent(); // Save table content
  });
});

test.describe("Cell Vertical Scroll functionality", () => {
  test("Cell vertical scroll with long content", async () => {
    await MP.openEntry(appDetails.entryUID, stackKey, appDetails.contentTypeUID);
    await MP.testCellVerticalScroll();
    await MP.deleteTable(); // Delete table from entry
    await MP.saveContent(); // Save table content
  });

  test("Multiple cells with vertical scroll", async () => {
    await MP.openEntry(appDetails.entryUID, stackKey, appDetails.contentTypeUID);
    await MP.testMultipleCellsWithVerticalScroll();
    await MP.deleteTable(); // Delete table from entry
    await MP.saveContent(); // Save table content
  });
});

test.afterAll(async () => {
  // If centralized global teardown is enabled, skip remote cleanup here to avoid double-delete
  if (process.env.USE_GLOBAL_TEARDOWN === "true") {
    return;
  }
  // Prefer marketplace UI uninstall when used
  if (process.env.INSTALL_VIA_MARKETPLACE === "true") {
    try {
      const stackName = process.env.STACK_NAME!;
      await marketplace.uninstallApp(stackName);
    } catch (e) {
      console.warn("Marketplace uninstall failed (continuing):", e);
    }
  } else {
    // Legacy API cleanup
    try {
      const installations = await getInstalledApp(authToken, appDetails.appUID);
      if (installations?.data?.length) {
        const installationUid = installations?.data?.[0]?.uid;
        if (installationUid) {
          await uninstallApp(authToken, installationUid);
        }
      }
    } catch (e) {
      console.warn("uninstallApp in afterAll failed (continuing):", e);
    }
    try {
      await deleteApp(authToken, appDetails.appUID);
    } catch (e) {
      console.warn("deleteApp in afterAll failed (continuing):", e);
    }
  }
  // Always delete CT created for tests
  try {
    await deleteContentType(authToken, appDetails.contentTypeUID);
  } catch (e) {
    console.warn("deleteContentType in afterAll failed (continuing):", e);
  }
});
