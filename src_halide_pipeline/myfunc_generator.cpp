#include "Halide.h"

#define conv_with_suffix(i, j) \
    Func f_conv_##i; \
    f_conv_##i(x, y, z, n) = bias(z); \
    f_conv_##i(x, y, z, n) += filter(r.x, r.y, r.z, z) \
                              * f_conv_##j(x + r.x, y + r.y, r.z, n);

namespace {

using namespace Halide;

class ConvolutionLayer : public Halide::Generator<ConvolutionLayer> {
public:
    Input<Buffer<int32_t>>  input{"input", 4};
    Input<Buffer<int32_t>>  filter{"filter", 4};
    Input<Buffer<int32_t>>  bias{"bias", 1};

    Output<Buffer<int32_t>> output{"output", 4};

    void generate() {
        Var x("x"), y("y"), z("z"), n("n");

        Func input_padded = BoundaryConditions::constant_exterior(input, 0);

        Func f_conv_0;
        f_conv_0(x, y, z, n) = input_padded(x, y, z, n);

        RDom r(filter.dim(0).min(), filter.dim(0).extent(),
               filter.dim(1).min(), filter.dim(1).extent(),
               filter.dim(2).min(), filter.dim(2).extent());

        // Use macro to generate a pipeline of convolution operations:
        conv_with_suffix(1, 0)
        conv_with_suffix(2, 1)
        conv_with_suffix(3, 2)
        conv_with_suffix(last, 3)

        Func f_clamped("clamped");
        f_clamped(x, y, z, n) = clamp(f_conv_last(x, y, z, n), 0, 255);

        output(x, y, z, n) = f_clamped(x, y, z, n);
   }
};

}  // namespace

HALIDE_REGISTER_GENERATOR(ConvolutionLayer, myfunc)
