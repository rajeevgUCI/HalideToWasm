function halide_myfunc(Module, halideBufInput, halideBufOutput, width, height, doneCallback) {
    Module.print("In JS");

    Module.print(`halideBufInput address = 0x${halideBufInput.toString(16)}`);
    Module.print(`halideBufOutput address = 0x${halideBufOutput.toString(16)}`);

    let custom_halide_error_buffer_argument_is_null = Module.cwrap('custom_halide_error_buffer_argument_is_null', 'number', ['number', 'number']);
    let custom_halide_error_bad_type = Module.cwrap('custom_halide_error_bad_type', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number']);
    let custom_halide_error_access_out_of_bounds = Module.cwrap('custom_halide_error_access_out_of_bounds', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number']);
    let custom_halide_error_bad_dimensions = Module.cwrap('custom_halide_error_bad_dimensions', 'number', ['number', 'number', 'number', 'number']);
    let custom_halide_error_buffer_extents_negative = Module.cwrap('custom_halide_error_buffer_extents_negative', 'number', ['number', 'number', 'number', 'number']);
    let custom_halide_error_constraint_violated = Module.cwrap('custom_halide_error_constraint_violated', 'number', ['number', 'number', 'number', 'number', 'number']);
    let custom_halide_error_buffer_allocation_too_large = Module.cwrap('custom_halide_error_buffer_allocation_too_large', 'number', ['number', 'number', 'number', 'number']);
    let custom_halide_error_buffer_extents_too_large = Module.cwrap('custom_halide_error_buffer_extents_too_large', 'number', ['number', 'number', 'number', 'number']);
    let custom_halide_error_host_is_null = Module.cwrap('custom_halide_error_host_is_null', 'number', ['number', 'number']);

    let get_halide_buffer_data = Module.cwrap('get_halide_buffer_data', 'number', ['number']);

    let halideBufInputDataBytePtr = get_halide_buffer_data(halideBufInput);
    Module.print(`halideBufInput data address = 0x${halideBufInputDataBytePtr.toString(16)}`);
    Module.print('halideBufInput data in wasm memory:');
    Module.print(new Uint8Array(Module.wasmMemory.buffer).slice(halideBufInputDataBytePtr, halideBufInputDataBytePtr + width * height));

    WebAssembly.instantiateStreaming(fetch('bin/myfunc.wasm'), {
        env: {
            memory: Module.wasmMemory,
            halide_error_buffer_argument_is_null: custom_halide_error_buffer_argument_is_null,
            halide_error_bad_type: custom_halide_error_bad_type,
            halide_error_access_out_of_bounds: custom_halide_error_access_out_of_bounds,
            halide_error_bad_dimensions: custom_halide_error_bad_dimensions,
            halide_error_buffer_extents_negative: custom_halide_error_buffer_extents_negative,
            halide_error_constraint_violated: custom_halide_error_constraint_violated,
            halide_error_buffer_allocation_too_large: custom_halide_error_buffer_allocation_too_large,
            halide_error_buffer_extents_too_large: custom_halide_error_buffer_extents_too_large,
            halide_error_host_is_null: custom_halide_error_host_is_null
        }
    })
    .then(myFuncWasm => {
        let myFuncRetStatus = myFuncWasm.instance.exports.myfunc(halideBufInput, halideBufOutput);
        Module.print(`myFunc return status: ${myFuncRetStatus}`);
        let halideBufOutputDataBytePtr = get_halide_buffer_data(halideBufOutput);
        Module.print('halideBufOutput data in wasm memory:');
        Module.print(new Uint8Array(Module.wasmMemory.buffer).slice(halideBufOutputDataBytePtr, halideBufOutputDataBytePtr + width * height));

        doneCallback();
    });
}

// Scales Image img to [scaledWidth, scaledHeight], converts it to ImageData,
// and returns ImageData object.
function getImageData(img, scaledWidth, scaledHeight) {
    // HACK: get image array by drawing to in-memory canvas:
    let canvas = document.createElement('canvas');
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
    return ctx.getImageData(0, 0, scaledWidth, scaledHeight);
}

// Returns Uint8ClampedArray for red channel of ImageData parameter.
function getRedChannelUint8ClampedArray(imageData) {
    let redChannel = new Uint8ClampedArray(imageData.width * imageData.height);
    for(let i = 0; i < redChannel.length; i++) {
        redChannel[i] = imageData.data[i * 4];
    }
    return redChannel;
}

// Returns ImageData corresponding to grayscale image specified by arguments.
function convertGrayscaleArrayToImageData(grayscaleUint8ClampedArray, width, height) {
    let rgbaArray = new Uint8ClampedArray(grayscaleUint8ClampedArray.length * 4);
    for(let i = 0; i < grayscaleUint8ClampedArray.length; i++) {
        rgbaArray[4 * i] = grayscaleUint8ClampedArray[i];
        rgbaArray[4 * i + 1] = grayscaleUint8ClampedArray[i];
        rgbaArray[4 * i + 2] = grayscaleUint8ClampedArray[i];
        rgbaArray[4 * i + 3] = 255; // alpha set to opaque
    }

    return new ImageData(rgbaArray, width, height);
}

var Module = { // Note: have to use var rather than let, for compatability with emscripten
    onRuntimeInitialized: () => {
        let srcCtx = document.getElementById('canvas-image-src').getContext('2d');
        let outCtx = document.getElementById('canvas-image-out').getContext('2d');
        let img = new Image();
        img.addEventListener('load', () => {
            const width = 512;
            const height = 512;
            let srcImageData = getImageData(img, width, height);
            let srcArray = getRedChannelUint8ClampedArray(srcImageData);
            console.log('srcArray:');
            console.log(srcArray);
            srcImageData = convertGrayscaleArrayToImageData(srcArray, width, height);
            srcCtx.putImageData(srcImageData, 0, 0);

            let create_halide_buffer = Module.cwrap('create_halide_buffer', 'number', ['number', 'number', 'number']);
            let srcArrayHeapBytePtr = Module._malloc(srcArray.length * srcArray.BYTES_PER_ELEMENT);
            Module.HEAPU8.set(srcArray, srcArrayHeapBytePtr);
            console.log(`srcArrayHeapBytePtr = 0x${srcArrayHeapBytePtr.toString(16)}`);
            let halideBufInputPtr = create_halide_buffer(srcArrayHeapBytePtr, width, height);
            let outArrayHeapBytePtr = Module._malloc(srcArray.length * srcArray.BYTES_PER_ELEMENT);
            let halideBufOutputPtr = create_halide_buffer(outArrayHeapBytePtr, width, height);

            halide_myfunc(Module, halideBufInputPtr, halideBufOutputPtr, width, height, () => {
                let outArray = Module.HEAPU8.slice(outArrayHeapBytePtr, outArrayHeapBytePtr + width * height);
                console.log('outArray:');
                console.log(outArray);
                let outImageData = convertGrayscaleArrayToImageData(outArray, width, height);
                outCtx.putImageData(outImageData, 0, 0);
            });

            // TODO: Module._free malloc'd data after demo is complete
        });
        img.src = 'foden-truck.jpg';
    }
};
