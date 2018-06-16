function printFromMemory(wasmMemory, strPtr)
{
    let strMemory = new Uint8Array(wasmMemory.buffer, strPtr);
    let endIndex = strMemory.findIndex((e) => e == 0);
    strMemory = strMemory.slice(0, endIndex);
    let strValue = new TextDecoder('utf8').decode(strMemory);
    console.log(strValue);
    return 0;
}

function main() {
    let globalMemory = new WebAssembly.Memory({initial: 2});

    WebAssembly.instantiateStreaming(fetch('memory.wasm'), {
        env: {
            memory: globalMemory
        }
    })
    .then(memoryWasm => {
        console.log(memoryWasm.instance.exports);

        WebAssembly.instantiateStreaming(fetch('myassert.wasm'), {
            env: {
                memory: globalMemory,
                _Z9wasmprintPKc: (strPtr) => printFromMemory(globalMemory, strPtr)
            }
        })
        .then(myAssertWasm => {
            console.log(myAssertWasm.instance.exports);

            WebAssembly.instantiateStreaming(fetch('halide_buffer_create.wasm'), {
                env: {
                    memory: globalMemory,
                    malloc: memoryWasm.instance.exports.malloc,
                    memset: memoryWasm.instance.exports.memset
                }
            })
            .then(halideBufferCreateWasm => {
                console.log(halideBufferCreateWasm.instance.exports);

                WebAssembly.instantiateStreaming(fetch('data_create.wasm'), {
                    env: {
                        memory: globalMemory,
                        malloc: memoryWasm.instance.exports.malloc,
                        memset: memoryWasm.instance.exports.memset
                    }
                })
                .then(dataCreateWasm => {
                    console.log(dataCreateWasm.instance.exports);

                    let dataPtr = dataCreateWasm.instance.exports._Z11data_createv();
                    let dataWidth = dataCreateWasm.instance.exports._Z9get_widthv();
                    let dataHeight = dataCreateWasm.instance.exports._Z10get_heightv();

                    console.log(new Int32Array(globalMemory.buffer, dataPtr, dataWidth * dataHeight));

                    let halideBuf = halideBufferCreateWasm.instance.exports._Z13create_bufferPiii(dataPtr, dataWidth, dataHeight);
                    let halideBufSize = halideBufferCreateWasm.instance.exports._Z24get_halide_buffer_t_sizev();
                    let halideBufData = halideBufferCreateWasm.instance.exports._Z8get_dataP15halide_buffer_t(halideBuf);
                    console.log(halideBuf);
                    console.log(halideBufData);
                    console.log(dataPtr);
                    console.log(new Int32Array(globalMemory.buffer, halideBufData));

                    WebAssembly.instantiateStreaming(fetch('halide_imports.wasm'), {
                        env: {
                            memory: globalMemory,
                            memset: memoryWasm.instance.exports.memset,
                            _Z6assertbPKc: myAssertWasm.instance.exports._Z6assertbPKc,
                            _Z9wasmprintPKc: (strPtr) => printFromMemory(globalMemory, strPtr)
                        }
                    })
                    .then(halideImportsWasm => {
                        console.log(halideImportsWasm.instance.exports);

                         WebAssembly.instantiateStreaming(fetch('myfunc.wasm'), {
                            env: {
                                memory: globalMemory,
                                halide_downgrade_buffer_t: halideImportsWasm.instance.exports._Z25halide_downgrade_buffer_tPvPKcPK15halide_buffer_tP8buffer_t,
                                halide_downgrade_buffer_t_device_fields: halideImportsWasm.instance.exports._Z39halide_downgrade_buffer_t_device_fieldsPvPKcPK15halide_buffer_tP8buffer_t,
                                halide_error_bad_type: halideImportsWasm.instance.exports._Z21halide_error_bad_typePvPKchhhhtt,
                                halide_error_buffer_allocation_too_large: halideImportsWasm.instance.exports._Z40halide_error_buffer_allocation_too_largePvPKcyy,
                                halide_error_buffer_argument_is_null: halideImportsWasm.instance.exports._Z36halide_error_buffer_argument_is_nullPvPKc,
                                halide_error_buffer_extents_negative: halideImportsWasm.instance.exports._Z36halide_error_buffer_extents_negativePvPKcii,
                                halide_error_buffer_extents_too_large: halideImportsWasm.instance.exports._Z37halide_error_buffer_extents_too_largePvPKcxx,
                                halide_error_constraint_violated: halideImportsWasm.instance.exports._Z32halide_error_constraint_violatedPvPKciS1_i,
                                halide_error_host_is_null: halideImportsWasm.instance.exports._Z25halide_error_host_is_nullPvPKc,
                                halide_upgrade_buffer_t: halideImportsWasm.instance.exports._Z23halide_upgrade_buffer_tPvPKcPK8buffer_tP15halide_buffer_t
                            }
                        })
                        .then(myFuncWasm => {
                            console.log(myFuncWasm.instance.exports);

                            let myFuncRetStatus = myFuncWasm.instance.exports.myfunc(halideBuf);
                            console.log(myFuncRetStatus);
                            console.log(new Int32Array(globalMemory.buffer, dataPtr, dataWidth * dataHeight));
                        });
                    });
                });
            });
        });
    });
}

window.onload = () => main();
