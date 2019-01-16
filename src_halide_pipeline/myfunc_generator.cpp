#include "Halide.h"

namespace {

using namespace Halide;

class ConvolutionLayer : public Halide::Generator<ConvolutionLayer> {
public:
    Input<Buffer<int32_t>>  input{"input", 4};
    Input<Buffer<int32_t>>  filter{"filter", 4};
    Input<Buffer<int32_t>>  bias{"bias", 1};

    Output<Buffer<int32_t>> output{"output", 4};

    void generate() {
        /* THE ALGORITHM */

        Var x("x"), y("y"), z("z"), n("n");

        Func input_padded = BoundaryConditions::constant_exterior(input, 0);

        RDom r(filter.dim(0).min(), filter.dim(0).extent(),
               filter.dim(1).min(), filter.dim(1).extent(),
               filter.dim(2).min(), filter.dim(2).extent());
        Func f_conv("conv");
        f_conv(x, y, z, n) = bias(z);
        f_conv(x, y, z, n) += filter(r.x, r.y, r.z, z) * input_padded(x + r.x, y + r.y, r.z, n);

        Func f_clamped("clamped");
        f_clamped(x, y, z, n) = clamp(f_conv(x, y, z, n), 0, 255);

        output(x, y, z, n) = f_clamped(x, y, z, n);
   }
};

}  // namespace

HALIDE_REGISTER_GENERATOR(ConvolutionLayer, myfunc)
