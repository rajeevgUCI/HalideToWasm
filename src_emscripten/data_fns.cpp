#include "data_fns.h"

const int OUTPUT_WIDTH = 8;
const int OUTPUT_HEIGHT = 4;

extern "C"
{

int get_width()
{
    return OUTPUT_WIDTH;
}

int get_height()
{
    return OUTPUT_HEIGHT;
}

int32_t *data_create()
{
    int32_t *data = new int32_t[OUTPUT_WIDTH * OUTPUT_HEIGHT](); // parentheses to value-initialize to all 0s
    data[0] = 6;
    data[1] = 12;
    data[2] = 18;
    data[OUTPUT_WIDTH * OUTPUT_HEIGHT - 1] = 24;
    return data;
}

void dealloc_data(int32_t *data)
{
    delete[] data;
}

}
