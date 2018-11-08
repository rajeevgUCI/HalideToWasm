#include "Halide.h"
#include <iostream>

using namespace Halide;

int main(int argc, char **argv) {
    if(argc != 2) {
        std::cout << "Usage: myfunc_generator [output_file_path]" << std::endl;
        return -1;
    }

    Target target = get_target_from_environment();
    if (target.arch != Target::WebAssembly) {
        std::cout << "Skipping WebAssembly test since WebAssembly is not specified in the target.\n";
        return 0;
    }
    target.set_feature(Target::NoRuntime);

    Func myfunc("myfunc");
    Var x("x"), y("y");

    myfunc(x, y) = x + y;

    myfunc.compile_to_assembly(argv[1], {}, target);

    // For reference, to view expected arguments and return type:
    // myfunc.compile_to_header("myfunc.h", {});

    return 0;
}
