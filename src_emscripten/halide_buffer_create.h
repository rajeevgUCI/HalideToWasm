#ifndef HALIDE_BUFFER_CREATE_H
#define HALIDE_BUFFER_CREATE_H

#include <stdint.h>

extern "C"
{

struct halide_buffer_t;
typedef struct halide_buffer_t halide_buffer_t;

halide_buffer_t *create_buffer(int32_t *data, int width, int height);
int get_halide_buffer_t_size();
int32_t *get_data(halide_buffer_t *halide_buf);

}

#endif // HALIDE_BUFFER_CREATE_H
