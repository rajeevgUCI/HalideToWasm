Demo of compiling a Halide pipeline to wasm and calling the pipeline as a function in JavaScript.

To build and run:
1. Install libraries
2. Build the wasm modules
3. npm install
4. npm start
5. Open the index page in a browser
6. Open the browser console to see the output

More details below.

## Install libraries ##
Clone and build my forked libraries:
* Halide
* llvm
* clang
* binaryen
* wabt
* wasm-stdlib-hack

Instructions for cloning and building them are in the READMEs for each repository.

## Build the wasm modules ##
```bash
cd public/
```
Set the shell variables listed at the top of Makefile to point to the installed libraries (which were described above).
```bash
make
```
