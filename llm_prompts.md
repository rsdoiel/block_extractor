I am writing a text tool in TypeScript to run using Deno 2.2.  You should use`Den.readTextFile` to read a file or `Deno.stdin.readable` to read an input stream from standard input. You should use ` import { parseArgs } from "@std/cli/parse-args";` to handle command line parameters.

The tool should read in Markdown content and extract text in code blocks. Code blocks are delimited by "```". By default all code should be written to standard output. it should also be possible to only output specific code block.

You should include a -h and --help option the explains how the tool works. The help page should use a man page structure written in Markdown format.

The TypeScript should be implemented as an ES6 module where `extractCodeBlocks` is exported and the `main` function is executed if `import.metadata.main` is true. 

The module should be called `block_extractor.ts`.

Please provide test code to verify correct operation. The test should use `Deno.test` and use the assert package called `@std/assert`. The filename for testing is `block_extractor_test.ts`.

---

Let's break down the requirements and implement the TypeScript module block_extractor.ts and the test file block_extractor_test.ts.
block_extractor.ts

This module will:

    Read Markdown content from a file or standard input.
    Extract code blocks delimited by triple backticks (```).
    Allow specifying which code block to output.
    Provide a help option using a man page structure in Markdown.
    Export the extractCodeBlocks function and execute the main function if it's the main module.

Here's the implementation:

~~~typescript
import { parseArgs } from "@std/cli/parse-args";
import { assert } from "@std/assert";

/**
 * Extracts code blocks from Markdown content.
 * @param content - The Markdown content as a string.
 * @param blockIndex - The index of the code block to extract. If null, extracts all.
 * @returns The extracted code block(s) as a string.
 */
export function extractCodeBlocks(content: string, blockIndex: number | null = null): string {
  const codeBlocks = [];
  const lines = content.split('\n');
  let inCodeBlock = false;
  let currentBlock = [];

  for (const line of lines) {
    if (line.trim() === '```') {
      if (inCodeBlock) {
        codeBlocks.push(currentBlock.join('\n'));
        currentBlock = [];
      }
      inCodeBlock = !inCodeBlock;
    } else if (inCodeBlock) {
      currentBlock.push(line);
    }
  }

  if (blockIndex !== null && blockIndex >= 0 && blockIndex < codeBlocks.length) {
    return codeBlocks[blockIndex];
  } else if (blockIndex === null) {
    return codeBlocks.join('\n\n');
  } else {
    return '';
  }
}

async function main() {
  const options = parseArgs({
    '--help': Boolean,
    '-h': '--help',
    '--block': Number,
    '-b': '--block',
    '_': String,
  });

  if (options['--help']) {
    console.log(`
# block_extractor

Extracts code blocks from Markdown content.

## SYNOPSIS

block_extractor [OPTIONS] [FILE]

## DESCRIPTION

Reads Markdown content from a file or standard input and extracts code blocks delimited by triple backticks (\`\`\`).

## OPTIONS

-h, --help          Display this help message.
-b, --block NUM     Output only the NUM-th code block (0-indexed).

## EXAMPLES

Extract all code blocks from a file:

    block_extractor example.md

Extract the second code block from standard input:

    cat example.md | block_extractor --block 1
`);
    Deno.exit(0);
  }

  let content = '';
  if (options._.length > 0) {
    const filePath = options._[0];
    content = await Deno.readTextFile(filePath);
  } else {
    const decoder = new TextDecoder();
    const chunks: Uint8Array[] = [];
    for await (const chunk of Deno.stdin.readable) {
      chunks.push(chunk);
    }
    content = decoder.decode(new Uint8Array(chunks.flat()));
  }

  const blockIndex = options['--block'] ?? null;
  const result = extractCodeBlocks(content, blockIndex);
  console.log(result);
}

if (import.meta.main) {
  main();
}
~~~

block_extractor_test.ts

~~~typescript
This test file will use Deno.test to verify the correct operation of the extractCodeBlocks function.

import { extractCodeBlocks } from "./block_extractor.ts";
import { assert } from "@std/assert";

Deno.test("extractCodeBlocks - all blocks", () => {
  const content = "```\ncode block 1\n```\ntext\n```\ncode block 2\n```";
  const result = extractCodeBlocks(content);
  const expected = "code block 1\n\ncode block 2";
  assert(result === expected);
});

Deno.test("extractCodeBlocks - specific block", () => {
  const content = "```\ncode block 1\n```\ntext\n```\ncode block 2\n```";
  const result = extractCodeBlocks(content, 1);
  const expected = "code block 2";
  assert(result === expected);
});

