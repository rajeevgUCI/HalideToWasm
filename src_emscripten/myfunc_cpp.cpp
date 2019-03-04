#include "myfunc_cpp.h"

#include <stdexcept>

extern "C"
{

void myfunc_cpp(int32_t *input_array, int32_t input_width, int32_t input_height,
                int32_t *filter_array, int32_t filter_width, int32_t filter_height,
                int32_t bias, int32_t *output_array)
{
    for(int32_t y = 0; y < input_height; ++y)
    {
        for(int32_t x = 0; x < input_width; ++x)
        {
            output_array[input_width * y + x] = bias;
        }
    }

    for(int32_t y = 0; y < input_height; ++y)
    {
        for(int32_t x = 0; x < input_width; ++x)
        {
            for(int32_t rdom_y = 0; rdom_y < filter_height; ++rdom_y)
            {
                for(int32_t rdom_x = 0; rdom_x < filter_width; ++rdom_x)
                {
                    int32_t filter_val = filter_array[filter_width * rdom_y + rdom_x];
                    int32_t curr_input_x = x + rdom_x;
                    int32_t curr_input_y = y + rdom_y;
                    int32_t input_val = (curr_input_x < 0 || curr_input_x >= input_width || curr_input_y < 0 || curr_input_y >= input_height) ? 0 : input_array[input_width * curr_input_y + curr_input_x];
                    output_array[input_width * y + x] += filter_val * input_val;
                }
            }
        }
    }
}

}
