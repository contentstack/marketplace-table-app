import { expect, test } from "@playwright/test";
import { TableApp } from "../pages/Tabblepage";


test.describe.serial(" Table App at entry", () => {

    let tableapp;

    test.use({ storageState: "storageState.json" });

    test.beforeEach( async ({page}) => {
        tableapp = new TableApp(page);
        await tableapp.createTableApp();
    });

    test("Should import a csv file", async ({page}) => {
        await tableapp.Importcsv();
    });
    
    test("Should allow to search data inside the table", async ({page}) => {
        await tableapp.SearchonTable();
    });
    test("Should start the full screen mode", async ({page}) => {
        await tableapp.Enterfullscreen();
    });

    test("Should make all the actions possible in the rows and columns", async ({page}) => {
        await tableapp.insertRowAbove();
        await tableapp.insertRowBelow();
        await tableapp.deleteRow();
        await tableapp.insertColumnRight();
        await tableapp.insertColumnLeft();
        await tableapp.deleteColumn();
    });
    
    test("Should export the table into a csv file", async ({page}) => {
        await tableapp.Exportcsv();
    });
    test("Should put a row as a header of the table", async ({page}) => {
        await tableapp.makeHeaderRow();
    });
    test("Should put a Column as a header of the table", async ({page}) => {
        await tableapp.makeHeaderColumn();
    });
    test("Should sort the table rows order ascedent or descendent", async ({page}) => {
        await tableapp.SortTable();
    });

    test("Should delete the table", async ({page}) => {
        await tableapp.DeleteTable();
    });

});
