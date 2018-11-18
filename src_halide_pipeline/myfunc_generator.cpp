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
    ImageParam input(UInt(8), 2);

    myfunc(x, y) = 255 - input(x, y);

    std::cout << "first output type = " << myfunc.output_types()[0] << std::endl;

    myfunc.compile_to_assembly(argv[1], {input}, target);

    // For reference, to view expected arguments and return type:
    // myfunc.compile_to_header("myfunc.h", {input});

    return 0;
}
