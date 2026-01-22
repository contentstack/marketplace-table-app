import { Page, expect } from "@playwright/test";
import TopNavigationHelpers from "./topNavigationHelpers";

export interface AppConfig {
  appName: string;
  appSlug: string;
  searchTerm?: string;
}

export class MarketplacePage {
  readonly page: Page;
  readonly appConfig: AppConfig;
  readonly topNavHelpers: TopNavigationHelpers;

  constructor(page: Page, appConfig: AppConfig) {
    this.page = page;
    this.appConfig = {
      ...appConfig,
      searchTerm: appConfig.searchTerm || appConfig.appName,
    };
    this.topNavHelpers = new TopNavigationHelpers(page);
  }

  async switchToOrganization(orgName?: string): Promise<void> {
    const targetOrg = orgName || process.env.ORG_NAME;
    if (!targetOrg) return;
    try {
      await this.topNavHelpers.switchOrganization(targetOrg);
    } catch {
      // Best-effort; org might already be selected
    }
  }

  async navigateToMarketplace() {
    const base = process.env.ENV_URL || process.env.APP_HOST_URL || "";
    await this.page.goto(`${base}/#!/marketplace`);
    await this.page.waitForLoadState("networkidle");
  }

  async navigateToDashboard(stackApiKey?: string) {
    const apiKey = stackApiKey || process.env.STACK_API_KEY;
    if (!apiKey) {
      throw new Error("STACK_API_KEY is required to navigate to dashboard");
    }
    const base = process.env.ENV_URL || process.env.APP_HOST_URL || "";
    await this.page.goto(`${base}/#!/stack/${apiKey}/dashboard`);
    await this.page.waitForLoadState("networkidle");
  }

  async verifyDashboardLoaded() {
    await expect(this.page).toHaveURL(/\/dashboard/);
    await this.page.waitForLoadState("networkidle");
  }

  async navigateToInstalledApps() {
    const base = process.env.ENV_URL || process.env.APP_HOST_URL || "";
    await this.page.goto(`${base}/#!/marketplace/installed-apps?sort=name&order=asc`);
    await this.page.waitForLoadState("networkidle");
  }

  async selectAppsTab() {
    await this.page.locator('[data-test-id="collections-apps"]').getByText("Apps").click();
    await expect(this.page).toHaveURL(/.*marketplace\/apps/);
  }

  async searchApp(searchTerm?: string) {
    const term = searchTerm || this.appConfig.searchTerm || this.appConfig.appName;
    const search = this.page.locator('[data-test-id="cs-search-input-field"]');
    await search.click();
    await search.fill(term);
    await this.page.waitForLoadState("networkidle");
  }

  async selectAppCard() {
    const appSlug = this.appConfig.appSlug.toLowerCase().replace(/\s/g, "-");
    const cardSelector = `[data-test-id="apps-${appSlug}-card"]`;
    await this.page.locator(cardSelector).first().waitFor({ state: "visible" });
    await this.page.locator(cardSelector).first().click();
  }

  async installApp(stackName: string) {
    const appSlug = this.appConfig.appSlug.toLowerCase().replace(/\s/g, "-");
    const installButtonSelector = `[data-test-id="apps-${appSlug}-modal-install"]`;
    await this.page.locator(installButtonSelector).waitFor({ state: "visible" });
    await this.page.locator(installButtonSelector).click();
    await expect(this.page).toHaveURL(/.*install/);

    await this.page.locator(".Portal__indicator").waitFor();
    await this.page.locator(".Portal__indicator").click();
    await this.page.getByText(stackName).waitFor();
    await this.page.getByText(stackName).click();

    const checkbox = this.page.locator(".Checkbox__box");
    if (await checkbox.isVisible().catch(() => false)) {
      await checkbox.click();
    }

    await this.page.getByTestId("modal-form-install-authorize").waitFor();
    await this.page.getByTestId("modal-form-install-authorize").click();
    await this.page.waitForLoadState("networkidle");
  }

  async fullInstallFlow(stackName: string, switchOrg: boolean = true) {
    if (switchOrg) await this.switchToOrganization();
    await this.navigateToMarketplace();
    await this.selectAppsTab();
    await this.searchApp();
    await this.selectAppCard();
    await this.installApp(stackName);
  }

  async uninstallApp(stackName: string) {
    const appSlug = this.appConfig.appSlug.toLowerCase().replace(/\s/g, "-");
    const appName = this.appConfig.appName;
    await this.navigateToInstalledApps();
    const search = this.page.locator('[data-test-id="cs-search-input-field"]');
    await search.click();
    await search.fill(appName);
    await this.page.waitForTimeout(1000);
    await this.page.locator(`[data-test-id="installed-apps-${appSlug}"] [data-test-id="cs-paragraph-tag"]`).click();

    const stackNameShort = stackName.substring(0, 8);
    await this.page
      .getByTestId("cs-modal")
      .locator('[data-test-id="cs-truncate"]')
      .filter({ hasText: new RegExp(stackNameShort, "i") })
      .click();
    await this.page.waitForTimeout(500);
    await this.page.locator(".flex-end > .Dropdown > .Dropdown__header > .Icon--original").click();
    await this.page.getByText("Uninstall from Stack").click();
    await this.page.waitForTimeout(500);
    await this.page.getByTestId("app-name-to-uninstall").fill(appName);
    await this.page.getByTestId("modal-form-uninstall").click();
    await this.page.waitForLoadState("networkidle");
  }
}

export const APP_CONFIGS = {
  TABLE: {
    appName: "Table",
    appSlug: "table",
    searchTerm: "Table",
  } as AppConfig,
};
