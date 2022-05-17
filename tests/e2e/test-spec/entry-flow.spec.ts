import { test, expect } from '@playwright/test';
import { MarketplaceTable } from '../pages/marketplace-table';
import {
  createEntry,
  createContentType,
  getExtensionFieldUid,
  createApp,
  updateApp,
  installApp,
} from '../utils/pre-installation-setup';
const jsonFile = require('jsonfile');
const file = 'data.json';

let authToken: string;
const stackKey = process.env.STACK_API_KEY;
let entryTitle: string;
interface SaveCred {
  appId: string;
  entryTitle: string;
  contentTypeId: string;
  installationId: string;
}

// test.beforeAll(async ({ browser }) => {
//   const token = jsonFile.readFileSync(file);
//   authToken = token.authToken;

//   const extUID = await getExtensionFieldUid(authToken, stackKey);
//   const contentTypeResp = await createContentType(authToken, extUID, stackKey);
//   await expect(contentTypeResp.content_type).not.toBeUndefined();
//   if (contentTypeResp.notice === 'Content Type created successfully.') {
//     entry = await createEntry(authToken, contentTypeResp.content_type.uid, stackKey);
//   }
// });

//setting up the test data for entry page actions
test.beforeAll(async () => {
  const file = 'data.json';
  const token = await jsonFile.readFileSync(file);
  authToken = token.authToken;
  try {
    if (authToken) {
      const appId: string = await createApp(authToken);
      await updateApp(authToken, appId);
      await installApp(authToken, appId, stackKey);
      const extUID = await getExtensionFieldUid(authToken, stackKey);
      const contentTypeResp = await createContentType(authToken, extUID, stackKey);
      console.log('contenttype uid...', contentTypeResp);
      setTimeout(async () => {
        if (contentTypeResp.notice === 'Content Type created successfully.') {
          entryTitle = await createEntry(authToken, contentTypeResp.content_type.uid, stackKey);
          console.log('entry title...', entryTitle);
        }
      }, 2000);
    }
  } catch (error) {
    console.log(error);
    return error;
  }
});

test('marketplace installation', async ({ context }) => {
  const [entryPage, newFrame] = await Promise.all([
    context.newPage(),
    context.waitForEvent('page'),
  ]);
  const MP = new MarketplaceTable(entryPage, newFrame);
  await MP.openStack();
  await MP.openEntry(entryTitle);
  await MP.createTable();
  await MP.addNewRow();
});
