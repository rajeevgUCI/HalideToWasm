# Set the following shell variables.
# Note: when pointing to a directory, do not include a trailing slash.
export HALIDE_LIB=<path-to-Halide>
export LLVM_LIB=<path-to-llvm>
export WABT_LIB=<path-to-wabt>

export HL_TARGET=webassembly-32-os_unknown
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:${HALIDE_LIB}/bin
