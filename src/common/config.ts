export const ENABLE_TOOLTIP = import.meta.env.VITE_ENABLE_TOOLTIP === "true";
// ENABLE_SORTABLE controls per-column renderer-sortable flag UI in the CMS editor.
// This is a renderer-level flag (shown on the published page), NOT authoring-time sort.
// Default OFF — set VITE_ENABLE_SORTABLE=true to enable.
export const ENABLE_SORTABLE = import.meta.env.VITE_ENABLE_SORTABLE === "true";
