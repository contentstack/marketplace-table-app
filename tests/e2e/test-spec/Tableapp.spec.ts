import { expect, test } from "@playwright/test";
import { TableApp } from "../pages/tableapp";

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

    test("Should delete the table", async () => {
        await tableapp.DeleteTable();
    });
});