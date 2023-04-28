import { chromium, expect, test, Frame } from "@playwright/test";
import { TableApp } from "../pages/Tabblepage";
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
let tableapp;

let appDetails = {
    apiKey: '',
    appUID: '',
    entryUID: '',
    contentTypeUID: '',
    installationId: '',
  };

test.use({ storageState: "storageState.json" });

test.beforeAll(async () => {
    const file = 'data.json'; // global filename
    const token = await jsonFile.readFileSync(file); // read authToken from global file
    authToken = token.authToken;
    /*const browser = await chromium.launch();
    const page = await browser.newPage();
    tableapp = new TableApp(page);*/
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

test.describe.serial(" Table App at entry", () => {

    let tableapp;

    test.use({ storageState: "storageState.json" });

    test("Should make all the test cases of the Table App", async ({page}) => {
        tableapp = new TableApp(page);
        //await tableapp.createTable(appDetails.contentTypeUID, appDetails.entryUID);
        await tableapp.importCsv(appDetails.contentTypeUID, appDetails.entryUID);
        await page.pause();
        await tableapp.searchonTable();
        await tableapp.enterFullscreen();
        await tableapp.insertRowAbove();
        await tableapp.insertRowBelow();
        await tableapp.deleteRow();
        await tableapp.insertColumnRight();
        await tableapp.insertColumnLeft();
        await tableapp.deleteColumn();
        await tableapp.exportCsv();
        await tableapp.makeHeaderRow();
        await tableapp.makeHeaderColumn();
        await tableapp.sortTable();
        await tableapp.deleteTable();
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
