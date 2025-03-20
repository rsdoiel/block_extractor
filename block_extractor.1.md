
# block_extractor

Extracts code blocks from Markdown content.

## SYNOPSIS

block_extractor [OPTIONS] [FILE]

## DESCRIPTION

Reads Markdown content from a file or standard input and extracts code blocks delimited by triple backticks (```).

## OPTIONS

-h, --help          Display this help message.
-b, --block NUM     Output only the NUM-th code block (0-indexed).

## EXAMPLES

Extract all code blocks from a file:

    block_extractor example.md

Extract the second code block from standard input:

    cat example.md | block_extractor --block 1

