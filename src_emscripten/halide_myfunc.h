#ifndef HALIDE_MYFUNC_H
#define HALIDE_MYFUNC_H

// Header file for inclusion in C++ code. Implementation is in JavaScript.

extern "C"
{

    extern void halide_myfunc(halide_buffer_t *halide_buf, int width, int height);

}

#endif // HALIDE_MYFUNC_H
