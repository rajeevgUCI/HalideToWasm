# Set the following shell variables:
# export HALIDE_LIB=<path-to-Halide>
# export LLVM_LIB=<path-to-llvm>
# export BINARYEN_LIB=<path-to-binaryen>
# export WABT_LIB=<path-to-wabt>
# export WASM_STDLIB_HACK_LIB=<path-to-wasm-stdlib-hack>
# export HL_TARGET=webassembly-32-os_unknown
# export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:${HALIDE_LIB}/bin
# Note: when pointing to a directory, do not include a trailing slash 

HALIDE_WEB_BIN_DIR = ../bin_halide_pipeline
HALIDE_WEB_PUBLIC_BIN_DIR = ../public/bin
HALIDE_WEB_SRC = myfunc_generator.cpp
HALIDE_WEB_EXE = $(HALIDE_WEB_BIN_DIR)/myfunc_generator
HALIDE_WEB_S = $(HALIDE_WEB_BIN_DIR)/myfunc.s
HALIDE_WEB_WAST = $(HALIDE_WEB_BIN_DIR)/myfunc.wast
HALIDE_WEB_WASM = $(HALIDE_WEB_PUBLIC_BIN_DIR)/myfunc.wasm

all: $(HALIDE_WEB_WASM)

$(HALIDE_WEB_WASM): $(HALIDE_WEB_SRC)
	mkdir -p $(HALIDE_WEB_BIN_DIR)
	mkdir -p $(HALIDE_WEB_PUBLIC_BIN_DIR)
	g++ $(HALIDE_WEB_SRC) -I $(HALIDE_LIB)/include/ -L $(HALIDE_LIB)/bin/ -lHalide -lpthread -ldl -o $(HALIDE_WEB_EXE) -std=c++11
	$(HALIDE_WEB_EXE) "$(HALIDE_WEB_S)"
	# Note that compiles to module that imports memory:
	$(BINARYEN_LIB)/bin/s2wasm --import-memory $(HALIDE_WEB_S) > $(HALIDE_WEB_WAST)
	$(WABT_LIB)/bin/wast2wasm $(HALIDE_WEB_WAST) -o $(HALIDE_WEB_WASM)
	# Note: alternatively, can run $(BINARYEN_LIB)/bin/s2wasm --emit-binary $(HALIDE_WEB_S) -o $(HALIDE_WEB_WASM)

.PHONY: clean
clean:
	$(RM) -r $(HALIDE_WEB_BIN_DIR)
	$(RM) -r $(HALIDE_WEB_PUBLIC_BIN_DIR)
