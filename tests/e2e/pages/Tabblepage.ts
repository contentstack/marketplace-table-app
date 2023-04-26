import { expect, Locator, Page, Frame, FileChooser } from '@playwright/test';
import { elements } from '../elements/Tabbleapppage.elements';

let stackURL = process.env.STACK_URL

export class TableApp {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async installTableApp(){
    
    await this.page
      .goto(`/#!/stacks`);
    
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
      .toHaveURL(`/#!/apps/${stackURL}/install`);
  
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
      .goto(`/#!/stack/${stackURL}/content-type/tabletest/en-us/entry/create`);

    await this.page
    .frameLocator('[data-testid="app-extension-frame"]')
    .locator('[data-test-id="cs-button"]')
    .click();

  }

  async Importcsv(){
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('.importCSV')
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('label:has-text("Replace Data")')
      .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator('button:has-text("Import Table")')
      .click()
    await this.page
      .on("filechooser", (fileChooser: FileChooser) => {
        fileChooser.setFiles(["tests/e2e/downloads/demo_spreadsheet_table_app.csv"]);
      })
      
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
      .fill(`${elements.searchExample}`);
  }
  async Enterfullscreen(){
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
   // await this.page
     // .frameLocator('[data-testid="app-extension-frame"]')
     // .locator(elements.cellHeaderLocator)
     // .click();
   // await this.page
     // .frameLocator('[data-testid="app-extension-frame"]')
     // .locator(elements.headerDropdownbutton)
     // .click();
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.setHeaderColumnLocator)
      .first()
      .click();
  }


  async MoveColumns(){
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
      const locatorToDrag = this.page.locator(elements.oroginDragnDrop);
      const locatorDragTarget = this.page.locator(elements.destinyDragnDrop);
      const toDragBox = await locatorToDrag.boundingBox();
      const dragTargetBox = await locatorDragTarget.boundingBox();

      await this.page.mouse.move(
          toDragBox!.x + toDragBox!.width / 2,
          toDragBox!.y + toDragBox!.height / 2
      );
      await this.page.mouse.down();
      await this.page.mouse.move(
          dragTargetBox!.x + dragTargetBox!.width / 2,
          dragTargetBox!.y + dragTargetBox!.height / 2
      );
      await this.page.mouse.up();

  }


  async SortTable(){ //this only will sort ascend or descent
   /* await this.page
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
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.headerDropdownbutton)
      .click();*/
    await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.sortHeaderCell)
      .click();
      await this.page
      .frameLocator('[data-testid="app-extension-frame"]')
      .locator(elements.sortHeaderCell)
      .click();
  }
  async DeleteTable(){
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
  }

  async uninstallTableApp(){

    //await this.page
    //  .goto('/#!/stacks');
  
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
  

