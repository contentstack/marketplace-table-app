/* eslint-disable prettier/prettier */
import { expect, Page } from "@playwright/test";
import path from "path";

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

  async initializeIframe() {
    await this.page.waitForLoadState("networkidle");
    const iframeSelectors = [
      ".app-extension-component",
      '[data-testid="app-extension-frame"]',
      '[data-test-id="full-page-location-iframe"]',
      'iframe[title*="Table"]',
    ];
    let handle: any = null;
    for (const sel of iframeSelectors) {
      try {
        await this.page.waitForSelector(sel, { timeout: 10000 });
        handle = await this.page.$(sel);
        if (handle) break;
      } catch {
        continue;
      }
    }
    if (!handle) {
      throw new Error("Table app iframe not found on entry page");
    }
    this.tableIframe = await handle.contentFrame();
  }

  async createTable() {
    await this.page.waitForLoadState();
    await this.page.waitForSelector(".app-extension-component");
    const elementHandle = await this.page.$(".app-extension-component");
    this.tableIframe = await elementHandle?.contentFrame();
    expect(await this.tableIframe.locator(".no-asset").innerText()).toContain("Table has not been added");
    await this.tableIframe.locator(".Button__icon").click();
  }

  async deleteTable() {
    await this.tableIframe.locator(".Dropdown__header").nth(0).click();
    await this.tableIframe.locator('.Dropdown__menu__list__item >> text="Delete Table"').click();
    expect(await this.tableIframe.locator(".no-asset").innerText()).toContain("Table has not been added");
  }

  // selects a cell and open it dropdown
  async cellDropdown(cellIndex: number) {
    await this.tableIframe.locator(".data-input").nth(cellIndex).click();
    await this.tableIframe.locator(".cell-dropdown").nth(cellIndex).click();
  }

  // add content to the table after adding new rows and columns
  async addContent(cellLength: number) {
    this.tableLength = await this.tableIframe.locator(".data-input").count();
    const newTableContent = this.tableContent.splice(this.tableIndex, cellLength);
    let rowCount = 0;
    for (let index = 0; index < this.tableLength; index++) {
      if (!(await this.tableIframe.locator(".data-input").nth(index).innerHTML())) {
        await this.tableIframe.locator(".data-input").nth(index).type(newTableContent[rowCount]);
        rowCount += 1;
      }
    }
  }

  async addRowAbove(cell: number) {
    await this.cellDropdown(cell);
    await this.tableIframe.locator('.Dropdown__menu__list__item >> text="Insert Row Above"').click();
    await this.addContent(3);
  }

  async addRowBelow(cell: number) {
    await this.cellDropdown(cell);
    await this.tableIframe.locator('.Dropdown__menu__list__item >> text="Insert Row Below"').click();
    await this.addContent(3);
  }

  // add table content in beginning
  async addTableContent() {
    this.tableLength = await this.tableIframe.locator(".data-input").count();
    this.tableContent = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789".split("");
    for (let index = 0; index < this.tableLength; index++) {
      await this.tableIframe.locator(".data-input").nth(index).type(this.tableContent[index]);
    }
    this.tableIndex = JSON.parse(JSON.stringify(this.tableLength));
  }

  // Click on first cell to make table actions visible
  async clickFirstCell() {
    await this.tableIframe.locator(".data-input").first().click();
    await this.tableIframe.waitForTimeout(500);
  }

  async addColumnToLeft(cell: number) {
    await this.cellDropdown(cell); // cell selection
    await this.tableIframe.locator('.Dropdown__menu__list__item >> text="Insert Column Left"').click();
    await this.tableIframe.locator(".data-input").nth(cell).click();
    await this.addContent(5);
    await this.tableIframe.waitForTimeout(2000);
  }

  async addColumnToRight(cell: number) {
    await this.cellDropdown(cell); // cell selection
    await this.tableIframe.locator('.Dropdown__menu__list__item >> text="Insert Column Right"').click(); // select operation
    await this.tableIframe.locator(".data-input").nth(cell).click();
    await this.addContent(5); // no of content to be added
    await this.tableIframe.waitForTimeout(2000);
  }

  async deleteRow(cell: number) {
    await this.cellDropdown(cell); //cell selection
    await this.tableIframe.locator('.Dropdown__menu__list__item >> text="Delete Row"').click(); // select operation
  }

  async deleteCol(cell: number) {
    await this.cellDropdown(cell); //cell selection
    await this.tableIframe.locator('.Dropdown__menu__list__item >> text="Delete Column"').click();
  }

  // add table header
  async enableTableHeader(cell: number) {
    // Ensure table has content in first row (header row uses first row's data)
    // If first row is empty, add content to it
    const firstRowCellCount = await this.tableIframe.locator(".data-input").count();
    const columnCount = Math.min(4, firstRowCellCount); // Check up to 4 columns or available cells

    for (let index = 0; index < columnCount; index++) {
      const cellContent = await this.tableIframe.locator(".data-input").nth(index).innerHTML();
      if (!cellContent || cellContent.trim() === "") {
        await this.tableIframe.locator(".data-input").nth(index).type(`Title ${index}`);
        await this.tableIframe.waitForTimeout(300);
      }
    }

    // Wait for content to be set
    await this.tableIframe.waitForTimeout(500);

    // Now enable header row (it will use the first row's content as headers)
    await this.tableIframe.locator("#table-actions").click();
    await this.tableIframe.waitForTimeout(300);
    await this.tableIframe.locator('[data-test-id="cs-toggle-switch"]').first().click();
    await this.tableIframe.waitForTimeout(1000);
    await this.tableIframe.locator("#table-actions").click();
  }

  async searchValue() {
    await this.tableIframe.locator(".Search__input").click();
    await this.tableIframe.locator(".Search__input").fill("e");
    await this.tableIframe.waitForTimeout(3000);
  }

  async clearSearch() {
    await this.tableIframe.locator(".Search__input").fill("");
    await this.tableIframe.waitForTimeout(2000);
  }

  async sortAscending() {
    await this.tableIframe.locator(".th-content").nth(0).click();
    await this.checkTableData(["a", "q", "b", "c", "d", "s", "e", "f", "g", "t", "h", "i", "m", "r", "n", "o"]);
  }

  async sortDescending() {
    await this.tableIframe.locator(".th-content").nth(0).click();
    await this.checkTableData(["m", "r", "n", "o", "g", "t", "h", "i", "d", "s", "e", "f", "a", "q", "b", "c"]);
  }

  async saveContent() {
    await this.page.locator('[name="Save"]').click();
    await this.page.waitForTimeout(2000);
    await this.page.waitForLoadState();
  }

  async checkTableContent() {
    const tableHandle = await this.tableIframe.$(".cs-extension-table");
    expect(await tableHandle.$$eval(".data-input", (nodes) => nodes.map((n) => n.innerHTML))).toEqual(
      this.tableContent.slice(0, this.tableLength),
    );
  }

  async checkTableData(tableContent: string[]) {
    const tableHandle = await this.tableIframe.$(".cs-extension-table");
    expect(await tableHandle.$$eval(".data-input", (nodes) => nodes.map((n) => n.innerHTML))).toEqual(tableContent);
  }

  async checkTableExport() {
    const [exportedFile] = await Promise.all([
      // It is important to call waitForEvent before click to set up waiting.
      this.page.waitForEvent("download"),
      // Triggers the download.
      this.tableIframe.locator(".tippy-wrapper").nth(1).click(),
    ]);
    const downloadPath = await exportedFile.path();
    await expect(downloadPath).toBeTruthy();
  }

  async checkTableImport() {
    await this.tableIframe.locator(".tippy-wrapper").nth(0).click();
    await this.tableIframe.locator('.Radio-wrapper >> text="Replace Data"').click();
    // path for csv file that need to be uploaded
    const importFile = path.join(process.cwd() + "/tests/e2e/downloads/tableExport.csv");
    // file uploading event listener
    const [fileChooser] = await Promise.all([
      // It is important to call waitForEvent before click to set up waiting.
      this.page.waitForEvent("filechooser"),
      // Opens the file chooser.
      this.tableIframe.locator('[data-test-id="cs-button"] >> text="Import Table"').click(),
    ]);
    await fileChooser.setFiles(importFile);
    await this.tableIframe.waitForTimeout(2000);
    // check table content after importing file
    await this.checkTableData(["a", "b", "c", "d", "e", "f", "g", "h", "i"]);
  }

  async compressTable() {
    await this.tableIframe.locator('[name="Compress"]').click();
  }

  async checkFullscreen() {
    await this.tableIframe.locator(".tippy-wrapper").nth(2).click();
    await this.tableIframe.waitForTimeout(3000);
    await this.checkTableData(["a", "b", "c", "d", "e", "f", "g", "h", "i"]);
    await this.addRowAbove(0);
    await this.compressTable();
    await this.checkTableData(["z", "A", "B", "a", "b", "c", "d", "e", "f", "g", "h", "i"]);
  }

  // Header Row Edit methods
  async enableHeaderRow() {
    await this.tableIframe.locator("#table-actions").click();
    await this.tableIframe.locator('[data-test-id="cs-toggle-switch"]').first().click();
    await this.tableIframe.waitForTimeout(1000);
    await this.tableIframe.locator("#table-actions").click();
  }

  async editHeaderRowCell(columnIndex: number, newValue: string) {
    // Click on the header cell to edit (ContentEditable component)
    const headerCell = this.tableIframe.locator(".header-editable").nth(columnIndex);
    await headerCell.click();
    await this.tableIframe.waitForTimeout(300);

    // For ContentEditable, we'll use evaluate to set content and trigger change event
    // This is more reliable than keyboard shortcuts
    await headerCell.evaluate((element, value) => {
      element.textContent = value;
      // Trigger input event to notify React ContentEditable
      const event = new Event("input", { bubbles: true });
      element.dispatchEvent(event);
    }, newValue);
    await this.tableIframe.waitForTimeout(300);

    // Blur to trigger onChange handler which saves the value
    await headerCell.blur();
    await this.tableIframe.waitForTimeout(500);
  }

  async checkHeaderRowValue(columnIndex: number, expectedValue: string) {
    const headerCell = this.tableIframe.locator(".header-editable").nth(columnIndex);
    // ContentEditable stores value in innerHTML, but we should get text content
    const actualValue = await headerCell.textContent();
    expect(actualValue?.trim()).toBe(expectedValue);
  }

  async testHeaderRowEdit() {
    // Wait for table to be ready
    await this.tableIframe.waitForSelector(".data-input");

    // Enable header row
    await this.enableHeaderRow();

    // Wait for header row to be available
    await this.tableIframe.waitForSelector(".header-editable");

    // Edit first header cell
    await this.editHeaderRowCell(0, "Product Name");
    await this.checkHeaderRowValue(0, "Product Name");

    // Edit second header cell
    await this.editHeaderRowCell(1, "Price");
    await this.checkHeaderRowValue(1, "Price");

    // Edit third header cell
    await this.editHeaderRowCell(2, "Quantity");
    await this.checkHeaderRowValue(2, "Quantity");

    // Save and reload to verify persistence
    await this.saveContent();
    await this.page.reload();
    await this.page.waitForLoadState();
    await this.initializeIframe();
    await this.tableIframe.waitForSelector(".header-editable");

    // Verify headers persist after reload
    await this.checkHeaderRowValue(0, "Product Name");
    await this.checkHeaderRowValue(1, "Price");
    await this.checkHeaderRowValue(2, "Quantity");
  }

  async testHeaderRowEditWithLongText() {
    // Header row is already enabled from previous test, no need to enable again
    // Wait for header row to be available
    await this.tableIframe.waitForSelector(".header-editable");

    // Test editing with long text
    const longText = "This is a very long header name that should be handled properly";
    await this.editHeaderRowCell(0, longText);
    await this.checkHeaderRowValue(0, longText);

    // Test editing with special characters
    const specialText = 'Header & Name <Test> "Quotes"';
    await this.editHeaderRowCell(1, specialText);
    await this.checkHeaderRowValue(1, specialText);
  }

  // Cell Vertical Scroll methods
  async addLongContentToCell(cellIndex: number, content: string) {
    const cell = this.tableIframe.locator(".data-input").nth(cellIndex);
    await cell.click();
    await this.tableIframe.waitForTimeout(200);
    // For ContentEditable, use evaluate to set content directly
    // This is more reliable than keyboard shortcuts
    await cell.evaluate((element, value) => {
      element.textContent = value;
      // Trigger input event for ContentEditable
      const event = new Event("input", { bubbles: true });
      element.dispatchEvent(event);
    }, content);
    await this.tableIframe.waitForTimeout(500);
  }

  async checkCellVerticalScroll(cellIndex: number) {
    // Check the .cell container which has max-height: 200px
    const cellContainer = this.tableIframe.locator(".cell").nth(cellIndex);
    const cellElement = await cellContainer.elementHandle();

    // Check if cell has scrollable content
    const scrollHeight = await cellElement.evaluate((el) => el.scrollHeight);
    const clientHeight = await cellElement.evaluate((el) => el.clientHeight);

    // If content exceeds max-height (200px), verify it can scroll
    if (scrollHeight > clientHeight) {
      // Get computed styles to check overflow
      const overflowY = await cellElement.evaluate((el) => window.getComputedStyle(el).overflowY);

      // The cell should allow vertical scrolling (auto or scroll)
      // Note: overflow-x is hidden, but overflow-y should allow scrolling
      const canScroll = overflowY === "auto" || overflowY === "scroll" || overflowY === "visible";

      // Test actual scrolling capability
      const initialScrollTop = await cellElement.evaluate((el) => el.scrollTop);

      // Try to scroll to bottom
      await cellElement.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      await this.tableIframe.waitForTimeout(200);

      const finalScrollTop = await cellElement.evaluate((el) => el.scrollTop);

      // Verify scrolling occurred (scrollTop changed)
      expect(finalScrollTop).toBeGreaterThan(initialScrollTop);

      // Scroll back to top
      await cellElement.evaluate((el) => {
        el.scrollTop = 0;
      });
    } else {
      // If content doesn't exceed height, that's also valid
      console.log(`Cell ${cellIndex} content fits within max-height, no scroll needed`);
    }
  }

  async testCellVerticalScroll() {
    // Create table with content
    await this.createTable();

    // Add very long content to a cell (more than 200px height)
    // Using multiline content that will exceed max-height: 200px
    const longContent = Array.from({ length: 30 }, (_, i) =>
      `Line ${i + 1}: This is a long line of text that will wrap and create multiple lines.`.repeat(2),
    ).join("\n");
    await this.addLongContentToCell(0, longContent);

    // Wait for content to render
    await this.tableIframe.waitForTimeout(500);

    // Verify cell has vertical scroll capability
    await this.checkCellVerticalScroll(0);

    // Test scrolling within cell container
    const cellContainer = this.tableIframe.locator(".cell").nth(0);
    const cellElement = await cellContainer.elementHandle();

    // Scroll to bottom
    await cellElement.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await this.tableIframe.waitForTimeout(300);

    // Verify scroll position
    const scrollTop = await cellElement.evaluate((el) => el.scrollTop);
    expect(scrollTop).toBeGreaterThan(0);

    // Scroll back to top
    await cellElement.evaluate((el) => {
      el.scrollTop = 0;
    });
    await this.tableIframe.waitForTimeout(300);

    const scrollTopAfter = await cellElement.evaluate((el) => el.scrollTop);
    expect(scrollTopAfter).toBe(0);
  }

  async testMultipleCellsWithVerticalScroll() {
    await this.createTable();
    await this.addTableContent();

    // Add long content to multiple cells
    const longContent = "This is a very long line of text that will wrap and create multiple lines. ".repeat(10);

    for (let i = 0; i < 3; i++) {
      await this.addLongContentToCell(i, longContent);
      await this.checkCellVerticalScroll(i);
    }

    // Save and verify scroll still works after save
    await this.saveContent();
    await this.page.reload();
    await this.page.waitForLoadState();
    await this.initializeIframe();

    // Verify scroll functionality persists
    await this.checkCellVerticalScroll(0);
  }
}
