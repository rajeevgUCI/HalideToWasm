mergeInto(LibraryManager.library, {
    halide_myfunc: function(halideBuf) {
        Module.print(`halideBuf = ${halideBuf}`);

        let halide_downgrade_buffer_t = Module.cwrap('halide_downgrade_buffer_t', 'number', ['number', 'number', 'number', 'number']);
        let halide_downgrade_buffer_t_device_fields = Module.cwrap('halide_downgrade_buffer_t_device_fields', 'number', ['number', 'number', 'number', 'number']);
        let halide_error_bad_type = Module.cwrap('halide_error_bad_type', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number']);
        let halide_error_buffer_allocation_too_large = Module.cwrap('halide_error_buffer_allocation_too_large', 'number', ['number', 'number', 'number', 'number']);
        let halide_error_buffer_argument_is_null = Module.cwrap('halide_error_buffer_argument_is_null', 'number', ['number', 'number']);
		let halide_error_buffer_extents_negative = Module.cwrap('halide_error_buffer_extents_negative', 'number', ['number', 'number', 'number', 'number']);
		let halide_error_buffer_extents_too_large = Module.cwrap('halide_error_buffer_extents_too_large', 'number', ['number', 'number', 'number', 'number']);
		let halide_error_constraint_violated = Module.cwrap('halide_error_constraint_violated', 'number', ['number', 'number', 'number', 'number', 'number']);
		let halide_error_host_is_null = Module.cwrap('halide_error_host_is_null', 'number', ['number', 'number']);
		let halide_upgrade_buffer_t = Module.cwrap('halide_upgrade_buffer_t', 'number', ['number', 'number', 'number', 'number']);
		let get_data = Module.cwrap('get_data', 'number', ['number']);

        Module.print(`memory = ${Module.wasmMemory}`);
        Module.print(`halideBuf data = ${get_data(halideBuf)}`);
        let halideBufData_32Bit = get_data(halideBuf) / 4; // divide 8-bit address by 4 to get 32-bit address
        Module.print(`first two elements of halideBuf data in memory: ${new Int32Array(Module.wasmMemory.buffer).slice(halideBufData_32Bit, halideBufData_32Bit + 2)}`);

        WebAssembly.instantiateStreaming(fetch('myfunc.wasm'), {
            env: {
                memory: Module.wasmMemory,
                halide_downgrade_buffer_t: halide_downgrade_buffer_t,
                halide_downgrade_buffer_t_device_fields: halide_downgrade_buffer_t_device_fields,
                halide_error_bad_type: halide_error_bad_type,
                halide_error_buffer_allocation_too_large: halide_error_buffer_allocation_too_large,
                halide_error_buffer_argument_is_null: halide_error_buffer_argument_is_null,
                halide_error_buffer_extents_negative: halide_error_buffer_extents_negative,
                halide_error_buffer_extents_too_large: halide_error_buffer_extents_too_large,
                halide_error_constraint_violated: halide_error_constraint_violated,
                halide_error_host_is_null: halide_error_host_is_null,
                halide_upgrade_buffer_t: halide_upgrade_buffer_t
            }
        })
        .then(myFuncWasm => {
            let myFuncRetStatus = myFuncWasm.instance.exports.myfunc(halideBuf);
            Module.print(`myFunc return status: ${myFuncRetStatus}`);
        });
    }
});
