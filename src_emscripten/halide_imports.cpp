#include "halide_imports.h"

#include <iostream>
#include <cassert>

extern "C"
{

int custom_halide_downgrade_buffer_t_device_fields(void *user_context, const char *name,
                                             const halide_buffer_t *new_buf, buffer_t *old_buf) {
    // For the simple demo example, there should not be calls to this function:
    std::cout << "Unexpected call to custom_halide_downgrade_buffer_t_device_fields" << std::endl;
    assert(false);
    return -1;
}

int custom_halide_error_failed_to_downgrade_buffer_t(void *user_context,
                                                 const char *name,
                                                 const char *reason) {
    std::cout << "custom_halide_error_failed_to_downgrade_buffer_t" << std::endl;
    return halide_error_code_failed_to_downgrade_buffer_t;
}

int custom_halide_downgrade_buffer_t(void *user_context, const char *name,
                               const halide_buffer_t *new_buf, buffer_t *old_buf) {
    // For the simple demo example, there should not be calls to this function:
    std::cout << "Unexpected call to custom_halide_downgrade_buffer_t" << std::endl;
    assert(false);
    return -1;
}

int custom_halide_error_bad_type(void *user_context, const char *func_name,
                           uint8_t code_given, uint8_t correct_code,
                           uint8_t bits_given, uint8_t correct_bits,
                           uint16_t lanes_given, uint16_t correct_lanes) {
    std::cout << "custom_halide_error_bad_type" << std::endl;
    return halide_error_code_bad_type;
}

int custom_halide_error_access_out_of_bounds(void *user_context, const char *func_name,
                                               int dimension, int min_touched, int max_touched,
                                               int min_valid, int max_valid)
{
    std::cout << "custom_halide_error_access_out_of_bounds" << std::endl;
    return halide_error_code_access_out_of_bounds;
}

int custom_halide_error_buffer_allocation_too_large(void *user_context, const char *buffer_name,
                                                uint64_t allocation_size, uint64_t max_size) {
    std::cout << "custom_halide_error_code_buffer_allocation_too_large" << std::endl;
    return halide_error_code_buffer_allocation_too_large;
}

int custom_halide_error_buffer_argument_is_null(void *user_context, const char *buffer_name) {
    std::cout << "custom_halide_error_buffer_argument_is_null" << std::endl;
    return halide_error_code_buffer_argument_is_null;
}


int custom_halide_error_buffer_extents_negative(void *user_context, const char *buffer_name, int dimension, int extent) {
    std::cout << "custom_halide_error_code_buffer_extents_negative" << std::endl;
    return halide_error_code_buffer_extents_negative;
}

int custom_halide_error_buffer_extents_too_large(void *user_context, const char *buffer_name, int64_t actual_size, int64_t max_size) {
    std::cout << "custom_halide_error_code_buffer_extents_too_large" << std::endl;
    return halide_error_code_buffer_extents_too_large;
}

int custom_halide_error_constraint_violated(void *user_context, const char *var, int val,
                                          const char *constrained_var, int constrained_val) {
    std::cout << "custom_halide_error_constraint_violated" << std::endl;
    return halide_error_code_constraint_violated;
}

int custom_halide_error_host_is_null(void *user_context, const char *func) {
    std::cout << "custom_halide_error_code_host_is_null" << std::endl;
    return halide_error_code_host_is_null;
}

int custom_halide_error_failed_to_upgrade_buffer_t(void *user_context,
                                                 const char *name,
                                                 const char *reason) {
    std::cout << "custom_halide_error_code_failed_to_upgrade_buffer_t" << std::endl;
    return halide_error_code_failed_to_upgrade_buffer_t;
}

int custom_halide_upgrade_buffer_t(void *user_context, const char *name,
                             const buffer_t *old_buf, halide_buffer_t *new_buf) {
    // For the simple demo example, there should not be calls to this function:
    std::cout << "Unexpected call to custom_halide_upgrade_buffer_t" << std::endl;
    assert(false);
    return -1;
}

}
