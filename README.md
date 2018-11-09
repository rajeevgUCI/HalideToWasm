# HalideToWasm #

Demo of compiling a Halide pipeline to wasm and calling the pipeline as a function in JavaScript.

To build and run:
1. Set up dependencies
2. Build the demo
3. `npm install`
4. `npm start`
5. Open the index page in a browser
6. Open the browser console to see the output

More details on some of those steps below.

## Set up dependencies ##
Clone and build my forked libraries:
* Halide
* binaryen
* wabt

Instructions for cloning and building them are in the READMEs for each repository.

## Build the demo ##
Set the shell variables listed at the top of Makefile to point to the installed libraries (which were described above). Then, run `make`.
