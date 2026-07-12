import DOMPurify from "dompurify";

function safePopperAttributes(attrs: Record<string, string> | undefined): Record<string, string> {
  if (!attrs) return {};
  const allowedKeys = ["data-popper-placement", "data-popper-reference-hidden", "data-popper-escaped"];
  return Object.fromEntries(Object.entries(attrs).filter(([key]) => allowedKeys.includes(key)));
}

// Escapes HTML so a raw string is displayed as literal text (tags visible)
// instead of being interpreted as markup. Only &, < and > are escaped — this
// matches how the browser serializes a contenteditable text node's innerHTML,
// which keeps the caret stable while typing. Rendering the result is XSS-safe
// because the value is never interpreted as markup.
function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object" || Array.isArray(value) || Number.isNaN(value)) return "";
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Strips all HTML and returns plain text. Used for fields (e.g. column headers)
// that are intentionally plain text — safer than a naive tag-stripping regex.
function stripHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object" || Array.isArray(value) || Number.isNaN(value)) return "";
  const stringValue = String(value);
  return DOMPurify.sanitize(stringValue, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

function makeData(count) {
  let data: any = [];

  for (let i = 0; i < count; i++) {
    let row = {
      column1: "",
      column2: "",
      column3: "",
    };

    data.push(row);
  }

  let columns = [
    {
      id: "column1",
      accessor: "column1",
      dataType: "text",
    },
    {
      id: "column2",
      accessor: "column2",
      dataType: "text",
    },
    {
      id: "column3",
      accessor: "column3",
      dataType: "text",
    },
  ];

  return { columns: columns, data: data, skipReset: false };
}

function shortId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

function randomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 95%, 90%)`;
}

const utils = {
  makeData,
  shortId,
  randomColor,
  escapeHtml,
  stripHtml,
  safePopperAttributes,
};

export const eventNames = Object.freeze({
  USED_IMPORT_CSV: "Clicked",
  IMPORT_RADIO_OPTIONS: "Clicked",
  EXPORT_OPTION: "Clicked",
  ADD_TABLE: "Clicked",
  DELETE_TABLE: "Clicked",
  SEARCH_RECORDS: "Viewed",
  FULLSCREEN_MODE: "Viewed",
  APP_INITIALIZE_SUCCESS: "App Loaded Successfully",
  APP_INITIALIZE_FAILURE: "App Load Failure",
});

export default utils;
