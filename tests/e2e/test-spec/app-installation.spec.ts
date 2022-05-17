import { test, expect, Page } from '@playwright/test';
import { AppInstallation } from '../pages/appInstallation';
import { getInstalledApp, uninstallApp, deleteApp } from '../utils/pre-installation-setup';
const jsonFile = require('jsonfile');

let AppId: string;
let savedCredentials: any = {};
let authToken;

test.beforeAll(async () => {
  const file = 'data.json';
  const token = jsonFile.readFileSync(file);
  authToken = token.authToken;
});

test('marketplace app installation flow', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const App = new AppInstallation(page);
  await App.navigateToDeveloperHub();
  await App.createNewApp();
  AppId = await App.getAppId();
  await App.setUiLocation();
  await App.stackInstallation(context);
});

test.afterAll(async () => {
  const installations = await getInstalledApp(authToken, AppId);
  if (installations.data.length) {
    installations.data[0].uid && (await uninstallApp(authToken, installations.data[0].uid));
  }
  await deleteApp(authToken, AppId);
});
