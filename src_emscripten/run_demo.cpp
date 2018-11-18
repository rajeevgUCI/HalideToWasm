#include "run_demo.h"

#include <iostream>

#include "HalideBuffer.h"

#include "halide_buffer_fns.h"
#include "halide_myfunc.h"

extern "C"
{

void run_demo(int32_t *data, int width, int height)
{
    std::cout << "In C++" << std::endl;

    Halide::Runtime::Buffer<int32_t> halide_buf_wrapper(data, width, height);
    halide_buffer_t *halide_buf = halide_buf_wrapper.raw_buffer();
    std::cout << "halide_buf address = " << halide_buf << std::endl;

    int32_t *halide_data = get_halide_buffer_data(halide_buf);
    std::cout << "halide_buf data address = " << halide_data << std::endl;
    std::cout << "halide_buf data in memory:" << std::endl;
    std::cout << halide_data[0];
    for(int i = 1; i < width * height; ++i)
    {
        std::cout << ", " << halide_data[i];
    }
    std::cout << std::endl;

    std::cout << "Calling myfunc..." << std::endl;
    halide_myfunc(halide_buf, width, height);
}

}
