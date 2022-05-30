import { expect, Locator, Page } from '@playwright/test';

export class AppLogin {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly venusPasswordInput: Locator;
  readonly loginButton: Locator;

  constructor(Page: Page) {
    this.page = Page;
    this.emailInput = this.page.locator('#email');
    this.passwordInput = this.page.locator('#pw');
    this.venusPasswordInput = this.page.locator('#password');
    this.loginButton = this.page.locator('button:has-text("Log In"), button:has-text("LOGIN")');
  }
  // check app url
  async checkAppUrl(url: string) {
    await expect(this.page).toHaveURL(url);
  }

  // goto login url
  async getLoginPage() {
    await this.page.goto(`${process.env.APP_HOST_URL}`);
  }

  // contentstack login
  async contentstackLogin(id, pass) {
    // check for classic UI and venus UI
    if ((await this.page.$('.user-session-page')) !== null) {
      // contentstack classic ui login
      try {
        await this.emailInput.type(id);
        await this.passwordInput.type(pass);
        await this.loginButton.click();
        await this.page.locator('.user-name').click();
        await this.page.click('text=New Interface');
        await this.page.click('.OrgDropdown');
        await this.page.click(`#${process.env.CONTENTSTACK_ORGANIZATION_UID}`);
        await this.page.waitForTimeout(2000);
        await this.page.context().storageState({ path: 'storageState.json' });
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
      await this.page.click('.OrgDropdown');
      await this.page.click(`#${process.env.CONTENTSTACK_ORGANIZATION_UID}`);
      await this.page.waitForTimeout(2000);
      await this.page.context().storageState({ path: 'storageState.json' });
      await this.page.close();
    }
  }
}
