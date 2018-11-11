#ifndef DATA_FNS_H
#define DATA_FNS_H

#include <cstdint>

extern "C"
{

int get_width();
int get_height();
int32_t *data_create();
void dealloc_data(int32_t *data);

}

#endif // DATA_FNS_H
