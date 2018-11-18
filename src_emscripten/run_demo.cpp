#include "run_demo.h"

#include <iostream>

#include "HalideBuffer.h"

#include "halide_buffer_fns.h"

extern "C"
{

halide_buffer_t *run_demo(uint8_t *data, int width, int height)
{
    std::cout << "In C++" << std::endl;

    // Allocates halide_buf_wrapper on heap, to prevent the buffer from being deallocated at the
    // end of this function before the async code in halide_myfunc completes:
    Halide::Runtime::Buffer<uint8_t> *halide_buf_wrapper = new Halide::Runtime::Buffer<uint8_t>{data, width, height};
    halide_buffer_t *halide_buf = halide_buf_wrapper->raw_buffer();
    std::cout << "halide_buf address = " << halide_buf << std::endl;

    uint8_t *halide_data = get_halide_buffer_data(halide_buf);

    return halide_buf;

    // TODO: free halide_buf_wrapper. This will perhaps require a callback.
}

}
