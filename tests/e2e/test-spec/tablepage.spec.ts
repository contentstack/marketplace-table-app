import { expect, test } from "@playwright/test";
import { TableApp } from "../pages/Tabblepage";

test.describe.serial(" Table App at entry", () => {
    let tableapp: TableApp;

    test("Should install the app on a stack", async () => {
        await tableapp.installTableApp();
    });

    test("Should create a new Table on entry", async () => {
        await tableapp.createTableApp();
    });
    test("Should import a csv file", async () => {
        await tableapp.Importcsv();
    });
    test("Should allow to search data inside the table", async () => {
        await tableapp.SearchonTable();
    });
    test("Should start the full screen mode", async () => {
        await tableapp.Enterfullscreen();
    });
    test("Should export the table into a csv file", async () => {
        await tableapp.Exportcsv();
    });
    test("Should put a row as a header of the table", async () => {
        await tableapp.makeHeaderRow();
    });
    test("Should put a Column as a header of the table", async () => {
        await tableapp.makeHeaderColumn();
    });
    test("Should sort the table rows order ascedent or descendent", async () => {
        await tableapp.SortTable();
    });

    test("Should add a row above the current row", async () => {
        await tableapp.insertRowAbove();
    });
    test("Should add a row below the current row", async () => {
        await tableapp.insertRowBelow();
    });
    test("Should delete the whole row", async () => {
        await tableapp.deleteRow();
    });
    test("Should add a column on the rightside of the current column", async () => {
        await tableapp.insertColumnRight();
    });
    test("Should add a column on the leftside of the current column", async () => {
        await tableapp.insertColumnLeft();
    });
    test("Should delete the whole column", async () => {
        await tableapp.deleteColumn();
    });
    test("Should delete the table", async () => {
        await tableapp.DeleteTable();
    });

    test("Should uninstall the app on a stack", async () => {
        await tableapp.uninstallTableApp();
    });
});
