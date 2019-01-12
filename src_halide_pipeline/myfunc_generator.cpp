#include "Halide.h"
#include <iostream>

int main(int argc, char **argv) {
    if(argc != 2) {
        std::cout << "Usage: myfunc_generator [output_file_path]" << std::endl;
        return -1;
    }

    Halide::Target target = Halide::Target("webassembly-32-os_unknown-no_runtime");

    Halide::Func myfunc("myfunc");
    Halide::Var x("x"), y("y");
    Halide::ImageParam input(Halide::UInt(8), 2);

    myfunc(x, y) = 255 - input(x, y);

    myfunc.compile_to_bitcode(argv[1], {input}, target);

    // For reference, to view expected arguments and return type:
    // myfunc.compile_to_header("myfunc.h", {input});

    return 0;
}
