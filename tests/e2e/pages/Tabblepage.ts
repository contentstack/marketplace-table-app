import { expect, Locator, Page, Frame, FileChooser } from '@playwright/test';
import { elements } from '../elements/Tabbleapppage.elements';

export class TableApp {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async createTable(contentTypeUID: string, entryUID: string) {

    await this.page
      .goto(`/#!/stack/${process.env.STACK_API_KEY}/content-type/${contentTypeUID}/en-us/entry/${entryUID}/edit`);

    await this.page
    .frameLocator('[data-testid="app-extension-frame"]')
    .locator('[data-test-id="cs-button"]')
    .click();

  }

  async importCsv(contentTypeUID: string, entryUID: string){
    await this.page
      .goto(`/#!/stack/${process.env.STACK_API_KEY}/content-type/${contentTypeUID}/en-us/entry/${entryUID}/edit`);

    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('.importCSV')
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('label:has-text("Replace Data")')
      .click();
    await this.page
      .on("filechooser", (fileChooser: FileChooser) => {
        fileChooser.setFiles(["tests/e2e/downloads/demo_spreadsheet_table_app.csv"]);
      })
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('button:has-text("Import Table")')
      .click()
      
  }

  async exportCsv(){
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.frameLocator('[data-testid="app-extension-frame"]').locator('.exportCSV').click()
    ]);
  }
  async searchonTable(){
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('[placeholder="Search"]')
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('[placeholder="Search"]')
      .fill(`${elements.searchExample}`);
  }
  async enterFullscreen(){
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('.fullscreenBtn')
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('.Tab__icon')
      .click();
  }
  async makeHeaderRow(){
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.cellHeaderLocator)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.headerDropdownbutton)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.setHeaderRowLocator)
      .first()
      .click();
  }

  async makeHeaderColumn(){
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.setHeaderColumnLocator)
      .first()
      .click();
  }


  async moveColumns(){
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('path:nth-child(6)')
      .first()
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('span')
      .first()
      .click();
    await this.page
      .locator('#PageLayout__body')
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('#tableRef > div:nth-child(2) > div > div:nth-child(2)')
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('.search-wrapper')
      .click();
  }


  async sortTable(){ //this only will sort ascend or descent
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.sortHeaderCell)
      .click();
      await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.sortHeaderCell)
      .click();
  }
  async deleteTable(){
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.cellHeaderLocator)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.headerDropdownbutton)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.deleteTableLocator)
      .click();
    await this.page
      .locator('text=StackTable App E2E Development edSearch Entries(⌘K)EntriesEnter keywords, or hit >> [aria-label="Stacks"] svg')
      .click();
      
    await this.page
      .locator('[data-test-id="cs-dont-save-entry"]')
      .click();
    await expect(this.page)
    .toHaveURL('/#!/stacks');
    
    


  }

  async insertRowAbove(){
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.selectCellLocator)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.cellArrowDropdown)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.insertRowAboveLocator)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.cellArrowDropdown)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.selectCellLocator)
      .click();
  }

  async insertRowBelow(){
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.selectCellLocator)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.cellArrowDropdown)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.insertRowBelowLocator)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.cellArrowDropdown)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.selectCellLocator)
      .click();

  }

  async deleteRow(){
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.selectCellLocator)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.cellArrowDropdown)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.deleteRowLocator)
      .click();
      await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.cellArrowDropdown)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.selectCellLocator)
      .click();
  }

  async insertColumnRight(){
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.selectLocatorColumnCell)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.cellArrowDropdownColumn)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.insertColumnRightLocator)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.cellArrowDropdownColumn)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.selectLocatorColumnCell)
      .click();
  }

  async insertColumnLeft(){
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.selectLocatorColumnCell)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.cellArrowDropdownColumn)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.insertColumnLeftLocator)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.cellArrowDropdownColumntwo)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.selectLocatorColumnCelltwo)
      .click();
  }

  async deleteColumn(){
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.selectLocatorColumnCelltwo)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.cellArrowDropdownColumntwo)
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.deleteColumnLocator)
      .click();
  }

}
  

