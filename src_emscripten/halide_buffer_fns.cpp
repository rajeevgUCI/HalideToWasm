#include "halide_buffer_fns.h"

extern "C"
{

uint8_t *get_halide_buffer_data(halide_buffer_t *halide_buf)
{
    return (uint8_t *)(halide_buf->host);
}

}
