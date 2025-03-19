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
