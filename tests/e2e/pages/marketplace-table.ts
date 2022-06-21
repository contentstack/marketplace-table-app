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
  async openEntry(entryUID: string, apiKey: string | undefined, contentTypeUID: string) {
    await this.page.goto(`/#!/stack/${apiKey}/content-type/${contentTypeUID}/en-us/entry/${entryUID}/edit`);
    await this.page.waitForLoadState();
  }

  async createTable() {
    await this.page.waitForLoadState();
    await this.page.waitForSelector('.app-extension-component');
    const elementHandle = await this.page.$('.app-extension-component');
    this.tableIframe = await elementHandle?.contentFrame();
    expect(await this.tableIframe.locator('.no-asset').innerText()).toContain('Table has not been added');
    await this.tableIframe.locator('.Button__icon').click();
  }

  async deleteTable() {
    await this.tableIframe.locator('.Dropdown__header').nth(0).click();
    await this.tableIframe.locator('.Dropdown__menu__list__item >> text="Delete Table"').click();
    expect(await this.tableIframe.locator('.no-asset').innerText()).toContain('Table has not been added');
  }

  // selects a cell and open it dropdown
  async cellDropdown(cellIndex: number) {
    await this.tableIframe.locator('.data-input').nth(cellIndex).click();
    await this.tableIframe
      .locator('.cell-dropdown')
      .nth(cellIndex)
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
    await this.tableIframe.locator('.Dropdown__menu__list__item >> text="Insert Column Left"').click();
    await this.addContent(5);
  }

  async addColumnToRight() {
    await this.cellDropdown(0); // cell selection
    await this.tableIframe.locator('.Dropdown__menu__list__item >> text="Insert Column Right"').click(); // select operation
    await this.addContent(5); // no of content to be added
  }

  async deleteRow() {
    await this.cellDropdown(0); //cell selection
    await this.tableIframe.locator('.Dropdown__menu__list__item >> text="Delete Row"').click(); // select operation
    await this.tableIframe.waitForTimeout(2000);
  }

  async deleteCol() {
    await this.cellDropdown(0); //cell selection
    await this.tableIframe.locator('.Dropdown__menu__list__item >> text="Delete Column"').click();
    await this.tableIframe.waitForTimeout(2000);
  }

  // add table header
  async enableTableHeader() {
    await this.cellDropdown(0);
    await this.tableIframe
      .locator('.Dropdown__menu__list__item >> text="Insert Row Above"')
      .click();
    for (let index = 0; index < 4; index++) {
      if (!(await this.tableIframe.locator('.data-input').nth(index).innerHTML())) {
        await this.tableIframe.locator('.data-input').nth(index).type(`Title ${index}`);
        await this.tableIframe.waitForTimeout(2000);
      }
    }
    await this.tableIframe.locator('#table-actions').click();
    await this.tableIframe.locator('.Dropdown__menu__list__item >> [data-test-id="cs-toggle-switch"]').click();
    await this.tableIframe.locator('#table-actions').click();
  }

  async searchValue() {
    await this.tableIframe.locator('.Search__input').click();
    await this.tableIframe.locator('.Search__input').fill('e');
    await this.tableIframe.waitForTimeout(3000);
    await this.checkTableData([ 's', 'x', 'd', 'e', 'f']);
  }

  async clearSearch() {
    await this.tableIframe.locator('.Search__input').fill('');
    await this.tableIframe.waitForTimeout(2000);
  }

  async sortAscending() {
    await this.tableIframe.locator('.th-content').nth(0).click();
    await this.tableIframe.waitForTimeout(2000);
    await this.checkTableData([
      'a', 'q', 'b', 'c',
      'd', 's', 'e', 'f',
      'g', 't', 'h', 'i',
      'm', 'r', 'n', 'o',
    ]);
  }

  async sortDescending() {
    await this.tableIframe.locator('.th-content').nth(0).click();
    await this.tableIframe.waitForTimeout(2000);
    await this.checkTableData([
      'm', 'r', 'n', 'o',
      'g', 't', 'h', 'i',
      'd', 's', 'e', 'f',
      'a', 'q', 'b', 'c',
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
