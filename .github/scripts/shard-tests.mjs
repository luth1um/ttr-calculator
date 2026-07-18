/**
 * Round-robin test sharding for Playwright.
 *
 * Playwright's built-in --shard splits tests into contiguous chunks by count,
 * which can cause imbalance when slow tests cluster together in the sort order.
 * This script redistributes tests using round-robin so that consecutive tests
 * (which tend to live in the same file and have similar durations) are spread
 * evenly across shards.
 *
 * Usage:
 *   SHARD_INDEX=<1-based> SHARD_TOTAL=<n> node .github/scripts/shard-tests.mjs
 *
 * Output:
 *   Writes a newline-separated list of "file:line" selectors for this shard's
 *   tests to shard-selection.txt. If no tests are assigned to this shard, the
 *   file is written as empty.
 *
 * The caller should then run:
 *   xargs < shard-selection.txt npx playwright test
 */

import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SELECTION_FILE = "shard-selection.txt";

// ---------------------------------------------------------------------------
// 1. Validate env vars
// ---------------------------------------------------------------------------

const shardIndex = parseInt(process.env.SHARD_INDEX ?? "", 10);
const shardTotal = parseInt(process.env.SHARD_TOTAL ?? "", 10);

if (
  !Number.isInteger(shardIndex) ||
  !Number.isInteger(shardTotal) ||
  shardIndex < 1 ||
  shardTotal < 1 ||
  shardIndex > shardTotal
) {
  console.error(
    "Error: SHARD_INDEX (1-based) and SHARD_TOTAL must be positive integers with SHARD_INDEX <= SHARD_TOTAL.",
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 2. List all tests via Playwright
// ---------------------------------------------------------------------------

console.log(`Listing all tests...`);

let rawOutput;
try {
  rawOutput = execSync("npx playwright test --list --reporter=json", {
    encoding: "utf8",
    // Playwright prints status messages to stderr and JSON to stdout.
    stdio: ["ignore", "pipe", "inherit"],
  });
} catch (err) {
  // execSync throws when the exit code is non-zero. Playwright may exit 1 when
  // tests are listed but some are skipped/annotated; capture stdout regardless.
  rawOutput = err.stdout ?? "";
  if (!rawOutput) {
    console.error("Failed to list tests:", err.message);
    process.exit(1);
  }
}

let listResult;
try {
  listResult = JSON.parse(rawOutput);
} catch {
  console.error("Failed to parse JSON output from `playwright test --list`.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 3. Flatten suites into unique (file, line, column) specs
// ---------------------------------------------------------------------------

/**
 * Recursively walk the suite tree and collect all leaf specs.
 * Each spec has: { file, line, column, id, title }
 *
 * @param {object} suite
 * @param {Array}  acc
 */
function collectSpecs(suite, acc) {
  if (suite.specs) {
    for (const spec of suite.specs) {
      acc.push({
        file: spec.file,
        line: spec.line,
        column: spec.column,
        id: spec.id,
        title: spec.title,
      });
    }
  }
  if (suite.suites) {
    for (const child of suite.suites) {
      collectSpecs(child, acc);
    }
  }
}

const allSpecs = [];
for (const suite of listResult.suites ?? []) {
  collectSpecs(suite, allSpecs);
}

if (allSpecs.length === 0) {
  console.warn("No tests found. Writing empty selection file.");
  writeFileSync(SELECTION_FILE, "", "utf8");
  process.exit(0);
}

// ---------------------------------------------------------------------------
// 4. Deduplicate by (file, line, column) — the same spec appears once per
//    project in the JSON output but we want to run it for all projects at once.
// ---------------------------------------------------------------------------

const seen = new Set();
const uniqueSpecs = [];
for (const spec of allSpecs) {
  const key = `${spec.file}:${spec.line}:${spec.column}`;
  if (!seen.has(key)) {
    seen.add(key);
    uniqueSpecs.push(spec);
  }
}

// ---------------------------------------------------------------------------
// 5. Sort deterministically so every shard agrees on the ordering.
//    Primary: file path, Secondary: line, Tertiary: column.
// ---------------------------------------------------------------------------

uniqueSpecs.sort((a, b) => {
  if (a.file < b.file) return -1;
  if (a.file > b.file) return 1;
  if (a.line !== b.line) return a.line - b.line;
  return a.column - b.column;
});

// ---------------------------------------------------------------------------
// 6. Round-robin assignment: spec at index i goes to shard (i % shardTotal)+1
// ---------------------------------------------------------------------------

const mySpecs = uniqueSpecs.filter((_, i) => i % shardTotal === shardIndex - 1);

console.log(`Shard ${shardIndex}/${shardTotal}: assigned ${mySpecs.length} of ${uniqueSpecs.length} unique specs.`);

// ---------------------------------------------------------------------------
// 7. Write selection file
// ---------------------------------------------------------------------------

const rootDir = resolve(listResult.config?.rootDir ?? "e2e");

const lines = mySpecs.map((spec) => {
  // spec.file is relative to rootDir in the JSON output.
  return `${resolve(rootDir, spec.file)}:${spec.line}`;
});

writeFileSync(SELECTION_FILE, lines.join("\n"), "utf8");

if (lines.length > 0) {
  console.log(`Written ${lines.length} selectors to ${SELECTION_FILE}. First few:`);
  console.log(lines.slice(0, 5).join("\n"));
  if (lines.length > 5) {
    console.log(`... and ${lines.length - 5} more.`);
  }
} else {
  console.log(`No tests assigned to shard ${shardIndex}. ${SELECTION_FILE} is empty.`);
}
