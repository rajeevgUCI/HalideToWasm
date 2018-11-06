#include "wasmprint.h"

void assert(bool condition, const char *message)
{
    if(!condition)
    {
        wasmprint(message);
    }
}
