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
Install emscripten and activate the tools. See instructions [here](http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html).

Clone and build [my fork of the Halide library](https://github.com/rajeevgUCI/Halide). Instructions for building it is in the README for that repository.

Clone and build [binaryen](https://github.com/WebAssembly/binaryen). Note: the 1.37.38 release was used for this demo.

Clone and build [wabt](https://github.com/WebAssembly/wabt). Note: the 1.0.0 release was used for this demo.

## Build the demo ##
Set the shell variables listed at the top of Makefile to point to the dependencies (which were described above).

Then, run `make`.
