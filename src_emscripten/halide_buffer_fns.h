#ifndef HALIDE_BUFFER_FNS_H
#define HALIDE_BUFFER_FNS_H

#include <cstdint>

#include "HalideBuffer.h"

struct halide_buffer_t;

extern "C"
{

halide_buffer_t *create_halide_buffer(int32_t *data, int width, int height);
int32_t *get_halide_buffer_data(halide_buffer_t *halide_buf);

}

#endif // HALIDE_BUFFER_FNS_H
