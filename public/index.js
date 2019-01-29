function halide_myfunc(Module, halideBufInput, filterBufPtr, biasBufPtr, halideBufOutput, width, height, doneCallback) {
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
    Module.print(new Int32Array(Module.wasmMemory.buffer).slice(halideBufInputDataBytePtr / 4, halideBufInputDataBytePtr / 4 + width * height));

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
        console.log('loaded wasm');
        let myFuncRetStatus = myFuncWasm.instance.exports.myfunc(halideBufInput, filterBufPtr, biasBufPtr, halideBufOutput);
        Module.print(`myFunc return status: ${myFuncRetStatus}`);
        let halideBufOutputDataBytePtr = get_halide_buffer_data(halideBufOutput);
        Module.print('halideBufOutput data in wasm memory:');
        Module.print(new Int32Array(Module.wasmMemory.buffer).slice(halideBufOutputDataBytePtr / 4, halideBufOutputDataBytePtr / 4 + width * height));

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

// Copies argument TypedArray into heap. Returns byte pointer to the array in
// the heap.
function copyTypedArrayToHeap(typedArray) {
    let heapBytePtr = Module._malloc(typedArray.byteLength);
    // Since heapBytePtr is an address into 8-bit memory, have to copy Uint8
    // view of typedArray's underlying buffer:
    Module.HEAPU8.set(new Uint8Array(typedArray.buffer), heapBytePtr);
    return heapBytePtr;
}

function myfuncJS(inputTypedArray, inputWidth, inputHeight, inputChannels, inputBatches,
                    filterTypedArray, filterWidth, filterHeight, filterChannels,
                    biasTypedArray, outputTypedArray) {
    function getIndex(array, width, height, channels, batches, x, y, z, n, isPadded) {
        return width * height * channels * n + width * height * z + width * y + x;
    }
    function getValue(array, width, height, channels, batches, x, y, z, n, isPadded) {
        let idx = getIndex(array, width, height, channels, batches, x, y, z, n, isPadded);
        if(isPadded && (x < 0 || x >= width || y < 0 || y >= height
                        || z < 0 || z >= channels || n < 0 || n >= batches))
            return 0; // zero padded
        return array[idx];
    }
    function setValue(array, width, height, channels, batches, x, y, z, n, value) {
        array[getIndex(array, width, height, channels, batches, x, y, z, n)] = value;
    }
    function forEachInputIndex(f) {
        for(let n = 0; n < inputBatches; n++) {
            for(let z = 0; z < inputChannels; z++) {
                for(let y = 0; y < inputHeight; y++) {
                    for(let x = 0; x < inputWidth; x++) {
                        f(x, y, z, n);
                    }
                }
            }
        }
    }
    function convolve(inputTypedArray, outputTypedArray) {
        forEachInputIndex((x, y, z, n) => {
            let val = biasTypedArray[z];
            for(let rDomZ = 0; rDomZ < filterChannels; rDomZ++) {
                for(let rDomY = 0; rDomY < filterHeight; rDomY++) {
                    for(let rDomX = 0; rDomX < filterWidth; rDomX++) {
                        let filterVal = getValue(filterTypedArray, filterWidth, filterHeight, filterChannels, 1, rDomX, rDomY, rDomZ, z, false);
                        let inputVal = getValue(inputTypedArray, inputWidth, inputHeight, inputChannels, inputBatches, x + rDomX, y + rDomY, rDomZ, n, true);
                        val += filterVal * inputVal;
                    }
                }
            }
            setValue(outputTypedArray, inputWidth, inputHeight, inputChannels, inputBatches, x, y, z, n, val);
        });
    }
    function clamp(inputTypedArray, outputTypedArray, minValue, maxValue) {
        forEachInputIndex((x, y, z, n) => {
            let inputVal = getValue(inputTypedArray, inputWidth, inputHeight, inputChannels, inputBatches, x, y, z, n, false);
            let val = Math.min(Math.max(inputVal, minValue), maxValue);
            setValue(outputTypedArray, inputWidth, inputHeight, inputChannels, inputBatches, x, y, z, n, val);
        });
    }

    // let intermediate1 = new Int32Array(inputTypedArray);
    // convolve(inputTypedArray, intermediate1);
    // let intermediate2 = new Int32Array(inputTypedArray.length);
    // convolve(intermediate1, intermediate2);
    // intermediate1 = intermediate2;
    // intermediate2 = new Int32Array(inputTypedArray.length);
    // convolve(intermediate1, intermediate2);
    // intermediate1 = intermediate2;
    // intermediate2 = new Int32Array(inputTypedArray.length);
    // convolve(intermediate1, intermediate2);
    // clamp(intermediate2, outputTypedArray, 0, 255);
    let intermediate1 = new Int32Array(inputTypedArray);
    let intermediate2 = new Int32Array(inputTypedArray.length);
    convolve(intermediate1, intermediate2);
    intermediate1 = new Int32Array(intermediate2);
    intermediate2 = new Int32Array(inputTypedArray.length);
    convolve(intermediate1, intermediate2);
    intermediate1 = new Int32Array(intermediate2);
    intermediate2 = new Int32Array(inputTypedArray.length);
    convolve(intermediate1, intermediate2);
    intermediate1 = new Int32Array(intermediate2);
    intermediate2 = new Int32Array(inputTypedArray.length);
    convolve(intermediate1, intermediate2);
    intermediate1 = new Int32Array(intermediate2);
    intermediate2 = new Int32Array(inputTypedArray.length);
    clamp(intermediate1, intermediate2, 0, 255);
    outputTypedArray.set(intermediate2);
}

var Module = { // Note: have to use var rather than let, for compatability with emscripten
    onRuntimeInitialized: () => {
        let srcCtx = document.getElementById('canvas-image-src').getContext('2d');
        let outCtx = document.getElementById('canvas-image-out').getContext('2d');
        let outCtx2 = document.getElementById('canvas-image-out-2').getContext('2d');
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

            srcArray = new Int32Array(srcArray); // convert from Uint8Clamped to Int32
            let filterArray = new Int32Array([0, -1, 0, -1, 5, -1, 0, -1, 0]);
            let biasArray = new Int32Array([10]);

            let outArrayJS = new Int32Array(srcArray.length);
            myfuncJS(srcArray, width, height, 1, 1, filterArray, 3, 3, 1, biasArray, outArrayJS);
            outArrayJS = new Uint8ClampedArray(outArrayJS);
            let outImageDataJS = convertGrayscaleArrayToImageData(outArrayJS, width, height);
            outCtx2.putImageData(outImageDataJS, 0, 0);

            let create_halide_buffer = Module.cwrap('create_halide_buffer', 'number', ['number', 'number', 'number']);
            let create_halide_buffer_1d = Module.cwrap('create_halide_buffer_1d', 'number', ['number', 'number']);
            let srcArrayHeapBytePtr = copyTypedArrayToHeap(srcArray);
            console.log(`srcArrayHeapBytePtr = 0x${srcArrayHeapBytePtr.toString(16)}`);
            let halideBufInputPtr = create_halide_buffer(srcArrayHeapBytePtr, width, height);
            let filterHeapPtr = copyTypedArrayToHeap(filterArray);
            let filterBufPtr = create_halide_buffer(filterHeapPtr, 3, 3);
            let biasHeapPtr = copyTypedArrayToHeap(biasArray);
            let biasBufPtr = create_halide_buffer_1d(biasHeapPtr, 1);
            let outArrayHeapBytePtr = Module._malloc(srcArray.byteLength);
            let halideBufOutputPtr = create_halide_buffer(outArrayHeapBytePtr, width, height);

            console.log('Running Halide myfunc...');
            halide_myfunc(Module, halideBufInputPtr, filterBufPtr, biasBufPtr, halideBufOutputPtr, width, height, () => {
                console.log('Done running Halide myfunc.');
                let outArray = Module.HEAP32.slice(outArrayHeapBytePtr / 4, outArrayHeapBytePtr / 4 + width * height);
                console.log('outArray:');
                console.log(outArray);
                // myfunc produces Int32Array with values between [0, 255], so
                // outArray values can be directly copied to Uint8ClampedArray:
                outArray = new Uint8ClampedArray(outArray);
                let outImageData = convertGrayscaleArrayToImageData(outArray, width, height);
                outCtx.putImageData(outImageData, 0, 0);

                console.log(`all elements equal: ${outArray.every((v, i) => v == outArrayJS[i])}`);
            });

            // TODO: Module._free malloc'd data after demo is complete
        });
        img.src = 'foden-truck.jpg';
    }
};
