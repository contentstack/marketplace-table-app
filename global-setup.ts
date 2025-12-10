import { chromium } from "@playwright/test";
import { AppLogin } from "./tests/e2e/pages/login";
import { getAuthToken } from "./tests/e2e/utils/pre-installation-setup";

const globalSetup = async () => {
  const stackEmail = process.env.CONTENTSTACK_LOGIN;
  const stackPassword = process.env.CONTENTSTACK_PASSWORD;

  const browser = await chromium.launch();
  const stagLogin = await browser.newPage({
    httpCredentials: {
      username: process.env.BASIC_AUTH_USERNAME || "",
      password: process.env.BASIC_AUTH_PASSWORD || "",
    },
  });
  const loginSetup = new AppLogin(stagLogin);
  await loginSetup.getLoginPage();
  await loginSetup.contentstackLogin(stackEmail, stackPassword);
  await getAuthToken();
};

export default globalSetup;
