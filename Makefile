# This Makefile assumes that setup.sh has been run.

PUBLIC_BIN_DIR = public/bin

EMSCRIPTEN_SRC_DIR = src_emscripten
EMSCRIPTEN_SRC_CPP = $(wildcard $(EMSCRIPTEN_SRC_DIR)/*.cpp)
EMSCRIPTEN_SRC_JS = $(EMSCRIPTEN_SRC_DIR)/emscripten_prejs.js
EMSCRIPTEN_OUT_JS = $(PUBLIC_BIN_DIR)/index.js
EMSCRIPTEN_EXPORTED_FNS = '["_main", "_custom_halide_downgrade_buffer_t", "_custom_halide_downgrade_buffer_t_device_fields", "_custom_halide_error_bad_type", "_custom_halide_error_buffer_allocation_too_large", "_custom_halide_error_buffer_argument_is_null", "_custom_halide_error_buffer_extents_negative", "_custom_halide_error_buffer_extents_too_large", "_custom_halide_error_constraint_violated", "_custom_halide_error_host_is_null", "_custom_halide_upgrade_buffer_t", "_get_data", "_get_width", "_get_height", "_dealloc_data"]'
EMSCRIPTEN_EXTRA_EXPORTED_RUNTIME_METHODS = '["cwrap", "print", "printErr"]'

HALIDE_PIPELINE_BIN_DIR = bin_halide_pipeline
HALIDE_PIPELINE_SRC_DIR = src_halide_pipeline
HALIDE_PIPELINE_SRC = $(HALIDE_PIPELINE_SRC_DIR)/myfunc_generator.cpp
HALIDE_PIPELINE_EXE = $(HALIDE_PIPELINE_BIN_DIR)/myfunc_generator
HALIDE_PIPELINE_S = $(HALIDE_PIPELINE_BIN_DIR)/myfunc.s
HALIDE_PIPELINE_WAST = $(HALIDE_PIPELINE_BIN_DIR)/myfunc.wast
HALIDE_PIPELINE_WASM = $(PUBLIC_BIN_DIR)/myfunc.wasm

all: $(EMSCRIPTEN_OUT_JS) $(HALIDE_PIPELINE_WASM)

$(EMSCRIPTEN_OUT_JS): $(EMSCRIPTEN_SRC_JS) $(EMSCRIPTEN_SRC_CPP)
	mkdir -p $(PUBLIC_BIN_DIR)
	emcc --js-library $(EMSCRIPTEN_SRC_JS) $(EMSCRIPTEN_SRC_CPP) -std=c++11 -I $(HALIDE_LIB)/include/ -s EXPORTED_FUNCTIONS=$(EMSCRIPTEN_EXPORTED_FNS) -s EXTRA_EXPORTED_RUNTIME_METHODS=$(EMSCRIPTEN_EXTRA_EXPORTED_RUNTIME_METHODS) -o $(EMSCRIPTEN_OUT_JS)

$(HALIDE_PIPELINE_WASM): $(HALIDE_PIPELINE_SRC)
	mkdir -p $(HALIDE_PIPELINE_BIN_DIR)
	mkdir -p $(PUBLIC_BIN_DIR)
	g++ $(HALIDE_PIPELINE_SRC) -I $(HALIDE_LIB)/include/ -L $(HALIDE_LIB)/bin/ -lHalide -lpthread -ldl -o $(HALIDE_PIPELINE_EXE) -std=c++11
	$(HALIDE_PIPELINE_EXE) "$(HALIDE_PIPELINE_S)"
	@ # Note that compiles to module that imports memory:
	$(BINARYEN_LIB)/bin/s2wasm --import-memory $(HALIDE_PIPELINE_S) > $(HALIDE_PIPELINE_WAST)
	$(WABT_LIB)/bin/wast2wasm $(HALIDE_PIPELINE_WAST) -o $(HALIDE_PIPELINE_WASM)
	@ # Note: alternatively, can run $(BINARYEN_LIB)/bin/s2wasm --emit-binary $(HALIDE_PIPELINE_S) -o $(HALIDE_PIPELINE_WASM)

.PHONY: clean
clean:
	$(RM) -r $(HALIDE_PIPELINE_BIN_DIR)
	$(RM) -r $(PUBLIC_BIN_DIR)
