all:
	mkdir -p ../public/bin/
	emcc --js-library halide_myfunc.js *.cpp -s EXPORTED_FUNCTIONS='["_main", "_halide_downgrade_buffer_t", "_halide_downgrade_buffer_t_device_fields", "_halide_error_bad_type", "_halide_error_buffer_allocation_too_large", "_halide_error_buffer_argument_is_null", "_halide_error_buffer_extents_negative", "_halide_error_buffer_extents_too_large", "_halide_error_constraint_violated", "_halide_error_host_is_null", "_halide_upgrade_buffer_t", "_get_data"]' -s EXTRA_EXPORTED_RUNTIME_METHODS='["cwrap"]' -o ../public/bin/main.html
	@ # emcc --js-library halide_myfunc.js *.cpp -s EXPORTED_FUNCTIONS='["_main", "_halide_downgrade_buffer_t", "_halide_downgrade_buffer_t_device_fields", "_halide_error_bad_type", "_halide_error_buffer_allocation_too_large", "_halide_error_buffer_argument_is_null", "_halide_error_buffer_extents_negative", "_halide_error_buffer_extents_too_large", "_halide_error_constraint_violated", "_halide_error_host_is_null", "_halide_upgrade_buffer_t"]' -s EXTRA_EXPORTED_RUNTIME_METHODS='["cwrap"]' -o ../public/bin/main.html

clean:
	$(RM) -r ../public/bin
