import { test, expect, Locator, Page, Frame } from '@playwright/test';


export class TableApp {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async InstallTableApp(){
    
    await this.page
      .goto('/#!/stacks');
    
    await this.page
      .locator('.MarketPlaceIcon > svg > path:nth-child(3)')
      .click();

    await expect(this.page)
      .toHaveURL('/#!/marketplace');
  
    await this.page
      .locator('[placeholder="Search for apps\\, starters etc\\."]')
      .click();
    
    await this.page
      .locator('[placeholder="Search for apps\\, starters etc\\."]')
      .fill('table');

    await expect(this.page)
      .toHaveURL('/#!/marketplace?search=table');
  
    await this.page
      .locator('h2:has-text("Table")')
      .click();
  
    await this.page
      .locator('[data-test-id="app-details-modal-header"] path')
      .nth(3)
      .click();
  
    await this.page
      .locator('[data-test-id="apps-table-install-app"]')
      .click();

    await expect(this.page)
      .toHaveURL('/#!/apps/625e651a4c5f8f0018356f01/install');
  
    await this.page
      .locator('.Portal__indicator')
      .click();
  
    await this.page
      .locator('#react-select-2-option-9')
      .click();
  
    await this.page
      .locator('input[type="checkbox"]')
      .check();

    await this.page
      .locator('[data-testid="modal-form-install-authorize"]')
      .click();

    await expect(this.page)
    .toHaveURL('/#!/marketplace/installed-apps');


  }


  async createTableApp() {
    await this.page
    .frameLocator('[data-testid="app-extension-frame"]')
    .locator('[data-test-id="cs-button"]')
    .click();
  }
  async Importcsv(){
    await this.page
    .goto('#!/stack/${STACK_API_KEY}/content-type/test_table_app/en-us/entry/create');
    await this.page
    .frameLocator('[data-testid="app-extension-frame"]')
    .locator('button:has-text("Import Table")')
    .click();
    await this.page
    .frameLocator('[data-testid="app-extension-frame"]')
    .locator('body:has-text("Press space bar to start a drag. When dragging you can use the arrow keys to mov")')
    .setInputFiles('Untitled spreadsheet - Sheet1.csv');
  }
  async Exportcsv(){
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.frameLocator('[data-testid="app-extension-frame"]').locator('.exportCSV').click()
    ]);
  }
  async SearchonTable(){
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('[placeholder="Search"]')
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('[placeholder="Search"]')
      .fill('1');
  }
  async Enterfullscreen(){
    await this.page
      .goto('#!/stack/${STACK_API_KEY}/content-type/test_table_app/en-us/entry/create');
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
      .locator('[data-test-id="cs-button"]')
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('path:nth-child(2)')
      .first()
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('span')
      .first()
      .click();
  }
  async makeHeaderColumn(){
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('path:nth-child(3)')
      .first()
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('span')
      .nth(1)
      .click();
  }
  async MoveColumns(){
    await this.page
      .goto('#!/stack/${STACK_API_KEY}/content-type/test_table_app/en-us/entry/create');
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
  async MoveRows(){
    await this.page
      .goto('#!/stack/${STACK_API_KEY}/content-type/test_table_app/en-us/entry/create');
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('text=11223312311111111111222222223333333111222333111112222233333111122223333')
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('text=11111111111222222223333333112233123111222333111112222233333111122223333')
      .click();
  }
  async SortTable(){ //this only will sort ascend or descent
    await this.page
      .goto('#!/stack/${STACK_API_KEY}/content-type/test_table_app/en-us/entry/create');
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('.sc-guDLRT')
      .first()
      .click();
  }
  async DeleteTable(){
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('path:nth-child(3)')
      .first()
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('li:has-text("Delete Table")')
      .click();
  }

  async UninstallTableApp(){

    await this.page
      .goto('/#!/stacks');
  
    await this.page
      .locator('.MarketPlaceIcon > svg > path') 
      .first()
      .click();

    await expect(this.page)
      .toHaveURL('/#!/marketplace');
  
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
      .locator('text=E2E TableApp testsEcosystem DevApr 19, 2023 07:57 AM >> [data-test-id="cs-Icon"]')
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
}

/* 

  INSERT ROWS

  //here need to verify the locator to avoid any error.
  async InsertRowAbove(){
    
    await page
    .goto('/#!/stack/${STACK_API_KEY}/content-type/tabletest/en-us/entry/create');
  
    await page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('div[role="button"]:has-text("1122Insert Row AboveInsert Row BelowDelete RowInsert Column RightInsert Column L")')
      .click();

  }

  

*/