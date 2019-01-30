# HalideToWasm #

Demo of compiling a Halide pipeline to wasm and calling the pipeline as a function in JavaScript.

## Build and Run Instructions ##

### 1. Set up dependencies ###

Install emscripten. See instructions [here](http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html).

Clone and build [my fork of the Halide library](https://github.com/rajeevgUCI/Halide) and LLVM. Instructions for building both are in the README for the Halide repository.

Clone and build [wabt](https://github.com/WebAssembly/wabt). Note: the 1.0.0 release was used for this demo.

### 2. Build the demo ###

Set the variables listed at the top of setup.sh to point to the dependencies (which were described above).

Activate emscripten tools (so that emcc is available).

Then, run:
```bash
source setup.sh
make
```

### 3. Install web server packages ###

```bash
npm install
```

### 4. Start web server ###

```bash
npm start
```

### 5. Open demo web page ###

Open the index page in a browser.

Open the browser console to see more output.
