import { test, expect, Locator, Page, Frame } from '@playwright/test';

const link='https://dev11-app.csnonprod.com/#!/stack/blt8a1457fb5811b7f0/content-type/test_table_app/en-us/entry/create'

export class TableApp {
  
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }


  async createTableApp() {
    await this.page
    .frameLocator('[data-testid="app-extension-frame"]')
    .locator('[data-test-id="cs-button"]')
    .click();
  }

  async Importcsv(){
    await this.page
    .goto(link);
  
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
      .goto(link);
    
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
      .goto(link);
  
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
      .goto(link);
    
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
      .goto(link);
  
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

}







