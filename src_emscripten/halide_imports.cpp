#include <string.h> // for memset. In wasm, will be imported from memory.wasm .
#include <iostream>
#include <cassert>

#include "halide_imports.h"

extern "C"
{

int halide_downgrade_buffer_t_device_fields(void *user_context, const char *name,
                                             const halide_buffer_t *new_buf, buffer_t *old_buf) {
    // For the simple demo example, there should not be calls to this function:
    std::cout << "Unexpected call to halide_downgrade_buffer_t_device_fields" << std::endl;
    assert(false);
    return -1;
}

int halide_error_failed_to_downgrade_buffer_t(void *user_context,
                                                 const char *name,
                                                 const char *reason) {
    std::cout << "halide_error_failed_to_downgrade_buffer_t" << std::endl;
    return halide_error_code_failed_to_downgrade_buffer_t;
}

int halide_downgrade_buffer_t(void *user_context, const char *name,
                               const halide_buffer_t *new_buf, buffer_t *old_buf) {
    // For the simple demo example, there should not be calls to this function:
    std::cout << "Unexpected call to halide_downgrade_buffer_t" << std::endl;
    assert(false);
    return -1;
}

int halide_error_bad_type(void *user_context, const char *func_name,
                           uint8_t code_given, uint8_t correct_code,
                           uint8_t bits_given, uint8_t correct_bits,
                           uint16_t lanes_given, uint16_t correct_lanes) {
    std::cout << "halide_error_bad_type" << std::endl;
    return halide_error_code_bad_type;
}

int halide_error_buffer_allocation_too_large(void *user_context, const char *buffer_name,
                                                uint64_t allocation_size, uint64_t max_size) {
    std::cout << "halide_error_code_buffer_allocation_too_large" << std::endl;
    return halide_error_code_buffer_allocation_too_large;
}

int halide_error_buffer_argument_is_null(void *user_context, const char *buffer_name) {
    std::cout << "halide_error_buffer_argument_is_null" << std::endl;
    return halide_error_code_buffer_argument_is_null;
}


int halide_error_buffer_extents_negative(void *user_context, const char *buffer_name, int dimension, int extent) {
    std::cout << "halide_error_code_buffer_extents_negative" << std::endl;
    return halide_error_code_buffer_extents_negative;
}

int halide_error_buffer_extents_too_large(void *user_context, const char *buffer_name, int64_t actual_size, int64_t max_size) {
    std::cout << "halide_error_code_buffer_extents_too_large" << std::endl;
    return halide_error_code_buffer_extents_too_large;
}

int halide_error_constraint_violated(void *user_context, const char *var, int val,
                                          const char *constrained_var, int constrained_val) {
    std::cout << "halide_error_constraint_violated" << std::endl;
    return halide_error_code_constraint_violated;
}

int halide_error_host_is_null(void *user_context, const char *func) {
    std::cout << "halide_error_code_host_is_null" << std::endl;
    return halide_error_code_host_is_null;
}

int halide_error_failed_to_upgrade_buffer_t(void *user_context,
                                                 const char *name,
                                                 const char *reason) {
    std::cout << "halide_error_code_failed_to_upgrade_buffer_t" << std::endl;
    return halide_error_code_failed_to_upgrade_buffer_t;
}

int halide_upgrade_buffer_t(void *user_context, const char *name,
                             const buffer_t *old_buf, halide_buffer_t *new_buf) {
    // For the simple demo example, there should not be calls to this function:
    std::cout << "Unexpected call to halide_upgrade_buffer_t" << std::endl;
    assert(false);
    return -1;
}

}
