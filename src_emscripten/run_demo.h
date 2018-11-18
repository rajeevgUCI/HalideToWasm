#ifndef RUN_DEMO_H
#define RUN_DEMO_H

#include <cstdint>

struct halide_buffer_t;

extern "C"
{

halide_buffer_t *run_demo(int32_t *data, int width, int height);

}

#endif // RUN_DEMO_H
