#include "halide_buffer_info.h"

extern "C"
{

int32_t *get_data(halide_buffer_t *halide_buf)
{
    return (int32_t *)(halide_buf->host);
}

}
