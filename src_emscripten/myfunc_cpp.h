#ifndef MYFUNC_CPP_H
#define MYFUNC_CPP_H

#include <cstdint>

extern "C"
{

void myfunc_cpp(int32_t *input_array, int32_t input_width, int32_t input_height,
                int32_t *filter_array, int32_t filter_width, int32_t filter_height,
                int32_t bias, int32_t *output_array);

}

#endif // MYFUNC_CPP_H
