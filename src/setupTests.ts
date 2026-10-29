import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  // modals (cbModal) mount outside the tree RTL cleans up
  document.body.innerHTML = "";
});
