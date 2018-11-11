#include <stdlib.h> // for malloc
#include <string.h> // for memset

#include "data_create.h"

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
    int32_t *data = (int32_t *)(malloc((OUTPUT_WIDTH * OUTPUT_HEIGHT) * sizeof(int32_t)));
    memset(data, 0, (OUTPUT_WIDTH * OUTPUT_HEIGHT) * sizeof(int32_t));
    data[0] = 6;
    data[1] = 12;
    data[2] = 18;
    data[OUTPUT_WIDTH * OUTPUT_HEIGHT - 1] = 24;
    return data;
}

}