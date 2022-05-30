/* eslint-disable prettier/prettier */
import { expect, Page } from '@playwright/test';

export class MarketplaceTable {
  readonly page: Page;
  tableIframe;
  tableLength: number;
  tableIndex: number;
  tableContent: string[];

  constructor(page: Page) {
    this.page = page;
  }

  // opens newly created entry
  async openEntry(entryUID: string, apiKey: string, contentTypeUID: string) {
    await this.page.goto(`/#!/stack/${apiKey}/content-type/${contentTypeUID}/en-us/entry/${entryUID}/edit`);
    await this.page.waitForLoadState();
  }

  async createTable() {
    await this.page.waitForLoadState();
    await this.page.waitForSelector('.app-extension-component');
    const elementHandle = await this.page.$('.app-extension-component');
    this.tableIframe = await elementHandle.contentFrame();
    expect(await this.tableIframe.locator('.no-asset').innerText()).toContain('Table has not been added');
    await this.tableIframe.locator('.Button__icon').click();
  }

  async deleteTable() {
    await this.tableIframe.locator('.Dropdown__header').nth(0).click();
    await this.tableIframe.locator('.delete-option').click();
    expect(await this.tableIframe.locator('.no-asset').innerText()).toContain('Table has not been added');
  }

  // selects a cell and open it dropdown
  async cellDropdown(cellIndex: number) {
    await this.tableIframe.locator('.data-input').nth(cellIndex).click();
    await this.tableIframe
      .locator('[data-test-id="cs-dropdown"]')
      .nth(cellIndex + 1)
      .click();
  }

  // add content to the table after adding new rows and columns
  async addContent(cellLength: number) {
    this.tableLength = await this.tableIframe.locator('.data-input').count();
    const newTableContent = this.tableContent.splice(this.tableIndex, cellLength);
    let rowCount = 0;
    for (let index = 0; index < this.tableLength; index++) {
      if (!(await this.tableIframe.locator('.data-input').nth(index).innerHTML())) {
        await this.tableIframe.locator('.data-input').nth(index).type(newTableContent[rowCount]);
        rowCount += 1;
      }
    }
  }

  async addRowAbove() {
    await this.cellDropdown(0);
    await this.tableIframe
      .locator('.Dropdown__menu__list__item >> text="Insert Row Above"')
      .click();
    await this.addContent(3);
  }

  async addRowBelow() {
    await this.cellDropdown(3);
    await this.tableIframe
      .locator('.Dropdown__menu__list__item >> text="Insert Row Below"')
      .click();
    await this.addContent(3);
  }

  // add table content in beginning
  async addTableContent() {
    this.tableLength = await this.tableIframe.locator('.data-input').count();
    this.tableContent = 'abcdefghijklmnopqrstuvwxyz'.split('');
    for (let index = 0; index < this.tableLength; index++) {
      await this.tableIframe.locator('.data-input').nth(index).type(this.tableContent[index]);
    }
    this.tableIndex = JSON.parse(JSON.stringify(this.tableLength));
  }

  async addColumnToLeft() {
    await this.cellDropdown(0); // cell selection
    await this.tableIframe.locator('.Dropdown__menu__list__item').nth(3).click();
    await this.addContent(5);
  }

  async addColumnToRight() {
    await this.cellDropdown(1); // cell selection
    await this.tableIframe.locator('.Dropdown__menu__list__item').nth(4).click(); // select operation
    await this.addContent(5); // no of content to be added
  }

  async deleteRow() {
    await this.cellDropdown(0); //cell selection
    await this.tableIframe.locator('.Dropdown__menu__list__item >> text="Delete Row"').click(); // select operation
  }

  async deleteCol() {
    await this.cellDropdown(0);
    await this.tableIframe.locator('.Dropdown__menu__list__item >> text="Delete Column"').click();
  }

  // add table header
  async enableTableHeader() {
    await this.cellDropdown(0);
    await this.tableIframe
      .locator('.Dropdown__menu__list__item >> text="Insert Row Above"')
      .click();
    const totalCell = await this.tableIframe.locator('.data-input').count();
    let rowCount = 0;
    for (let index = 0; index < totalCell; index++) {
      if (!(await this.tableIframe.locator('.data-input').nth(index).innerHTML())) {
        await this.tableIframe.locator('.data-input').nth(index).type(`Title ${index}`);
        rowCount += 1;
      }
    }
    await this.tableIframe.locator('.Dropdown__header').nth(0).click();
    await this.tableIframe.locator('.Dropdown__menu__list__item >> [data-test-id="cs-toggle-switch"]').click();
    await this.tableIframe.locator('.Dropdown__header').nth(0).click();
  }

  async searchValue() {
    await this.tableIframe.locator('.Search__input').click();
    await this.tableIframe.locator('.Search__input').fill('e');
    await this.tableIframe.waitForTimeout(3000);
    await this.checkTableData(['d', 'e', 's', 'f']);
  }

  async clearSearch() {
    await this.tableIframe.locator('.Search__input').fill('');
    await this.tableIframe.waitForTimeout(2000);
  }

  async sortAscending() {
    await this.tableIframe.locator('.th-content').nth(0).click();
    await this.tableIframe.waitForTimeout(2000);
    await this.checkTableData([
      'a', 'b', 'q', 'c',
      'd', 'e', 's', 'f',
      'g', 'h', 't', 'i',
      'm', 'n', 'r', 'o',
    ]);
  }

  async sortDescending() {
    await this.tableIframe.locator('.th-content').nth(0).click();
    await this.tableIframe.waitForTimeout(2000);
    await this.checkTableData([
      'm', 'n', 'r', 'o',
      'g', 'h', 't', 'i',
      'd', 'e', 's', 'f',
      'a', 'b', 'q', 'c',
    ]);
  }

  async saveContent() {
    await this.page.locator('[name="Save"]').click();
    await this.page.waitForTimeout(2000);
    await this.page.waitForLoadState();
  }

  async checkTableContent() {
    const tableHandle = await this.tableIframe.$('.cs-extension-table');
    expect(
      await tableHandle.$$eval('.data-input', (nodes) => nodes.map((n) => n.innerHTML)),
    ).toEqual(this.tableContent.slice(0, this.tableLength));
  }

  async checkTableData(tableContent: string[]) {
    const tableHandle = await this.tableIframe.$('.cs-extension-table');
    expect(
      await tableHandle.$$eval('.data-input', (nodes) => nodes.map((n) => n.innerHTML)),
    ).toEqual(tableContent);
  }
}
