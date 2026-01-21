import { expect, Locator, Page } from "@playwright/test";

export class AppLogin {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly venusPasswordInput: Locator;
  readonly loginButton: Locator;

  constructor(Page: Page) {
    this.page = Page;
    // Use resilient selectors that work across classic and Venus
    this.emailInput = this.page.locator('#email, input[name="email"]');
    this.passwordInput = this.page.locator('#pw, input[name="password"]');
    this.venusPasswordInput = this.page.locator('#password, input[name="password"]');
    this.loginButton = this.page.locator('button:has-text("Log In"), button:has-text("LOGIN")');
  }
  // check app url
  async checkAppUrl(url: string) {
    await expect(this.page).toHaveURL(url);
  }

  // goto login url
  async getLoginPage() {
    const appUrl = process.env.APP_HOST_URL;
    const envUrl = process.env.ENV_URL;
    if (appUrl) {
      await this.page.goto(`${appUrl}`);
      return;
    }
    if (envUrl) {
      await this.page.goto(`${envUrl}#!/login`);
      return;
    }
    throw new Error("APP_HOST_URL or ENV_URL must be set for login navigation");
  }

  // contentstack login
  async contentstackLogin(id: string | undefined, pass: string | undefined) {
    if (!id || !pass) {
      throw new Error("Missing CONTENTSTACK_LOGIN or CONTENTSTACK_PASSWORD");
    }
    const orgId = process.env.CONTENTSTACK_ORGANIZATION_UID || process.env.ORG_ID;
    // check for classic UI and venus UI
    if ((await this.page.$(".user-session-page")) !== null) {
      // contentstack classic ui login
      try {
        await this.emailInput.type(id);
        await this.passwordInput.type(pass);
        await this.loginButton.click();
        // Switch to new interface if available
        try {
          await this.page.locator(".user-name").click();
          await this.page.click("text=New Interface");
        } catch (e) {
          console.warn("Switch to new interface not available or failed:", e);
        }
        // Select organization when org id is provided
        if (orgId) {
          await this.page.click(".OrgDropdown");
          await this.page.click(`#${orgId}`);
        }
        await this.page.waitForTimeout(2000);
        await this.page.context().storageState({ path: "storageState.json" });
        await this.page.close();
      } catch (e) {
        console.error(e);
      }
    } else {
      // contentstack venus ui login
      await this.emailInput.type(id);
      await this.venusPasswordInput.type(pass);
      const venusLoginButton = await this.page.waitForSelector('button:has-text("Log In")');
      await venusLoginButton.click();
      // Organization selection is optional in Venus UI; only attempt if dropdown exists
      if (orgId) {
        try {
          const orgDropdown = this.page.locator(".OrgDropdown");
          if ((await orgDropdown.count()) > 0 && (await orgDropdown.first().isVisible())) {
            await orgDropdown.first().click();
            const targetOrg = this.page.locator(`#${orgId}`);
            if ((await targetOrg.count()) > 0) {
              await targetOrg.first().click();
            }
          }
        } catch {
          // Skip if not available; user may already be in correct org
        }
      }
      await this.page.waitForTimeout(2000);
      await this.page.context().storageState({ path: "storageState.json" });
      await this.page.close();
    }
  }
}
