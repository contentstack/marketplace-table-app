import { test } from '@playwright/test';
import { MarketplaceTable } from '../pages/marketplace-table';
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
} from '../utils/pre-installation-setup';
const jsonFile = require('jsonfile');

let authToken: string;
const stackKey = process.env.STACK_API_KEY;

let appDetails = {
  apiKey: '',
  appUID: '',
  entryUID: '',
  contentTypeUID: '',
  installationId: '',
};

//setting up the test data for entry page actions
test.beforeAll(async () => {
  const file = 'data.json'; // global filename
  const token = await jsonFile.readFileSync(file); // read authToken from global file
  authToken = token.authToken;
  try {
    if (authToken) {
      const appId: string = await createApp(authToken); //Create table app on developerHub
      appDetails.appUID = appId;
      await updateApp(authToken, appId); // update ui location from table app
      await installApp(authToken, appId, stackKey); // install app on known stack
      const extUID = await getExtensionFieldUid(authToken, stackKey); // gets extension field uid
      const contentTypeResp = await createContentType(authToken, extUID, stackKey); // create content type
      if (contentTypeResp.notice === 'Content Type created successfully.') {
        const entry = await createEntry(authToken, contentTypeResp.content_type.uid, stackKey); // create entry
        appDetails.contentTypeUID = contentTypeResp.content_type.uid;
        appDetails.entryUID = entry.uid;
      }
    }
  } catch (error) {
    console.log(error);
    return error;
  }
});

test('Table operations', async ({ context }) => {
  const entryPage = await context.newPage();
  const MP = new MarketplaceTable(entryPage);
  await MP.openEntry(appDetails.entryUID, stackKey, appDetails.contentTypeUID); // Navigate to entry page
  await MP.createTable(); // Create a new table
  await MP.addTableContent(); // Add content to the table
  // await MP.saveContent(); // Saves table content
  await MP.checkTableContent(); // Check table is properly saved
  await MP.addRowAbove(); // Add new row above operation
  await MP.addRowBelow(); // Add new row below operation
  await MP.addColumnToLeft(); // Add new column to left operation
  await MP.addColumnToRight(); // Add new column to right operation
  // await MP.saveContent(); // Save table content
  await MP.searchValue(); // Search particular keyword
  await MP.clearSearch(); // Clear search filed
  await MP.deleteCol(); // Delete column operation
  await MP.deleteRow(); // Delete row operation
  // await MP.enableTableHeader(); // Create new a header for table
  await MP.saveContent(); // Save table content
  // await entryPage.waitForTimeout(3000);
  // await MP.sortAscending(); // Sort ascending operation
  // await entryPage.waitForTimeout(3000);
  // await MP.sortDescending(); // Sort descending operation
  await MP.deleteTable(); // Delete table from entry
});

test.afterAll(async () => {
  const installations = await getInstalledApp(authToken, appDetails.appUID);
  if (installations.data.length) {
    installations.data[0].uid && (await uninstallApp(authToken, installations.data[0].uid));
  }
  await deleteApp(authToken, appDetails.appUID);
  await deleteContentType(authToken, appDetails.contentTypeUID);
});
