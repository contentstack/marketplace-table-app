import { expect, Page } from '@playwright/test';

export class AppInstallation {
  readonly page;
  appId: string;
  constructor(page: Page) {
    this.page = page;
  }

  async navigateToDeveloperHub() {
    this.page.goto('#!/developerhub');
  }

  async createNewApp() {
    await this.page.locator('[data-testid="input-new-app"]').click();
    await this.page.locator('[data-test-id="cs-radio"] >> text="Stack App"').click();
    await this.page
      .locator('[data-testid="name-input"]')
      .type(`Table App -${Math.floor(Math.random() * 1000)}`);
    await this.page.locator('[data-testid="modal-form-submit"]').click();
    await this.page.waitForTimeout(2000);
  }
  async getAppId() {
    return await this.page.locator('.App_info_section_field__uid >>.field_value').innerText();
  }

  async setUiLocation() {
    await this.page.locator('#ui-locations').click();
    await this.page
      .locator('[data-testid="app-description"]')
      .type(`${process.env.APP_BASE_URL}/#`);
    this.page.waitForTimeout(2000);
    await this.page.locator('.ui_locations__card-section').nth(0).hover();
    await this.page.locator('.ui_locations__tooltip-label').click();
    await this.page.waitForTimeout(2000);
    await this.page.locator('[placeholder="Enter path"]').fill('/field-extension');
    await this.page.locator('[data-test-id="cs-select"]').click();
    await this.page.locator('text="JSON"').click();
    await this.page.waitForTimeout(2000);
    await this.page.locator('button:has-text("Save")').click();
    await this.page.waitForNavigation();
  }
  async stackInstallation(context) {
    await this.page.locator('#info').click();
    await expect(this.page.url()).toContain('info');
    await this.page.waitForTimeout(2000);
    const [newTab] = await Promise.all([
      context.waitForEvent('page'),
      await this.page.click('[data-testid="install-app"]'),
    ]);
    await newTab.waitForLoadState();
    await expect(newTab.url()).toContain('install');
    await newTab.waitForTimeout(2000);
    await newTab.click('.css-2b097c-container');
    await newTab.click(`#${process.env.STACK_API_KEY}`);
    await newTab.click('.Auth__Card--warning');
    await newTab.click('button:has-text("Install")');
    await newTab.waitForNavigation();
    await expect(newTab.url()).toContain('installed-apps');
    await newTab.close();
  }
}
