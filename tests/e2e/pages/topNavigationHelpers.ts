import { Page, expect } from "@playwright/test";

class TopNavigationHelpers {
  public page: Page;
  public default_timeout: number = 2 * 60 * 1000;

  public selectors = {
    profileIconNew: '[data-test-id="cs-user-profile"]',
    orgSwitcherDropdown: '[data-test-id="cs-org-list-value"]',
    seeMoreOption: '[data-test-id="cs-dropdown-truncate-button"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  private async getSpecificCookie(cookieName: string): Promise<boolean> {
    const cookies = await this.page.context().cookies();
    return cookies.some((c) => c.name === cookieName);
  }

  async checkIfTopNavigationEnabled(): Promise<boolean> {
    return await this.getSpecificCookie("show-app-switcher");
  }

  async switchOrganization(organizationName: string): Promise<void> {
    const isTopNavigationEnabled = await this.checkIfTopNavigationEnabled();
    if (isTopNavigationEnabled) {
      // New top navigation
      await this.page.locator(this.selectors.profileIconNew).click();
      await this.page.locator('[data-test-id="cs-userprofile-orgdropdown"]').click();
      await this.page.locator(".organization__list__label").filter({ hasText: organizationName }).first().click();
      await this.page.waitForTimeout(3000);
      await this.page.waitForLoadState();
    } else {
      // Old side navigation
      await this.page.locator(this.selectors.orgSwitcherDropdown).click();
      await this.page.getByRole("listitem").filter({ hasText: organizationName }).first().click();
      await this.page.waitForTimeout(3000);
      await expect(this.page.url()).toMatch(/#!\/stacks/);
      await this.page.waitForLoadState();
    }
    // Land on marketplace
    await this.page.goto("/#!/marketplace");
  }
}

export default TopNavigationHelpers;
