/* eslint-disable prettier/prettier */
import { chromium, test } from '@playwright/test';
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
let MP;
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
  const browser = await chromium.launch();
  const page = await browser.newPage();
  MP = new MarketplaceTable(page);
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

test.describe('Table app operations', () => {
  test('Basic table operations', async () => {
    await MP.openEntry(appDetails.entryUID, stackKey, appDetails.contentTypeUID); // Navigate to entry page
    await MP.createTable(); // Create a new table
    await MP.addTableContent(); // Add content to the table
    await MP.saveContent(); // Saves table content
    await MP.checkTableContent(); // Check table is properly saved
  });

  test('row operations', async () => {
    await MP.addRowAbove(0); // Add new row above operation
    await MP.checkTableData([
      'j', 'k', 'l',
      'a', 'b', 'c',
      'd', 'e', 'f',
      'g', 'h', 'i']) // check table content after adding new row

    // Add new row below operation
    await MP.addRowBelow(0);
    await MP.checkTableData([
      'j', 'k', 'l',
      'm', 'n', 'o',
      'a', 'b', 'c',
      'd', 'e', 'f',
      'g', 'h', 'i',
    ]); // check table content add adding new row
  });

  test('column operations', async () => {

    // Add new column to right operation
    await MP.addColumnToRight(0, false);
    await MP.checkTableData([
      'j', 'p', 'k', 'l',
      'm', 'q', 'n', 'o',
      'a', 'r', 'b', 'c',
      'd', 's', 'e', 'f',
      'g', 't', 'h', 'i']) // check table content after adding new column
    await MP.addColumnToLeft(1, false); // Add new column to left operation
    await MP.checkTableData([
      'j', 'u', 'p', 'k', 'l',
      'm', 'v', 'q', 'n', 'o',
      'a', 'w', 'r', 'b', 'c',
      'd', 'x', 's', 'e', 'f',
      'g', 'y', 't', 'h', 'i']) // check table content after adding new column

      
  });

  test('table search operation', async () => {
    await MP.searchValue(); // Search particular keyword
    await MP.checkTableData(['d', 'x', 's', 'e', 'f']); // check search results
    await MP.clearSearch(); // Clear search filed
    await MP.saveContent(); // Save table content
  });

  test.skip('row column delete operation', async () => {
    await MP.deleteCol(0); // Delete column operation
    await MP.deleteRow(0); // Delete row operation
  });
  // await entryPage.waitForTimeout(2000); // Wait for

  test.skip('Add Table header operation', async () => {
    await MP.enableTableHeader(0); // Create new a header for table
  });

  test.skip('ascending and descending operation', async () => {
    await MP.sortAscending(); // Sort ascending operation
    await MP.checkTableData([
      'a', 'q', 'b', 'c',
      'd', 's', 'e', 'f',
      'g', 't', 'h', 'i',
      'm', 'r', 'n', 'o',
    ]);
    await MP.sortDescending(); // Sort descending operation
    await MP.checkTableData([
      'm', 'r', 'n', 'o',
      'g', 't', 'h', 'i',
      'd', 's', 'e', 'f',
      'a', 'q', 'b', 'c',
    ]);
  });

  test('import export table operations', async () => {
    await MP.checkTableExport(); // check table export functionality
    await MP.checkTableImport(); // Check import operation
    await MP.checkTableData([
      'a', 'b', 'c',
      'd', 'e', 'f',
      'g', 'h', 'i']); // check table content after importing csv file
  });

  test('fullscreen operations', async () => {
    await MP.checkFullscreen(); // Check fullscreen functionality
    await MP.checkTableData([
      'z', 'A', 'B',
      'a', 'b', 'c',
      'd', 'e', 'f',
      'g', 'h', 'i']);// Check table after minimizing the table modal
    await MP.saveContent(); // Save table content
  });

  test.skip('Delete table operations', async () => {
    await MP.deleteTable(); // Delete table from entry
  });
});

test.afterAll(async () => {
  const installations = await getInstalledApp(authToken, appDetails.appUID);
  if (installations.data.length) {
    installations.data[0].uid && (await uninstallApp(authToken, installations.data[0].uid));
  }
  await deleteApp(authToken, appDetails.appUID);
  await deleteContentType(authToken, appDetails.contentTypeUID);
});
