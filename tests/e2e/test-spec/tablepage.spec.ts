import { expect, test } from "@playwright/test";
import { TableApp } from "../pages/Tabblepage";


test.describe.serial(" Table App at entry", () => {

    let tableapp;

    test.use({ storageState: "storageState.json" });

    test("Should make all the test cases of the Table App", async ({page}) => {
        tableapp = new TableApp(page);
        await tableapp.installTableApp();
        await tableapp.createTableApp();
        await tableapp.importCsv();
        await tableapp.searchonTable();
        await tableapp.enterFullscreen();
        await tableapp.insertRowAbove();
        await tableapp.insertRowBelow();
        await tableapp.deleteRow();
        await tableapp.insertColumnRight();
        await tableapp.insertColumnLeft();
        await tableapp.deleteColumn();
        await tableapp.exportCsv();
        await tableapp.makeHeaderRow();
        await tableapp.makeHeaderColumn();
        await tableapp.sortTable();
        await tableapp.deleteTable();
        await tableapp.uninstallTableApp();
    });
    

});
