# unpaginate

Aggregate items from paginated web pages into **JSON** and a single **HTML** report. Configuration is a small JSON file: a CSS selector for each result row, a pagination strategy, and optional field extraction rules.

**Legal note:** This tool drives a real browser. You are responsible for complying with each site’s terms of service, `robots.txt`, and applicable law.

## Requirements

- Node.js 20+
- After `npm install`, install a browser for Playwright:

```bash
npx playwright install chromium
```

## Install

From this directory:

```bash
npm install
npm run build
```

## Usage

```bash
unpaginate run --config ./my.config.json [--out-dir ./out] [--headed] [--storage-state ./auth.json]
```

To add **`itemNumber`** (1, 2, 3, …) to older exports in a folder and refresh their HTML reports:

```bash
unpaginate backfill-item-numbers [--out-dir ./out]
```

- **`--config`**: Path to a JSON config file (see below).
- **`--out-dir`**: Where to write output files (default: `./out`).
- **`--fixed-names`**: Write `results.json` and `report.html` instead of datetime-stamped names.
- **`--headed`**: Run Chromium with a visible window (helpful for debugging selectors).
- **`--storage-state`**: Path to a Playwright storage state file (cookies/session) saved after logging in once.

Outputs (by default, both files share one local timestamp, e.g. `results-2025-03-24T17-05-30.json` and `report-2025-03-24T17-05-30.html`):

- **`results-….json`**: `{ "meta": { "stoppedReason", "generatedAt", "count" }, "results": [ ... ] }`. Each row includes **`itemNumber`** (1-based) for the full run.
- **`report-….html`**: Interactive grid ([Tabulator](https://tabulator.info/) via CDN): sort, per-column filter, column reorder, pagination; image URLs in cells render as thumbnails where detected. Raw JSON remains in `<script type="application/json" id="unpaginate-data">` (requires network for CDN scripts).

## Config

| Field | Description |
| --- | --- |
| `startUrl` | First page URL. |
| `itemSelector` | CSS selector matching each result on the page. |
| `extract` | Optional map of field names to rules. If omitted, each item stores `html` and `text`. |
| `pagination` | How to reach the next page (see below). |
| `maxPages` | Maximum number of pages to load (default: 10000). |
| `maxItems` | Maximum number of items to collect. |
| `delayMs` | Pause after each navigation (milliseconds). |
| `emptyPagesBeforeStop` | Stop after this many consecutive pages with zero matching items (default: 1). |
| `dedupeBy` | Optional `href` or `htmlHash` to skip duplicates. |
| `navigationTimeoutMs` | Navigation timeout (default: 60000). |
| `waitForItemTimeoutMs` | How long to wait for `itemSelector` on each page (default: 30000). |

### Extract rules

- **String**: A CSS selector; the field is the element’s **text**.
- **Object**: `{ "selector": "...", "type": "text" \| "html" \| "attr", "attr": "href" }` (for `attr`, `attr` is required).

### Pagination

- **`nextLink`**: `{ "type": "nextLink", "selector": "...", "disabledSelector": "..." }` — finds the control; if it is an `<a href="...">`, follows the URL; otherwise clicks and waits for navigation. Optional `disabledSelector` marks a disabled “next” state.
- **`paramIncrement`**: `{ "type": "paramIncrement", "param": "page", "start": 1, "step": 1 }` — builds the next URL by incrementing a query parameter. If the current page’s HTML fingerprint matches the previous page, the run stops (duplicate content).
- **`urlTemplate`**: `{ "type": "urlTemplate", "template": "https://example.com/list?page={page}", "startPage": 1, "step": 1 }` — after the first page (`startUrl`), loads `template` with `{page}` replaced by `startPage + step`, `startPage + 2*step`, …

## Authentication (storage state)

Sites such as Audible often require a signed-in session.

1. Log in manually and save storage state (one-time):

```bash
npx playwright codegen https://www.audible.com --save-storage=auth.json
```

Complete sign-in in the opened window, then close it so the file is written.

2. Run unpaginate with:

```bash
unpaginate run --config ./examples/audible-sample.config.json --storage-state ./auth.json
```

Replace selectors in the example config with ones that match the live DOM (use DevTools or `--headed`).

## Example config

See [examples/audible-sample.config.json](examples/audible-sample.config.json) for a placeholder Audible-oriented configuration. Selectors must be updated for the current page structure.

## Development

```bash
npm install
npx playwright install chromium
npm run build
npm test
```

## Programmatic API

```ts
import { runUnpaginate, writeOutputs } from "unpaginate";

const { results, stoppedReason } = await runUnpaginate(config, {
  storageStatePath: "./auth.json"
});
await writeOutputs("./out", results, { stoppedReason });
// Optional: `fixedNames: true` → results.json / report.html; or set `fileStamp` to reuse a suffix.
```
