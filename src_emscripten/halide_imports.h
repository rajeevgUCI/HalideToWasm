#ifndef HALIDE_IMPORTS_H
#define HALIDE_IMPORTS_H

#include "HalideBuffer.h"

extern "C"
{

int custom_halide_downgrade_buffer_t_device_fields(void *user_context, const char *name,
                                                     const halide_buffer_t *new_buf, buffer_t *old_buf);

int custom_halide_error_failed_to_downgrade_buffer_t(void *user_context,
                                                     const char *name,
                                                     const char *reason);

int custom_halide_downgrade_buffer_t(void *user_context, const char *name,
                                       const halide_buffer_t *new_buf, buffer_t *old_buf);

int custom_halide_error_bad_type(void *user_context, const char *func_name,
                                   uint8_t code_given, uint8_t correct_code,
                                   uint8_t bits_given, uint8_t correct_bits,
                                   uint16_t lanes_given, uint16_t correct_lanes);

int custom_halide_error_access_out_of_bounds(void *user_context, const char *func_name,
                                               int dimension, int min_touched, int max_touched,
                                               int min_valid, int max_valid);

int custom_halide_error_buffer_allocation_too_large(void *user_context, const char *buffer_name,
                                                        uint64_t allocation_size, uint64_t max_size);

int custom_halide_error_buffer_argument_is_null(void *user_context, const char *buffer_name);

int custom_halide_error_buffer_extents_negative(void *user_context, const char *buffer_name,
                                                int dimension, int extent);

int custom_halide_error_buffer_extents_too_large(void *user_context, const char *buffer_name,
                                                    int64_t actual_size, int64_t max_size);

int custom_halide_error_constraint_violated(void *user_context, const char *var, int val,
                                              const char *constrained_var, int constrained_val);

int custom_halide_error_host_is_null(void *user_context, const char *func);


int custom_halide_error_failed_to_upgrade_buffer_t(void *user_context,
                                                     const char *name,
                                                     const char *reason);

int custom_halide_upgrade_buffer_t(void *user_context, const char *name, const buffer_t *old_buf,
                                    halide_buffer_t *new_buf);

}

#endif // HALIDE_IMPORTS_H
