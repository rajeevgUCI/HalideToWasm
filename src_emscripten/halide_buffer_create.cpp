#include <stdlib.h>
#include <string.h> // for memset. In wasm, will be imported from memory.wasm .

#include "halide_buffer_create.h"

#include "halide_imports.h"

extern "C"
{

void make_shape_storage(halide_buffer_t *buf) {
    // if (buf.dimensions <= D) {
    //     buf.dim = shape;
    // } else {
    //     buf.dim = new halide_dimension_t[buf.dimensions];
    // }

    buf->dim = (halide_dimension_t *)(malloc(buf->dimensions * sizeof(halide_dimension_t)));
    memset(buf->dim, 0, buf->dimensions * sizeof(halide_dimension_t));
}

void initialize_shape(halide_buffer_t *buf, int width, int height) {
    int sizes[2] = {width, height};
    for (int i = 0; i < 2; i++) {
        buf->dim[i].min = 0;
        buf->dim[i].extent = sizes[i];
        if (i == 0) {
            buf->dim[i].stride = 1;
        } else {
            buf->dim[i].stride = buf->dim[i-1].stride * buf->dim[i-1].extent;
        }
    }
}

halide_buffer_t *create_buffer(int32_t *data, int width, int height) {
    halide_buffer_t *buf = (halide_buffer_t *)(malloc(sizeof(halide_buffer_t)));
    memset(buf, 0, sizeof(halide_buffer_t));
    buf->type = halide_type_t(halide_type_int, 32);
    buf->dimensions = 2;
    buf->host = (uint8_t *)data;
    make_shape_storage(buf);
    initialize_shape(buf, width, height);
    return buf;
}

int get_halide_buffer_t_size()
{
    return sizeof(halide_buffer_t);
}

int32_t *get_data(halide_buffer_t *halide_buf)
{
    return (int32_t *)(halide_buf->host);
}

}
