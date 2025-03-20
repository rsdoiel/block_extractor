// block_extractor_test.ts tests for block_extractor.ts
//
// @author R. S. Doiel
// copyright © 2025 All Rights Reserved
// See <https://opensource.org/license/BSD-3-Clause> for license information. 

import { extractCodeBlocks } from "./block_extractor.ts";
import { assert } from "@std/assert";

Deno.test("extractCodeBlocks - all blocks", () => {
  const content = "```typescript\ncode block 1\n```\ntext\n```python\ncode block 2\n```";
  const result = extractCodeBlocks(content);
  const expected = "code block 1\n\ncode block 2";
  assert(result === expected);
});

Deno.test("extractCodeBlocks - specific block", () => {
  const content = "```typescript\ncode block 1\n```\ntext\n```python\ncode block 2\n```";
  const result = extractCodeBlocks(content, 1);
  const expected = "code block 2";
  assert(result === expected);
});

Deno.test("extractCodeBlocks - invalid block index", () => {
  const content = "```typescript\ncode block 1\n```\ntext\n```python\ncode block 2\n```";
  const result = extractCodeBlocks(content, 2);
  const expected = "";
  assert(result === expected);
});

Deno.test("extractCodeBlocks - no code blocks", () => {
  const content = "text without code blocks";
  const result = extractCodeBlocks(content);
  const expected = "";
  assert(result === expected);
});

Deno.test("extractCodeBlocks - empty content", () => {
  const content = "";
  const result = extractCodeBlocks(content);
  const expected = "";
  assert(result === expected);
});
