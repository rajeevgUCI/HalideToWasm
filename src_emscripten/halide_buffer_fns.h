#ifndef HALIDE_BUFFER_FNS_H
#define HALIDE_BUFFER_FNS_H

#include "HalideBuffer.h"

extern "C"
{

int32_t *get_halide_buffer_data(halide_buffer_t *halide_buf);

}

#endif // HALIDE_BUFFER_FNS_H
