#include "halide_buffer_fns.h"

extern "C"
{

int32_t *get_halide_buffer_data(halide_buffer_t *halide_buf)
{
    return (int32_t *)(halide_buf->host);
}

}
