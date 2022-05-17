import { expect, Page } from '@playwright/test';

export class MarketplaceTable {
  readonly page: Page;
  readonly tableIframe;
  constructor(page: Page, frame: Page) {
    this.page = page;
    this.tableIframe = frame;
  }
  async openStack() {
    await this.page.goto(`/#!/stack/${process.env.STACK_API_KEY}/dashboard`);
    await this.page.waitForLoadState();
  }

  async openEntry(entryTitle: string) {
    await this.page.locator('svg[name="Entries"]').click();
    await this.page.locator(`.curr-entry-title >> text="${entryTitle}"`).click();
    await this.page.waitForTimeout(2000);
    expect(await this.page.locator('.PageTitle >> .title')).toHaveText(entryTitle);
  }

  async createTable() {
    await this.tableIframe.waitForLoadState();
    const frameCheck = expect(await this.tableIframe.locator('.no-asset')).toBeTruthy();
    console.log('checker...', frameCheck);
    await this.tableIframe.waitForTimeout(4000);
    const addButton = await this.tableIframe.waitForSelector('button:has-text("Add Table")');
    await addButton.click();
  }

  async addNewRow() {
    await this.tableIframe.locator('.add-row').click();
  }

  async addTableContent() {
    const tableCell = await this.tableIframe.$$('.data-input >> [contenteditable="true"]');
    const cellCol = 'abcdefg'.split('');
    let tab = 1;
    tableCell.length &&
      tableCell.forEach((cell, index) => {
        if (!cell.innerHTML) {
          cell.type(`${cellCol[tab] + index}`);
          index % 2 === 0 && tab++;
        }
      });
  }
}
