# This Makefile assumes that setup.sh has been run.

PUBLIC_BIN_DIR = public/bin

EMSCRIPTEN_SRC_DIR = src_emscripten
EMSCRIPTEN_SRC_CPP = $(wildcard $(EMSCRIPTEN_SRC_DIR)/*.cpp)
EMSCRIPTEN_OUT_JS = $(PUBLIC_BIN_DIR)/emscripten-halide.js
EMSCRIPTEN_EXPORTED_FNS = '["_myfunc_cpp", "_create_halide_buffer", "_custom_halide_error_buffer_argument_is_null", "_custom_halide_malloc", "_memset", "_custom_halide_error_bad_type", "_custom_halide_error_access_out_of_bounds", "_custom_halide_error_bad_dimensions", "_custom_halide_error_buffer_extents_negative", "_custom_halide_error_constraint_violated", "_custom_halide_error_buffer_allocation_too_large", "_custom_halide_error_buffer_extents_too_large", "_custom_halide_error_host_is_null", "_custom_halide_error_out_of_memory", "_custom_halide_free", "_get_halide_buffer_data"]'
EMSCRIPTEN_EXTRA_EXPORTED_RUNTIME_METHODS = '["cwrap", "print", "printErr"]'

HALIDE_PIPELINE_BIN_DIR = bin_halide_pipeline
HALIDE_PIPELINE_SRC_DIR = src_halide_pipeline
HALIDE_PIPELINE_SRC = $(HALIDE_PIPELINE_SRC_DIR)/myfunc_generator.cpp
HALIDE_PIPELINE_EXE = $(HALIDE_PIPELINE_BIN_DIR)/myfunc_generator
HALIDE_PIPELINE_BC_NAME = myfunc
HALIDE_PIPELINE_BC = $(HALIDE_PIPELINE_BIN_DIR)/$(HALIDE_PIPELINE_BC_NAME).bc
HALIDE_PIPELINE_OBJ = $(HALIDE_PIPELINE_BIN_DIR)/myfunc.o
HALIDE_PIPELINE_WAST = $(HALIDE_PIPELINE_BIN_DIR)/myfunc.wast
HALIDE_PIPELINE_WASM = $(PUBLIC_BIN_DIR)/myfunc.wasm

# specified in $(HALIDE_PIPELINE_SRC) code:
HALIDE_PIPELINE_GENERATOR_NAME = myfunc

HALIDE_GENGEN_SRC = $(HALIDE_LIB)/tools/GenGen.cpp

all: $(EMSCRIPTEN_OUT_JS) $(HALIDE_PIPELINE_WASM)

$(EMSCRIPTEN_OUT_JS): $(EMSCRIPTEN_SRC_CPP)
	mkdir -p $(PUBLIC_BIN_DIR)
	emcc $(EMSCRIPTEN_SRC_CPP) -std=c++11 -I $(HALIDE_LIB)/include/ -s EXPORTED_FUNCTIONS=$(EMSCRIPTEN_EXPORTED_FNS) -s EXTRA_EXPORTED_RUNTIME_METHODS=$(EMSCRIPTEN_EXTRA_EXPORTED_RUNTIME_METHODS) -o $(EMSCRIPTEN_OUT_JS) -s TOTAL_MEMORY=134217728

$(HALIDE_PIPELINE_WASM): $(HALIDE_PIPELINE_SRC)
	mkdir -p $(HALIDE_PIPELINE_BIN_DIR)
	mkdir -p $(PUBLIC_BIN_DIR)
	g++ $(HALIDE_PIPELINE_SRC) $(HALIDE_GENGEN_SRC) -I $(HALIDE_LIB)/include/ -L $(HALIDE_LIB)/bin/ -lHalide -lpthread -ldl -o $(HALIDE_PIPELINE_EXE) -fno-rtti -std=c++11
	$(HALIDE_PIPELINE_EXE) -g $(HALIDE_PIPELINE_GENERATOR_NAME) -o $(HALIDE_PIPELINE_BIN_DIR) -n "$(HALIDE_PIPELINE_BC_NAME)" -e bitcode target=webassembly-32-os_unknown-no_runtime
	@ # Note that compiles to module that imports memory:
	$(LLVM_LIB)/build/bin/llc -march=wasm32 -filetype=obj $(HALIDE_PIPELINE_BC) -o $(HALIDE_PIPELINE_OBJ)
	$(LLVM_LIB)/build/bin/wasm-ld $(HALIDE_PIPELINE_OBJ) --allow-undefined --no-entry --import-memory -o $(HALIDE_PIPELINE_WASM)

.PHONY: clean
clean:
	$(RM) -r $(HALIDE_PIPELINE_BIN_DIR)
	$(RM) -r $(PUBLIC_BIN_DIR)
