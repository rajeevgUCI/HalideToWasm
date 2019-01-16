#include "Halide.h"

class MyFuncGenerator: public Halide::Generator<MyFuncGenerator>
{
public:
    // Note: Input and Output are defined in Halide.h, but have no Halide
    // namespace prefix:
    Input<Halide::Buffer<uint8_t>> input{"input", 2};
    Output<Halide::Buffer<uint8_t>> myfunc{"myfunc", 2};

    void generate()
    {
        Halide::Var x{"x"}, y{"y"};

        myfunc(x, y) = 255 - input(x, y);
    }
};

HALIDE_REGISTER_GENERATOR(MyFuncGenerator, myfunc);
