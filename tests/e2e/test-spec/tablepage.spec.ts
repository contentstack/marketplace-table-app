import { expect, test } from "@playwright/test";
import { TableApp } from "../pages/Tabblepage";

test.describe.serial(" Table App at entry", () => {
    let tableapp: TableApp;
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
    test("Should delete the table", async () => {
        await tableapp.DeleteTable();
    });
});