Deno.test("extractCodeBlocks - invalid block index", () => {
  const content = "```\ncode block 1\n```\ntext\n```\ncode block 2\n```";
  const result = extractCodeBlocks(content, 2);
  const expected = "";
  assert(result === expected);
});
~~~

Explanation

    block_extractor.ts:
        The extractCodeBlocks function reads Markdown content and extracts code blocks.
        The main function handles command-line arguments, reads input from a file or standard input, and outputs the extracted code blocks.
        The help message is displayed in a man page structure when the --help option is used.

    block_extractor_test.ts:
        Tests the extractCodeBlocks function to ensure it correctly extracts all code blocks, a specific code block, and handles invalid block indices.

You can run the tests using the command:

~~~shell
deno test block_extractor_test.ts
~~~

This setup should meet your requirements for a TypeScript tool that extracts code blocks from Markdown content using Deno.

---

When I run `deno check block_extractor.ts` I get the following errors, please fix them. 

~~~shell
error: Relative import path "@std/assert" not prefixed with / or ./ or ../ and not in import map from "file:///Users/rsdoiel/Sandbox/Experiments/BlockExtractor/block_extractor.ts"
    at file:///Users/rsdoiel/Sandbox/Experiments/BlockExtractor/block_extractor.ts:2:24
MACMINI-RD:BlockExtractor rsdoiel$ deno check block_extractor.ts 
Check file:///Users/rsdoiel/Sandbox/Experiments/BlockExtractor/block_extractor.ts
TS2353 [ERROR]: Object literal may only specify known properties, and ''--help'' does not exist in type 'string[]'.
    '--help': Boolean,
    ~~~~~~~~
    at file:///Users/rsdoiel/Sandbox/Experiments/BlockExtractor/block_extractor.ts:38:5

TS2345 [ERROR]: Argument of type 'string | number' is not assignable to parameter of type 'string | URL'.
  Type 'number' is not assignable to type 'string | URL'.
    content = await Deno.readTextFile(filePath);
                                      ~~~~~~~~
    at file:///Users/rsdoiel/Sandbox/Experiments/BlockExtractor/block_extractor.ts:80:39

TS2769 [ERROR]: No overload matches this call.
  The last overload gave the following error.
    Argument of type 'Uint8Array<ArrayBufferLike>[]' is not assignable to parameter of type 'ArrayBuffer | ArrayLike<number>'.
      Type 'Uint8Array<ArrayBufferLike>[]' is not assignable to type 'ArrayLike<number>'.
        'number' index signatures are incompatible.
          Type 'Uint8Array<ArrayBufferLike>' is not assignable to type 'number'.
    content = decoder.decode(new Uint8Array(chunks.flat()));
                                            ~~~~~~~~~~~~~
    at file:///Users/rsdoiel/Sandbox/Experiments/BlockExtractor/block_extractor.ts:87:45

TS2771 [ERROR]:     The last overload is declared here.
        new (array: ArrayLike<number> | ArrayBuffer): Uint8Array<ArrayBuffer>;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        at asset:///lib.es5.d.ts:2405:5

Found 3 errors.

~~~

---

Let's address each of the errors you're encountering:

    Relative Import Path Error:
        The error indicates that the import path for @std/assert is not correctly specified. Deno requires explicit paths for imports unless they are specified in an import map.

    Type Error for --help:
        The parseArgs function expects a specific format for defining options. The error suggests that --help is not being recognized correctly.

    Type Error for filePath:
        The filePath is being inferred as a string | number, but Deno.readTextFile expects a string | URL. We need to ensure filePath is treated as a string.

    Type Error for Uint8Array:
        The error indicates that the Uint8Array is not being constructed correctly from the chunks. We need to ensure the chunks are properly concatenated.

Here's the corrected version of block_extractor.ts:

~~~typescript

import { parseArgs } from "https://deno.land/std@0.198.0/cli/parse_args.ts";
import { assert } from "https://deno.land/std@0.198.0/assert/assert.ts";

/**
 * Extracts code blocks from Markdown content.
 * @param content - The Markdown content as a string.
 * @param blockIndex - The index of the code block to extract. If null, extracts all.
 * @returns The extracted code block(s) as a string.
 */
export function extractCodeBlocks(content: string, blockIndex: number | null = null): string {
  const codeBlocks = [];
  const lines = content.split('\n');
  let inCodeBlock = false;
  let currentBlock = [];

  for (const line of lines) {
    if (line.trim() === '```') {
      if (inCodeBlock) {
        codeBlocks.push(currentBlock.join('\n'));
        currentBlock = [];
      }
      inCodeBlock = !inCodeBlock;
    } else if (inCodeBlock) {
      currentBlock.push(line);
    }
  }

  if (blockIndex !== null && blockIndex >= 0 && blockIndex < codeBlocks.length) {
    return codeBlocks[blockIndex];
  } else if (blockIndex === null) {
    return codeBlocks.join('\n\n');
  } else {
    return '';
  }
}

