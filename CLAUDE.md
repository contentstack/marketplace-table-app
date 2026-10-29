## Developer Ecosystem workflow (read first)

This repo belongs to a Developer Ecosystem pod (DevEx: MCP, CLI, SDK, Starters including the SAP connector; Marketplace; Mkt Apps; Developer Hub).
New features and changes go through the deveco workflow before any code is written here:

1. Find the work's DSCDX idea and where it is in the flow. No idea yet: write one with the `brief` skill in `contentstack/product-wiki`.
2. The PRD, TRD, test cases, tickets and code come from your own routines (PM, Architect, QA agent, Dev), gate by gate. Do not plan, draft or build them in this session. No routine for a step yet: set it up with the `deveco-aisdlc-onboarding` skill in `contentstack/agent-skills`.
3. The order, gates and intake: https://github.com/contentstack/agent-skills/blob/main/skills/deveco-aisdlc-onboarding/references/run-protocol.md

Bug fixes and support cases keep this repo's usual path. Not sure which applies? Ask before building.

## This repo

Table: a Marketplace custom field (Tier 1, UI-only) built on `react-table`. It saves `{ tableState: { columns, data, ... } }` via `location.CustomField.field.setData` and reads it back with `getData`; the manifest path is `/field-extension` (json). Contentstack stores only 10 KB of JSON per custom field and this app does not check the size. Wiki: `marketplace-apps/table/` in `contentstack/product-wiki` if present.

| Task             | Command (Node >=22, `.nvmrc` = 22)                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| Install          | `npm ci`                                                                                                 |
| Run locally      | `npm start` (http://localhost:3000; the field only renders inside Contentstack, at `/#/field-extension`) |
| Lint / typecheck | `npm run lint` · `npm run typecheck`                                                                     |
| Unit tests       | `npm test` · `npm run test:coverage` (fails under 90%)                                                   |
| Build            | `npm run build` (output `build/`, git-ignored)                                                           |

- Routing is hybrid: `HashRouter` when the URL starts with `#/`, else `BrowserRouter` (decided once at load in `src/routes/App`); both serve `/field-extension`.
- Tests are Vitest specs next to the code (`*.spec.tsx`). Expected values come from the spec, not from running the code. Skipped tests carry a `// BUG:` comment.
- The in-repo Playwright suite (`tests/e2e/`) needs the `.env.sample` variables and a Contentstack account; it is not part of CI.
- Branches `claude/<type>/<KEY>-<slug>`, conventional commits (commitlint), PRs into `main`.
