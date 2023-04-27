import { expect, Locator, Page, Frame, FileChooser } from '@playwright/test';
import { elements } from '../elements/Tabbleapppage.elements';

export class TableApp {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async installTableApp(){

  await this.page
  .goto('/#!/marketplace');
    
  await this.page.locator('#incubation-microapps svg').nth(1).click();
  await expect(this.page).toHaveURL('/#!/marketplace');
  
  await this.page.locator('[data-test-id="cs-search-input-field"]').click();
  
  await this.page.locator('[data-test-id="cs-search-input-field"]').press('CapsLock');
  
  await this.page.locator('[data-test-id="cs-search-input-field"]').fill('Table');
  await expect(this.page).toHaveURL('/#!/marketplace?search=Table');
  
  await this.page.locator('[data-test-id="apps-table-install-app"]').click();
  await expect(this.page).toHaveURL(`/#!/apps/625e651a4c5f8f0018356f01/install`); //thats the link of the Tableapp
  
  await this.page.locator('[data-test-id="cs-select"] div:has-text("Select Option")').nth(2).click();
  
  await this.page.locator('text=Table App E2E Development').click();
  
  await this.page.locator('input[type="checkbox"]').check();
  
  await this.page.locator('[data-testid="modal-form-install-authorize"]').click();
  await expect(this.page).toHaveURL('/#!/marketplace/installed-apps');
  
  await this.page.locator('#microapps-links [aria-label="Stacks"]').click();
  await expect(this.page).toHaveURL('/#!/stacks');
  
  await this.page.locator('[data-test-id="cs-page-layout"] >> text=Table App E2E Development').click();
  await expect(this.page).toHaveURL(`/#!/stack/${process.env.STACK_API_KEY}/dashboard`);

  await this.page.locator('[aria-label="Content-models"] svg').click();
  await expect(this.page).toHaveURL(`/#!/stack/${process.env.STACK_API_KEY}/content-types`);
  
  await this.page.locator('[data-test-id="cs-cb-empty-new-ct"]').click();
  
  await this.page.locator('[placeholder="Enter content type name"]').press('CapsLock');
  
  await this.page.locator('[placeholder="Enter content type name"]').fill('Table');
  
  await this.page.locator('[placeholder="Enter content type name"]').press('CapsLock');
  
  await this.page.locator('[placeholder="Enter content type name"]').fill('TableApp');
  
  await this.page.locator('[data-test-id="cs-cb-edit-ct-details"]').click();
  await expect(this.page).toHaveURL(`/#!/stack/${process.env.STACK_API_KEY}/content-type/tableapp/content-type-builder`);
  
  await this.page.locator('[data-test-id="cs-field-type-selector"] path').click();
  
  await this.page.locator('#InfoModalWrapper div:has-text("Custom")').nth(3).click();
  
  await this.page.locator('[data-test-id="empty-state"] svg').click();
  
  await this.page.locator('div[role="cell"]:has-text("Table")').first().click();
  
  await this.page.locator('[data-test-id="cs-new-entry-single-proceed"]').click();
  
  await this.page.locator('[data-test-id="cs-ct-save-close"]').click();
  await expect(this.page).toHaveURL(`/#!/stack/${process.env.STACK_API_KEY}/content-types`);
  
  await this.page.locator('[aria-label="Entries"] svg').click();
  await expect(this.page).toHaveURL(`/#!/stack/${process.env.STACK_API_KEY}/entries`);
  
  }


  async createTableApp() {

    await this.page
      .goto(`/#!/stack/${process.env.STACK_API_KEY}/content-type/tableapp/en-us/entry/create`);

    await this.page
    .frameLocator('[data-testid="app-extension-frame"]')
    .locator('[data-test-id="cs-button"]')
    .click();

  }

  async importCsv(){
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

  async uninstallTableApp(){

    await this.page
      .goto('/#!/marketplace');
  
    await this.page
      .locator('[data-test-id="manage-tab"]')
      .click();

    await expect(this.page)
      .toHaveURL('/#!/marketplace/installed-apps?sort=name&order=asc');
  
    await this.page
      .locator('[data-test-id="settings-installed-apps"]')
      .click();
  
    await this.page
      .locator('[placeholder="Search for apps"]')
      .click();
  
    await this.page
      .locator('[placeholder="Search for apps"]')
      .fill('table');

    await expect(this.page)
      .toHaveURL('/#!/marketplace/installed-apps?order=asc&search=table&sort=name');

    await this.page
      .locator('[data-test-id="installed-apps-table"]')
      .click();
  
    await this.page
      .locator(elements.uninstalltableLocator)
      .click();

    await this.page
      .locator('[data-testid="app-name-to-uninstall"]')
      .press('CapsLock');
 
    await this.page
      .locator('[data-testid="app-name-to-uninstall"]')
      .fill('Table');

    await this.page
      .locator('[data-testid="modal-form-uninstall"]')
      .click();

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
  

