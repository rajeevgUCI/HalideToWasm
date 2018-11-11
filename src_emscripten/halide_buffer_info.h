#ifndef HALIDE_BUFFER_INFO_H
#define HALIDE_BUFFER_INFO_H

#include "HalideBuffer.h"

extern "C"
{

int32_t *get_data(halide_buffer_t *halide_buf);

}

#endif // HALIDE_BUFFER_INFO_H
