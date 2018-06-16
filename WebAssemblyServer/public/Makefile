# Set the following shell variables:
# export HALIDE_LIB=<path-to-Halide>
# export LLVM_LIB=<path-to-llvm>
# export BINARYEN_LIB=<path-to-binaryen>
# export WABT_LIB=<path-to-wabt>
# export WASM_STDLIB_HACK_LIB=<path-to-wasm-stdlib-hack>
# export HL_TARGET=webassembly-32-os_unknown
# export LD_LIBRARY_PATH=<path-to-Halide>/bin
# Note: when pointing to a directory, do not include a trailing slash 

HALIDE_WEB_SRC = myfunc_generator.cpp
HALIDE_WEB_S = myfunc.s
HALIDE_WEB_OBJ = $(HALIDE_WEB_S:.s=.wasm)
WEB_CPP_SRCS = halide_buffer_create.cpp halide_imports.cpp myassert.cpp data_create.cpp
WEB_CPP_OBJS = $(WEB_CPP_SRCS:.cpp=.wasm)
MEMORY_WASM_OBJ = memory.wasm

all: $(WEB_CPP_OBJS) $(HALIDE_WEB_OBJ) $(MEMORY_WASM_OBJ)

$(MEMORY_WASM_OBJ):
	cp $(WASM_STDLIB_HACK_LIB)/dist/memory.wasm $(MEMORY_WASM_OBJ)

$(HALIDE_WEB_S): $(HALIDE_WEB_SRC)
	g++ $(HALIDE_WEB_SRC) -I $(HALIDE_LIB)/include/ -L $(HALIDE_LIB)/bin/ -lHalide -lpthread -ldl -o $(HALIDE_WEB_SRC:.cpp=) -std=c++11
	./$(HALIDE_WEB_SRC:.cpp=)

%.s: %.cpp
	$(LLVM_LIB)/build/bin/clang++ -emit-llvm --target=wasm32 -Ofast $< -c -o $(<:.cpp=.bc)
	$(LLVM_LIB)/build/bin/llc -asm-verbose=false $(<:.cpp=.bc) -o $(<:.cpp=.s)

%.wasm: %.s
	# Note that compiles to module that imports memory:
	$(BINARYEN_LIB)/bin/s2wasm --import-memory $< > $(<:.s=.wast)
	$(WABT_LIB)/build/wast2wasm $(<:.s=.wast) -o $@
	# Note: alternatively, can run $(BINARYEN_LIB)/bin/s2wasm --emit-binary $< -o $@

.PHONY: clean
clean:
	$(RM) $(WEB_CPP_SRCS:.cpp=.bc) 
	$(RM) $(WEB_CPP_SRCS:.cpp=.s) 
	$(RM) $(WEB_CPP_SRCS:.cpp=.wast) 
	$(RM) $(WEB_CPP_OBJS)
	$(RM) $(HALIDE_WEB_SRC:.cpp=)
	$(RM) $(HALIDE_WEB_S)
	$(RM) $(HALIDE_WEB_S:.s=.wast)
	$(RM) $(HALIDE_WEB_S:.s=.h)
	$(RM) $(HALIDE_WEB_OBJ)
	$(RM) $(MEMORY_WASM_OBJ)
