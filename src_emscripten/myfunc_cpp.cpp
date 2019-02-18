#include "myfunc_cpp.h"

#include <stdexcept>

extern "C"
{

namespace
{
    int32_t get_index(int32_t *array, int32_t width, int32_t height, int32_t x, int32_t y)
    {
        return width * y + x;
    }

    int32_t get_value(int32_t *array, int32_t width, int32_t height, int32_t x, int32_t y, bool is_padded)
    {
        int32_t idx = get_index(array, width, height, x, y);
        if(x < 0 || x >= width || y < 0 || y >= height)
        {
            if(is_padded)
            {
                return 0; // zero-padded
            }
            else
            {
                throw std::out_of_range{"get_value: index out of bounds and not padded"};
            }
        }
        return array[idx];
    }

    void set_value(int32_t *array, int32_t width, int32_t height, int32_t x, int32_t y, int32_t value)
    {
        array[get_index(array, width, height, x, y)] = value;
    }

    void convolve(int32_t *input_array, int32_t input_width, int32_t input_height,
                    int32_t *filter_array, int32_t filter_width, int32_t filter_height,
                    int32_t bias, int32_t *output_array)
    {
        for(int32_t y = 0; y < input_height; ++y)
        {
            for(int32_t x = 0; x < input_width; ++x)
            {
                int32_t val = bias;
                for(int32_t rdom_y = 0; rdom_y < filter_height; ++rdom_y)
                {
                    for(int32_t rdom_x = 0; rdom_x < filter_width; ++rdom_x)
                    {
                        int32_t filter_val = get_value(filter_array, filter_width, filter_height, rdom_x, rdom_y, false);
                        int32_t input_val = get_value(input_array, input_width, input_height, x + rdom_x, y + rdom_y, true);
                        val += filter_val * input_val;
                    }
                }
                set_value(output_array, input_width, input_height, x, y, val);
            }
        }
    }

    void clamp(int32_t *input_array, int32_t input_width, int32_t input_height,
                int32_t *output_array, int32_t min_value, int32_t max_value)
    {
        for(int32_t y = 0; y < input_height; ++y)
        {
            for(int32_t x = 0; x < input_width; ++x)
            {
                int32_t input_val = get_value(input_array, input_width, input_height, x, y, false);
                int32_t val = input_val < min_value ? min_value : input_val;
                val = val > max_value ? max_value : val;
                set_value(output_array, input_width, input_height, x, y, val);
            }
        }
    }
}

void myfunc_cpp(int32_t *input_array, int32_t input_width, int32_t input_height,
                int32_t *filter_array, int32_t filter_width, int32_t filter_height,
                int32_t bias, int32_t *output_array)
{
    int32_t input_length = input_width * input_height;

    int32_t *intermediate = new int32_t[input_length];
    convolve(input_array, input_width, input_height, filter_array, filter_width, filter_height, bias, intermediate);
    clamp(intermediate, input_width, input_height, output_array, 0, 255);
    delete[] intermediate;
}

}
