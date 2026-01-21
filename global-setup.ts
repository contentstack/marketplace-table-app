import { chromium } from "@playwright/test";
import { AppLogin } from "./tests/e2e/pages/login";
import { getAuthToken } from "./tests/e2e/utils/pre-installation-setup";
import * as fs from "fs";
import * as path from "path";

const globalSetup = async () => {
  // Validate environment similar to calendar app
  const validateEnvironment = () => {
    const requiredEnv = [
      "CONTENTSTACK_LOGIN",
      "CONTENTSTACK_PASSWORD",
      "BASE_API_URL",
      "DEVELOPER_HUB_API",
      "CONTENTSTACK_ORGANIZATION_UID",
      "APP_HOST_URL",
    ];
    const missing = requiredEnv.filter((k) => !process.env[k]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }
  };
  validateEnvironment();

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

  // Acquire API token and persist lightweight state for parity with calendar app
  const authToken = await getAuthToken();
  try {
    const stateDir = path.resolve(process.cwd(), "tests/e2e");
    const statePath = path.join(stateDir, ".state.json");
    if (!fs.existsSync(stateDir)) {
      fs.mkdirSync(stateDir, { recursive: true });
    }
    const state = { authToken };
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2), "utf-8");
  } catch (e) {
    console.warn("Unable to persist tests/e2e/.state.json:", e);
  }
};

export default globalSetup;
