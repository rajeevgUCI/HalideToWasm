#include <string.h> // for memset. In wasm, will be imported from memory.wasm .

#include "wasmprint.h"

#include "halide_imports.h"

int halide_downgrade_buffer_t_device_fields(void *user_context, const char *name,
                                             const halide_buffer_t *new_buf, buffer_t *old_buf) {
    old_buf->host_dirty = new_buf->host_dirty();
    old_buf->dev_dirty = new_buf->device_dirty();

    // if (new_buf->device) {
    //     if (old_buf->dev) {
    //         old_dev_wrapper *wrapper = (old_dev_wrapper *)old_buf->dev;
    //         wrapper->device = new_buf->device;
    //         wrapper->interface = new_buf->device_interface;
    //     } else {
    //         old_dev_wrapper *wrapper = (old_dev_wrapper *)malloc(sizeof(old_dev_wrapper));
    //         wrapper->device = new_buf->device;
    //         wrapper->interface = new_buf->device_interface;
    //         old_buf->dev = (uint64_t)wrapper;
    //     }
    // } else if (old_buf->dev) {
    //     free((void *)old_buf->dev);
    //     old_buf->dev = 0;
    // }
    assert(!new_buf->device, "halide_downgrade_buffer_t_device_fields: new_buf has device");
    assert(!old_buf->dev, "halide_downgrade_buffer_t_device_fields: old_buf has dev");

    return 0;
}

int halide_error_failed_to_downgrade_buffer_t(void *user_context,
                                                 const char *name,
                                                 const char *reason) {
    wasmprint("halide_error_failed_to_downgrade_buffer_t");
    return halide_error_code_failed_to_downgrade_buffer_t;
}

int halide_downgrade_buffer_t(void *user_context, const char *name,
                               const halide_buffer_t *new_buf, buffer_t *old_buf) {
    memset(old_buf, 0, sizeof(buffer_t));
    if (new_buf->dimensions > 4) {
        return halide_error_failed_to_downgrade_buffer_t(user_context, name,
                                                         "buffer has more than four dimensions");
    }
    old_buf->host = new_buf->host;
    for (int i = 0; i < new_buf->dimensions; i++) {
        old_buf->min[i] = new_buf->dim[i].min;
        old_buf->extent[i] = new_buf->dim[i].extent;
        old_buf->stride[i] = new_buf->dim[i].stride;
    }
    old_buf->elem_size = new_buf->type.bytes();
    return halide_downgrade_buffer_t_device_fields(user_context, name, new_buf, old_buf);
}

int halide_error_bad_type(void *user_context, const char *func_name,
                           uint8_t code_given, uint8_t correct_code,
                           uint8_t bits_given, uint8_t correct_bits,
                           uint16_t lanes_given, uint16_t correct_lanes) {
    wasmprint("hey error");
    wasmprint("halide_error_bad_type");
    wasmprint("halide_error_bad_type");
    return halide_error_code_bad_type;
}

int halide_error_buffer_allocation_too_large(void *user_context, const char *buffer_name,
                                                uint64_t allocation_size, uint64_t max_size) {
    wasmprint("halide_error_code_buffer_allocation_too_large");
    return halide_error_code_buffer_allocation_too_large;
}

int halide_error_buffer_argument_is_null(void *user_context, const char *buffer_name) {
    wasmprint("halide_error_code_buffer_argument_is_null");
    return halide_error_code_buffer_argument_is_null;
}


int halide_error_buffer_extents_negative(void *user_context, const char *buffer_name, int dimension, int extent) {
    wasmprint("halide_error_code_buffer_extents_negative");
    return halide_error_code_buffer_extents_negative;
}

int halide_error_buffer_extents_too_large(void *user_context, const char *buffer_name, int64_t actual_size, int64_t max_size) {
    wasmprint("halide_error_code_buffer_extents_too_large");
    return halide_error_code_buffer_extents_too_large;
}

int halide_error_constraint_violated(void *user_context, const char *var, int val,
                                          const char *constrained_var, int constrained_val) {
    wasmprint("halide_error_code_constraint_violated");
    return halide_error_code_constraint_violated;
}

int halide_error_host_is_null(void *user_context, const char *func) {
    wasmprint("halide_error_code_host_is_null");
    return halide_error_code_host_is_null;
}

int halide_error_failed_to_upgrade_buffer_t(void *user_context,
                                                 const char *name,
                                                 const char *reason) {
    wasmprint("halide_error_code_failed_to_upgrade_buffer_t");
    return halide_error_code_failed_to_upgrade_buffer_t;
}

int halide_upgrade_buffer_t(void *user_context, const char *name,
                             const buffer_t *old_buf, halide_buffer_t *new_buf) {
    if ((old_buf->host || old_buf->dev) &&
        (old_buf->elem_size != new_buf->type.bytes())) {
        // Unless we're doing a bounds query, we expect the elem_size to match the type.
        return halide_error_failed_to_upgrade_buffer_t(user_context, name, 
                                                        "buffer has incorrect elem_size temp");
    }
    new_buf->host = old_buf->host;

    // if (old_buf->dev) {
    //     old_dev_wrapper *wrapper = (old_dev_wrapper *)(old_buf->dev);
    //     new_buf->device = wrapper->device;
    //     new_buf->device_interface = wrapper->interface;
    // } else {
    //     new_buf->device = 0;
    //     new_buf->device_interface = NULL;
    // }
    assert(!old_buf->dev, "halide_upgrade_buffer_t: old_buf has dev");
    new_buf->device = 0;
    new_buf->device_interface = NULL;

    for (int i = 0; i < new_buf->dimensions; i++) {
        new_buf->dim[i].min = old_buf->min[i];
        new_buf->dim[i].extent = old_buf->extent[i];
        new_buf->dim[i].stride = old_buf->stride[i];
    }
    new_buf->flags = 0;
    new_buf->set_host_dirty(old_buf->host_dirty);
    new_buf->set_device_dirty(old_buf->dev_dirty);
    return 0;
}

