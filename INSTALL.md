Installation for development of **block_extractor**
===========================================

**block_extractor** This is a proof of concept TypeScript program for Deno 2.2 that will scan a Markdown document and extract the code blocks encountered.

Installing from source
----------------------

### Required software

- Deno 2.2

### Steps

1. git clone https://github.com/rsdoiel/block_extractor
2. Change directory into the `block_extractor` directory
3. Use `deno task` to build an executable

~~~shell
git clone https://github.com/rsdoiel/block_extractor
cd block_extractor
deno task test
deno task build
~~~