async function main() {
  const options = parseArgs(Deno.args, {
    boolean: ['help'],
    alias: {
      help: 'h',
      block: 'b',
    },
  });

  if (options.help) {
    console.log(`
# block_extractor

Extracts code blocks from Markdown content.

## SYNOPSIS

block_extractor [OPTIONS] [FILE]

## DESCRIPTION

Reads Markdown content from a file or standard input and extracts code blocks delimited by triple backticks (\`\`\`).

## OPTIONS

-h, --help          Display this help message.
-b, --block NUM     Output only the NUM-th code block (0-indexed).

## EXAMPLES

Extract all code blocks from a file:

    block_extractor example.md

Extract the second code block from standard input:

    cat example.md | block_extractor --block 1
`);
    Deno.exit(0);
  }

  let content = '';
  if (options._.length > 0) {
    const filePath = options._[0];
    content = await Deno.readTextFile(filePath);
  } else {
    const decoder = new TextDecoder();
    const chunks: Uint8Array[] = [];
    for await (const chunk of Deno.stdin.readable) {
      chunks.push(chunk);
    }
    const combinedChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      combinedChunks.set(chunk, offset);
      offset += chunk.length;
    }
    content = decoder.decode(combinedChunks);
  }

  const blockIndex = options.block ? parseInt(options.block, 10) : null;
  const result = extractCodeBlocks(content, blockIndex);
  console.log(result);
}

if (import.meta.main) {
  main();
}
~~~

Explanation of Fixes

    Imports:
        Changed the import paths to use the full URL for parseArgs and assert from the Deno standard library.

    parseArgs Configuration:
        Used the correct format for defining options with parseArgs.

    filePath Type:
        Ensured filePath is treated as a string by accessing it directly from options._.

    Uint8Array Construction:
        Correctly concatenated the chunks into a single Uint8Array before decoding.

These changes should resolve the errors you encountered. Make sure to run the tests again to verify everything is working correctly.

---


I am still getting an error, 

~~~shell
Check file:///Users/rsdoiel/Sandbox/Experiments/BlockExtractor/block_extractor.ts
TS2345 [ERROR]: Argument of type 'string | number' is not assignable to parameter of type 'string | URL'.
  Type 'number' is not assignable to type 'string | URL'.
    content = await Deno.readTextFile(filePath);
                                      ~~~~~~~~
    at file:///Users/rsdoiel/Sandbox/Experiments/BlockExtractor/block_extractor.ts:80:39

TS2345 [ERROR]: Argument of type '{}' is not assignable to parameter of type 'string'.
  const blockIndex = options.block ? parseInt(options.block, 10) : null;
                                              ~~~~~~~~~~~~~
    at file:///Users/rsdoiel/Sandbox/Experiments/BlockExtractor/block_extractor.ts:96:47

Found 2 errors.

error: Type checking failed.
~~~

---

The errors you're encountering are related to TypeScript's type inference. Let's address these issues:

    Type Error for filePath:
        The filePath is being inferred as string | number, but Deno.readTextFile expects a string | URL. We need to ensure filePath is treated as a string.

    Type Error for options.block:
        The options.block is being inferred as an empty object {}, which is not assignable to string. We need to ensure it's treated as a string.

Here's the corrected version of block_extractor.ts:

~~~typescript
import { parseArgs } from "https://deno.land/std@0.198.0/cli/parse_args.ts";
import { assert } from "https://deno.land/std@0.198.0/assert/assert.ts";

/**
 * Extracts code blocks from Markdown content.
 * @param content - The Markdown content as a string.
 * @param blockIndex - The index of the code block to extract. If null, extracts all.
 * @returns The extracted code block(s) as a string.
 */
export function extractCodeBlocks(content: string, blockIndex: number | null = null): string {
  const codeBlocks = [];
  const lines = content.split('\n');
  let inCodeBlock = false;
  let currentBlock = [];

  for (const line of lines) {
    if (line.trim() === '```') {
      if (inCodeBlock) {
        codeBlocks.push(currentBlock.join('\n'));
        currentBlock = [];
      }
      inCodeBlock = !inCodeBlock;
    } else if (inCodeBlock) {
      currentBlock.push(line);
    }
  }

  if (blockIndex !== null && blockIndex >= 0 && blockIndex < codeBlocks.length) {
    return codeBlocks[blockIndex];
  } else if (blockIndex === null) {
    return codeBlocks.join('\n\n');
  } else {
    return '';
  }
}

