#include <stdint.h>
#include <stddef.h>
#include <cassert>

extern "C"
{

typedef enum halide_type_code_t
// #if __cplusplus >= 201103L
// : uint8_t
// #endif
{
    halide_type_int = 0,   //!< signed integers
    halide_type_uint = 1,  //!< unsigned integers
    halide_type_float = 2, //!< floating point numbers
    halide_type_handle = 3 //!< opaque pointer type (void *)
} halide_type_code_t;

struct halide_type_t {
// #if __cplusplus >= 201103L
    halide_type_code_t code;
// #else
//     uint8_t code; // halide_type_code_t
// #endif
    uint8_t bits;
    uint16_t lanes;

// #ifdef __cplusplus
    halide_type_t(halide_type_code_t code, uint8_t bits, uint16_t lanes = 1)
        : code(code), bits(bits), lanes(lanes) {
    }

    halide_type_t() : code((halide_type_code_t)0), bits(0), lanes(0) {}

    bool operator==(const halide_type_t &other) const {
        return (code == other.code &&
                bits == other.bits &&
                lanes == other.lanes);
    }

    bool operator!=(const halide_type_t &other) const {
        return !(*this == other);
    }

    int bytes() const { return (bits + 7) / 8; }
// #endif
};

typedef struct halide_dimension_t {
    int32_t min, extent, stride;

    // Per-dimension flags. None are defined yet (This is reserved for future use).
    uint32_t flags;

// #ifdef __cplusplus
    halide_dimension_t() : min(0), extent(0), stride(0), flags(0) {}
    halide_dimension_t(int32_t m, int32_t e, int32_t s, uint32_t f = 0) :
        min(m), extent(e), stride(s), flags(f) {}

    bool operator==(const halide_dimension_t &other) const {
        return (min == other.min) &&
            (extent == other.extent) &&
            (stride == other.stride) &&
            (flags == other.flags);
    }

    bool operator!=(const halide_dimension_t &other) const {
        return !(*this == other);
    }
// #endif
} halide_dimension_t;

typedef enum {halide_buffer_flag_host_dirty = 1,
              halide_buffer_flag_device_dirty = 2} halide_buffer_flags;

typedef struct halide_buffer_t {
    /** A device-handle for e.g. GPU memory used to back this buffer. */
    uint64_t device;
    /** The interface used to interpret the above handle. */
    const struct halide_device_interface_t *device_interface;

    uint8_t* host;
    uint64_t flags;
    struct halide_type_t type;
    int32_t dimensions;
    /** The shape of the buffer. Halide does not own this array - you
     * must manage the memory for it yourself. */
    halide_dimension_t *dim;
    /** Pads the buffer up to a multiple of 8 bytes */
    void *padding;

// #ifdef __cplusplus
    bool get_flag(halide_buffer_flags flag) const {
        return (flags & flag) != 0;
    }

    void set_flag(halide_buffer_flags flag, bool value) {
        if (value) {
            flags |= flag;
        } else {
            flags &= ~flag;
        }
    }

    bool host_dirty() const {
        return get_flag(halide_buffer_flag_host_dirty);
    }

    bool device_dirty() const {
        return get_flag(halide_buffer_flag_device_dirty);
    }

    void set_host_dirty(bool v = true) {
        set_flag(halide_buffer_flag_host_dirty, v);
    }

    void set_device_dirty(bool v = true) {
        set_flag(halide_buffer_flag_device_dirty, v);
    }

    size_t number_of_elements() const {
        size_t s = 1;
        for (int i = 0; i < dimensions; i++) {
            s *= dim[i].extent;
        }
        return s;
    }

    uint8_t *begin() const {
        ptrdiff_t index = 0;
        for (int i = 0; i < dimensions; i++) {
            if (dim[i].stride < 0) {
                index += dim[i].stride * (dim[i].extent - 1);
            }
        }
        return host + index * type.bytes();
    }

    uint8_t *end() const {
        ptrdiff_t index = 0;
        for (int i = 0; i < dimensions; i++) {
            if (dim[i].stride > 0) {
                index += dim[i].stride * (dim[i].extent - 1);
            }
        }
        index += 1;
        return host + index * type.bytes();
    }

    size_t size_in_bytes() const {
        return (size_t)(end() - begin());
    }

    uint8_t *address_of(const int *pos) const {
        ptrdiff_t index = 0;
        for (int i = 0; i < dimensions; i++) {
            index += dim[i].stride * (pos[i] - dim[i].min);
        }
        return host + index * type.bytes();
    }

    /** Attempt to call device_sync for the buffer. If the buffer
     * has no device_interface (or no device_sync), this is a quiet no-op.
     * Calling this explicitly should rarely be necessary, except for profiling. */
    int device_sync(void *ctx = NULL) {
        // if (device_interface && device_interface->device_sync) {
        //     return device_interface->device_sync(ctx, this);
        // }
        assert(!device_interface);

        return 0;
    }

    /** Check if an input buffer passed extern stage is a querying
     * bounds. Compared to doing the host pointer check directly,
     * this both adds clarity to code and will facilitate moving to
     * another representation for bounds query arguments. */
    bool is_bounds_query() const {
        // return host == NULL && device == 0;
        assert(device == 0);
        return host == NULL;
    }

// #endif
} halide_buffer_t;

/** The old buffer_t, included for compatibility with old code. Don't
 * use it. */
#ifndef BUFFER_T_DEFINED
#define BUFFER_T_DEFINED
typedef struct buffer_t {
    uint64_t dev;
    uint8_t* host;
    int32_t extent[4];
    int32_t stride[4];
    int32_t min[4];
    int32_t elem_size;
    bool host_dirty;
    bool dev_dirty;
    uint8_t _padding[10 - sizeof(void *)];
} buffer_t;
#endif // BUFFER_T_DEFINED

int halide_downgrade_buffer_t_device_fields(void *user_context, const char *name,
                                             const halide_buffer_t *new_buf, buffer_t *old_buf);

enum halide_error_code_t {
    halide_error_code_success = 0,
    halide_error_code_generic_error = -1,
    halide_error_code_explicit_bounds_too_small = -2,
    halide_error_code_bad_type = -3,
    halide_error_code_access_out_of_bounds = -4,
    halide_error_code_buffer_allocation_too_large = -5,
    halide_error_code_buffer_extents_too_large = -6,
    halide_error_code_constraints_make_required_region_smaller = -7,
    halide_error_code_constraint_violated = -8,
    halide_error_code_param_too_small = -9,
    halide_error_code_param_too_large = -10,
    halide_error_code_out_of_memory = -11,
    halide_error_code_buffer_argument_is_null = -12,
    halide_error_code_debug_to_file_failed = -13,
    halide_error_code_copy_to_host_failed = -14,
    halide_error_code_copy_to_device_failed = -15,
    halide_error_code_device_malloc_failed = -16,
    halide_error_code_device_sync_failed = -17,
    halide_error_code_device_free_failed = -18,
    halide_error_code_no_device_interface = -19,
    halide_error_code_matlab_init_failed = -20,
    halide_error_code_matlab_bad_param_type = -21,
    halide_error_code_internal_error = -22,
    halide_error_code_device_run_failed = -23,
    halide_error_code_unaligned_host_ptr = -24,
    halide_error_code_bad_fold = -25,
    halide_error_code_fold_factor_too_small = -26,
    halide_error_code_requirement_failed = -27,
    halide_error_code_buffer_extents_negative = -28,
    halide_error_code_failed_to_upgrade_buffer_t = -29,
    halide_error_code_failed_to_downgrade_buffer_t = -30,
    halide_error_code_specialize_fail = -31,
    halide_error_code_device_wrap_native_failed = -32,
    halide_error_code_device_detach_native_failed = -33,
    halide_error_code_host_is_null = -34,
    halide_error_code_bad_extern_fold = -35,
    halide_error_code_device_interface_no_device= -36,
    halide_error_code_host_and_device_dirty = -37,
    halide_error_code_buffer_is_null = -38,
    halide_error_code_device_buffer_copy_failed = -39,
    halide_error_code_device_crop_unsupported = -40,
    halide_error_code_device_crop_failed = -41,
    halide_error_code_incompatible_device_interface = -42,
};

int halide_error_failed_to_downgrade_buffer_t(void *user_context,
                                                 const char *name,
                                                 const char *reason);

int halide_downgrade_buffer_t(void *user_context, const char *name,
                               const halide_buffer_t *new_buf, buffer_t *old_buf);

int halide_error_bad_type(void *user_context, const char *func_name,
                           uint8_t code_given, uint8_t correct_code,
                           uint8_t bits_given, uint8_t correct_bits,
                           uint16_t lanes_given, uint16_t correct_lanes);

int halide_error_buffer_allocation_too_large(void *user_context, const char *buffer_name,
                                                uint64_t allocation_size, uint64_t max_size);

int halide_error_buffer_argument_is_null(void *user_context, const char *buffer_name);

int halide_error_buffer_extents_negative(void *user_context, const char *buffer_name,
                                            int dimension, int extent);

int halide_error_buffer_extents_too_large(void *user_context, const char *buffer_name,
                                            int64_t actual_size, int64_t max_size);

int halide_error_constraint_violated(void *user_context, const char *var, int val,
                                          const char *constrained_var, int constrained_val);

int halide_error_host_is_null(void *user_context, const char *func);


int halide_error_failed_to_upgrade_buffer_t(void *user_context,
                                                 const char *name,
                                                 const char *reason);

int halide_upgrade_buffer_t(void *user_context, const char *name, const buffer_t *old_buf,
                            halide_buffer_t *new_buf);

}
