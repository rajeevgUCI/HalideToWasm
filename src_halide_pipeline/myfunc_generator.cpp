#include "Halide.h"

#define conv_with_suffix(i, j) \
    Func f_conv_##i; \
    f_conv_##i(x, y) = bias; \
    f_conv_##i(x, y) += filter(r.x, r.y) * f_conv_##j(x + r.x, y + r.y); \
    f_conv_##i = BoundaryConditions::constant_exterior(f_conv_##i, 0, \
                    {{input.dim(0).min(), input.dim(0).extent()}, \
                    {input.dim(1).min(), input.dim(1).extent()}});

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

        Func f_conv_0;
        f_conv_0(x, y) = input(x, y);
        f_conv_0 = BoundaryConditions::constant_exterior(f_conv_0, 0,
                    {{input.dim(0).min(), input.dim(0).extent()},
                    {input.dim(1).min(), input.dim(1).extent()}});

        RDom r(filter.dim(0).min(), filter.dim(0).extent(),
               filter.dim(1).min(), filter.dim(1).extent());

        // Use macro to generate a pipeline of convolution operations:
        conv_with_suffix(1, 0)
        conv_with_suffix(2, 1)
        conv_with_suffix(3, 2)
        conv_with_suffix(last, 3)

        Func f_clamped("clamped");
        f_clamped(x, y) = clamp(f_conv_last(x, y), 0, 255);

        output(x, y) = f_clamped(x, y);
   }
};

}  // namespace

HALIDE_REGISTER_GENERATOR(ConvolutionLayer, myfunc)
