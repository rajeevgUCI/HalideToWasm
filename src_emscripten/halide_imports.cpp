#include "halide_imports.h"

#include <iostream>

// These implementations are based on the original implementations in the Halide
// library.

extern "C"
{

namespace
{
	int halide_malloc_alignment()
    {
        return 8;
    }

    void *halide_default_malloc(void *user_context, size_t x)
    {
        // Allocate enough space for aligning the pointer we return.
        const size_t alignment = halide_malloc_alignment();
        void *orig = malloc(x + alignment);
        if (orig == NULL) {
            // Will result in a failed assertion and a call to halide_error
            return NULL;
        }
        // We want to store the original pointer prior to the pointer we return.
        void *ptr = (void *)(((size_t)orig + alignment + sizeof(void*) - 1) & ~(alignment - 1));
        ((void **)ptr)[-1] = orig;
        return ptr;
    }

    void halide_default_free(void *user_context, void *ptr) {
		free(((void**)ptr)[-1]);
	}
}

int custom_halide_error_buffer_argument_is_null(void *user_context, const char *buffer_name)
{
    std::cout << "custom_halide_error_buffer_argument_is_null: " << buffer_name << std::endl;
    return halide_error_code_buffer_argument_is_null;
}

void *custom_halide_malloc(void *user_context, size_t x)
{
    return halide_default_malloc(user_context, x);
}

int custom_halide_error_bad_type(void *user_context, const char *func_name,
                                 uint8_t code_given, uint8_t correct_code,
                                 uint8_t bits_given, uint8_t correct_bits,
                                 uint16_t lanes_given, uint16_t correct_lanes)
{
    std::cout << "custom_halide_error_bad_type" << std::endl;
    return halide_error_code_bad_type;
}

int custom_halide_error_access_out_of_bounds(void *user_context, const char *func_name,
                                         int dimension, int min_touched, int max_touched,
                                         int min_valid, int max_valid)
{
    if (min_touched < min_valid) {
        std::cout 
            << func_name << " is accessed at " << min_touched
            << ", which is before the min (" << min_valid
            << ") in dimension " << dimension << std::endl;
    } else if (max_touched > max_valid) {
        std::cout
            << func_name << " is accessed at " << max_touched
            << ", which is beyond the max (" << max_valid
            << ") in dimension " << dimension << std::endl;
    }
    return halide_error_code_access_out_of_bounds;

}

int custom_halide_error_bad_dimensions(void *user_context, const char *func_name,
                                       int32_t dimensions_given, int32_t correct_dimensions)
{
    std::cout
        << func_name << " requires a buffer of exactly " << correct_dimensions
        << " dimensions, but the buffer passed in has " << dimensions_given << " dimensions"
        << std::endl;
    return halide_error_code_bad_dimensions;
}

int custom_halide_error_buffer_extents_negative(void *user_context, const char *buffer_name,
                                                int dimension, int extent)
{
    std::cout
        << "The extents for buffer " << buffer_name
        << " dimension " << dimension
        << " is negative (" << extent << ")" << std::endl;
    return halide_error_code_buffer_extents_negative;

}

int custom_halide_error_constraint_violated(void *user_context, const char *var, int val,
                                            const char *constrained_var, int constrained_val)
{
    std::cout
        << "Constraint violated: " << var << " (" << val
        << ") == " << constrained_var << " (" << constrained_val << ")"
        << std::endl;
    return halide_error_code_constraint_violated;
}

int custom_halide_error_buffer_allocation_too_large(void *user_context, const char *buffer_name,
                                                    uint64_t allocation_size, uint64_t max_size)
{
    std::cout
        << "Total allocation for buffer " << buffer_name
        << " is " << allocation_size
        << ", which exceeds the maximum size of " << max_size
        << std::endl;
    return halide_error_code_buffer_allocation_too_large;
}

int custom_halide_error_buffer_extents_too_large(void *user_context, const char *buffer_name,
                                                 int64_t actual_size, int64_t max_size)
{
    std::cout
        << "Product of extents for buffer " << buffer_name
        << " is " << actual_size
        << ", which exceeds the maximum size of " << max_size
        << std::endl;
    return halide_error_code_buffer_extents_too_large;
}

int custom_halide_error_host_is_null(void *user_context, const char *func_name)
{
    std::cout
        << "The host pointer of " << func_name
        << " is null, but the pipeline will access it on the host."
        << std::endl;
    return halide_error_code_host_is_null;
}

int custom_halide_error_out_of_memory(void *user_context)
{
    // The error message builder uses malloc, so we can't use it here.
    std::cout << "Out of memory (halide_malloc returned NULL)" << std::endl;
    return halide_error_code_out_of_memory;
}

void custom_halide_free(void *user_context, void *ptr)
{
    halide_default_free(user_context, ptr);
}

}
