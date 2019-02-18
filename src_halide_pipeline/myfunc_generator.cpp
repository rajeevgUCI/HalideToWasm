#include "Halide.h"

namespace {

using namespace Halide;

class ConvolutionLayer : public Halide::Generator<ConvolutionLayer> {
public:
    Input<Buffer<int32_t>>  input{"input", 2};
    Input<Buffer<int32_t>>  filter{"filter", 2};
    Input<int32_t>  bias{"bias"};

    Output<Buffer<int32_t>> output{"output", 2};

    void generate() {
        Var x("x"), y("y");

        Func f_conv_0("conv_0");
        f_conv_0(x, y) = input(x, y);
        f_conv_0 = BoundaryConditions::constant_exterior(f_conv_0, 0,
                    {{input.dim(0).min(), input.dim(0).extent()},
                    {input.dim(1).min(), input.dim(1).extent()}});
        f_conv_0.compute_root();

        RDom r(filter.dim(0).min(), filter.dim(0).extent(),
               filter.dim(1).min(), filter.dim(1).extent());

        Func f_conv_1("conv_1");
        f_conv_1(x, y) = bias;
        f_conv_1(x, y) += filter(r.x, r.y) * f_conv_0(x + r.x, y + r.y);
        f_conv_1.compute_root();

        Func f_clamped("clamped");
        f_clamped(x, y) = clamp(f_conv_1(x, y), 0, 255);
        f_clamped.compute_root();

        // Prints debugging info at compile time:
        f_clamped.print_loop_nest();

        output(x, y) = f_clamped(x, y);
   }
};

}  // namespace

HALIDE_REGISTER_GENERATOR(ConvolutionLayer, myfunc)