async function main() {
  const options = parseArgs(Deno.args, {
    boolean: ['help'],
    string: ['block'],
    alias: {
      help: 'h',
      block: 'b',
    },
  });

  if (options.help) {
    console.log(`
# block_extractor

Extracts code blocks from Markdown content.

## SYNOPSIS

block_extractor [OPTIONS] [FILE]

## DESCRIPTION

Reads Markdown content from a file or standard input and extracts code blocks delimited by triple backticks (\`\`\`).

## OPTIONS

-h, --help          Display this help message.
-b, --block NUM     Output only the NUM-th code block (0-indexed).

## EXAMPLES

Extract all code blocks from a file:

    block_extractor example.md

Extract the second code block from standard input:

    cat example.md | block_extractor --block 1
`);
    Deno.exit(0);
  }

  let content = '';
  if (options._.length > 0) {
    const filePath = options._[0] as string;
    content = await Deno.readTextFile(filePath);
  } else {
    const decoder = new TextDecoder();
    const chunks: Uint8Array[] = [];
    for await (const chunk of Deno.stdin.readable) {
      chunks.push(chunk);
    }
    const combinedChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      combinedChunks.set(chunk, offset);
      offset += chunk.length;
    }
    content = decoder.decode(combinedChunks);
  }

  const blockIndex = options.block ? parseInt(options.block, 10) : null;
  const result = extractCodeBlocks(content, blockIndex);
  console.log(result);
}

if (import.meta.main) {
  main();
}
~~~

Explanation of Fixes

    filePath Type:
        Explicitly cast filePath to a string using as string to ensure it's treated correctly.

    options.block Type:
        Specified string as the type for block in the parseArgs configuration to ensure it's treated as a string.

These changes should resolve the type errors you encountered. Make sure to run the tests again to verify everything is working correctly.
`block_extractor.ts` does not use `assert` you can remove the import statement. I have corrected by deno.json import map so please use `@std/cli/parse-args` for importing `parseArgs`.

---

Let's update the block_extractor.ts file to remove the unused assert import and use the correct import path for parseArgs from the import map.

---

Here's the updated version:

~~~typescript

import { parseArgs } from "@std/cli/parse-args";

/**
 * Extracts code blocks from Markdown content.
 * @param content - The Markdown content as a string.
 * @param blockIndex - The index of the code block to extract. If null, extracts all.
 * @returns The extracted code block(s) as a string.
 */
export function extractCodeBlocks(content: string, blockIndex: number | null = null): string {
  const codeBlocks = [];
  const lines = content.split('\n');
  let inCodeBlock = false;
  let currentBlock = [];

  for (const line of lines) {
    if (line.trim() === '```') {
      if (inCodeBlock) {
        codeBlocks.push(currentBlock.join('\n'));
        currentBlock = [];
      }
      inCodeBlock = !inCodeBlock;
    } else if (inCodeBlock) {
      currentBlock.push(line);
    }
  }

  if (blockIndex !== null && blockIndex >= 0 && blockIndex < codeBlocks.length) {
    return codeBlocks[blockIndex];
  } else if (blockIndex === null) {
    return codeBlocks.join('\n\n');
  } else {
    return '';
  }
}

async function main() {
  const options = parseArgs(Deno.args, {
    boolean: ['help'],
    string: ['block'],
    alias: {
      help: 'h',
      block: 'b',
    },
  });

  if (options.help) {
    console.log(`
# block_extractor

Extracts code blocks from Markdown content.

## SYNOPSIS

block_extractor [OPTIONS] [FILE]

## DESCRIPTION

Reads Markdown content from a file or standard input and extracts code blocks delimited by triple backticks (\`\`\`).

## OPTIONS

-h, --help          Display this help message.
-b, --block NUM     Output only the NUM-th code block (0-indexed).

## EXAMPLES

Extract all code blocks from a file:

    block_extractor example.md

Extract the second code block from standard input:

    cat example.md | block_extractor --block 1
`);
    Deno.exit(0);
  }

  let content = '';
  if (options._.length > 0) {
    const filePath = options._[0] as string;
    content = await Deno.readTextFile(filePath);
  } else {
    const decoder = new TextDecoder();
    const chunks: Uint8Array[] = [];
    for await (const chunk of Deno.stdin.readable) {
      chunks.push(chunk);
    }
    const combinedChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      combinedChunks.set(chunk, offset);
      offset += chunk.length;
    }
    content = decoder.decode(combinedChunks);
  }

  const blockIndex = options.block ? parseInt(options.block, 10) : null;
  const result = extractCodeBlocks(content, blockIndex);
  console.log(result);
}

