#include <iostream>

#include "HalideBuffer.h"

#include "data_create.h"
#include "halide_buffer_info.h"
#include "halide_myfunc.h"

int main()
{
    int32_t *data = data_create();
    int width = get_width();
    int height = get_height();

    Halide::Runtime::Buffer<int32_t> halide_buf_wrapper(data, width, height);
    halide_buffer_t *halide_buf = halide_buf_wrapper.raw_buffer();
    std::cout << "halide_buf = " << halide_buf << std::endl;

    std::cout << "Data width = " << width << ", height = " << height << std::endl;
    int32_t *halide_data = get_data(halide_buf);
    std::cout << "halide_data = " << halide_data << std::endl;
    std::cout << "Array:" << std::endl;
    for(int i = 0; i < width * height; ++i)
    {
        std::cout << "data[" << i << "] = " << halide_data[i] << std::endl;
    }
    std::cout << "Done." << std::endl;
    
    std::cout << "Calling myfunc..." << std::endl;
    halide_myfunc(halide_buf);

    return 0;
}
