# Set the following shell variables:
# export HALIDE_LIB=<path-to-Halide>
# export BINARYEN_LIB=<path-to-binaryen>
# export WABT_LIB=<path-to-wabt>
# export HL_TARGET=webassembly-32-os_unknown
# export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:${HALIDE_LIB}/bin
# Note: when pointing to a directory, do not include a trailing slash 

PUBLIC_BIN_DIR = public/bin

EMSCRIPTEN_SRC_DIR = src_emscripten
EMSCRIPTEN_MAIN_HTML = $(PUBLIC_BIN_DIR)/main.html

HALIDE_PIPELINE_BIN_DIR = bin_halide_pipeline
HALIDE_PIPELINE_SRC_DIR = src_halide_pipeline
HALIDE_PIPELINE_SRC = $(HALIDE_PIPELINE_SRC_DIR)/myfunc_generator.cpp
HALIDE_PIPELINE_EXE = $(HALIDE_PIPELINE_BIN_DIR)/myfunc_generator
HALIDE_PIPELINE_S = $(HALIDE_PIPELINE_BIN_DIR)/myfunc.s
HALIDE_PIPELINE_WAST = $(HALIDE_PIPELINE_BIN_DIR)/myfunc.wast
HALIDE_PIPELINE_WASM = $(PUBLIC_BIN_DIR)/myfunc.wasm

all: $(EMSCRIPTEN_MAIN_HTML) $(HALIDE_PIPELINE_WASM)

$(EMSCRIPTEN_MAIN_HTML):
	mkdir -p $(PUBLIC_BIN_DIR)
	emcc --js-library $(EMSCRIPTEN_SRC_DIR)/halide_myfunc.js $(EMSCRIPTEN_SRC_DIR)/*.cpp -s EXPORTED_FUNCTIONS='["_main", "_halide_downgrade_buffer_t", "_halide_downgrade_buffer_t_device_fields", "_halide_error_bad_type", "_halide_error_buffer_allocation_too_large", "_halide_error_buffer_argument_is_null", "_halide_error_buffer_extents_negative", "_halide_error_buffer_extents_too_large", "_halide_error_constraint_violated", "_halide_error_host_is_null", "_halide_upgrade_buffer_t", "_get_data"]' -s EXTRA_EXPORTED_RUNTIME_METHODS='["cwrap"]' -o $(EMSCRIPTEN_MAIN_HTML)

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