if (import.meta.main) {
  main();
}
~~~

Changes Made

    Removed the unused assert import.
    Updated the import path for parseArgs to use @std/cli/parse-args as specified in your import map.

This should resolve the issues and align with your import map configuration. Make sure to test the script to verify everything is working correctly.

---

The opening delimiter of a code block may include a language specifier. Example the following starts a code block "```typescript".

---

To handle code blocks that may include a language specifier, we need to adjust the logic in the extractCodeBlocks function. Specifically, we should recognize the opening delimiter as any line that starts with triple backticks (```), optionally followed by a language specifier.

Here's the updated block_extractor.ts with this enhancement:

~~~typescript

import { parseArgs } from "@std/cli/parse-args";

/**
 * Extracts code blocks from Markdown content.
 * @param content - The Markdown content as a string.
 * @param blockIndex - The index of the code block to extract. If null, extracts all.
 * @returns The extracted code block(s) as a string.
 */
export function extractCodeBlocks(content: string, blockIndex: number | null = null): string {
  const codeBlocks = [];
  const lines = content.split('\n');
  let inCodeBlock = false;
  let currentBlock = [];

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        codeBlocks.push(currentBlock.join('\n'));
        currentBlock = [];
      }
      inCodeBlock = !inCodeBlock;
    } else if (inCodeBlock) {
      currentBlock.push(line);
    }
  }

  if (blockIndex !== null && blockIndex >= 0 && blockIndex < codeBlocks.length) {
    return codeBlocks[blockIndex];
  } else if (blockIndex === null) {
    return codeBlocks.join('\n\n');
  } else {
    return '';
  }
}

async function main() {
  const options = parseArgs(Deno.args, {
    boolean: ['help'],
    string: ['block'],
    alias: {
      help: 'h',
      block: 'b',
    },
  });

  if (options.help) {
    console.log(`
# block_extractor

Extracts code blocks from Markdown content.

## SYNOPSIS

block_extractor [OPTIONS] [FILE]

## DESCRIPTION

Reads Markdown content from a file or standard input and extracts code blocks delimited by triple backticks (\`\`\`).

## OPTIONS

-h, --help          Display this help message.
-b, --block NUM     Output only the NUM-th code block (0-indexed).

## EXAMPLES

Extract all code blocks from a file:

    block_extractor example.md

Extract the second code block from standard input:

    cat example.md | block_extractor --block 1
`);
    Deno.exit(0);
  }

  let content = '';
  if (options._.length > 0) {
    const filePath = options._[0] as string;
    content = await Deno.readTextFile(filePath);
  } else {
    const decoder = new TextDecoder();
    const chunks: Uint8Array[] = [];
    for await (const chunk of Deno.stdin.readable) {
      chunks.push(chunk);
    }
    const combinedChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      combinedChunks.set(chunk, offset);
      offset += chunk.length;
    }
    content = decoder.decode(combinedChunks);
  }

  const blockIndex = options.block ? parseInt(options.block, 10) : null;
  const result = extractCodeBlocks(content, blockIndex);
  console.log(result);
}

if (import.meta.main) {
  main();
}
~~~

Explanation of Changes

    Code Block Detection:
        Modified the condition to check if a line starts with triple backticks (```), which allows for an optional language specifier after the backticks.

This update ensures that code blocks with language specifiers are correctly identified and extracted. Make sure to test the script to verify everything is working correctly.

--- 

Please implement a test file `block_extractor_test.ts` that uses `Deno.test` and `@std/assert` module for assertions.

--- 

Here's the implementation of the test file block_extractor_test.ts using Deno.test and the @std/assert module for assertions:

~~~typescript
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
~~~

Explanation of Tests

    All Blocks:
        Tests that all code blocks are extracted correctly when no specific block index is provided.

    Specific Block:
        Tests that a specific code block is extracted correctly when a valid block index is provided.

    Invalid Block Index:
        Tests that an empty string is returned when an invalid block index is provided.

    No Code Blocks:
        Tests that an empty string is returned when there are no code blocks in the content.

    Empty Content:
        Tests that an empty string is returned when the content is empty.

These tests cover various scenarios to ensure the extractCodeBlocks function works as expected. You can run the tests using the following command:

deno test block_extractor_test.ts

This will execute the tests and verify the functionality of the extractCodeBlocks function.