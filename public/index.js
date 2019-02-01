function halide_myfunc(Module, halideBufInput, filterBufPtr, biasInt, halideBufOutput, width, height, doneCallback) {
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
        let myFuncRetStatus = myFuncWasm.instance.exports.myfunc(halideBufInput, filterBufPtr, biasInt, halideBufOutput);
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

function myfuncJS(inputTypedArray, inputWidth, inputHeight,
                    filterTypedArray, filterWidth, filterHeight,
                    biasInt, outputTypedArray) {
    function getIndex(array, width, height, x, y) {
        return width * y + x;
    }
    function getValue(array, width, height, x, y, isPadded) {
        let idx = getIndex(array, width, height, x, y);
        if(x < 0 || x >= width || y < 0 || y >= height) {
            if(isPadded) {
                return 0; // zero-padded
            }
            else {
                throw new Error("getValue: index out of bounds and not padded");
            }
        }
        // else if not isPadded, will return undefined when index out of bounds:
        return array[idx];
    }
    function setValue(array, width, height, x, y, value) {
        array[getIndex(array, width, height, x, y)] = value;
    }
    function convolve(inputTypedArray, outputTypedArray) {
        for(let y = 0; y < inputHeight; y++) {
            for(let x = 0; x < inputWidth; x++) {
                let val = biasInt;
                for(let rDomY = 0; rDomY < filterHeight; rDomY++) {
                    for(let rDomX = 0; rDomX < filterWidth; rDomX++) {
                        let filterVal = getValue(filterTypedArray, filterWidth, filterHeight,
                                                    rDomX, rDomY, false);
                        let inputVal = getValue(inputTypedArray, inputWidth, inputHeight,
                                                x + rDomX, y + rDomY, true);
                        val += filterVal * inputVal;
                    }
                }
                setValue(outputTypedArray, inputWidth, inputHeight, x, y, val);
            }
        }
    }
    function clamp(inputTypedArray, outputTypedArray, minValue, maxValue) {
        for(let y = 0; y < inputHeight; y++) {
            for(let x = 0; x < inputWidth; x++) {
                let inputVal = getValue(inputTypedArray, inputWidth, inputHeight, x, y, false);
                let val = Math.min(Math.max(inputVal, minValue), maxValue);
                setValue(outputTypedArray, inputWidth, inputHeight, x, y, val);
            }
        }
    }

    const NUM_CONVOLVES = 4;
    let intermediate1 = inputTypedArray;
    let intermediate2 = new Int32Array(inputTypedArray.length);
    for(let i = 0; i < NUM_CONVOLVES; i++) {
        convolve(intermediate1, intermediate2);
        intermediate1 = intermediate2;
        intermediate2 = new Int32Array(inputTypedArray.length);
    }
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
            const filterWidth = 3;
            const filterHeight = 3;
            let biasInt = 10;

            let outArrayJS = new Int32Array(srcArray.length);
            myfuncJS(srcArray, width, height, filterArray, filterWidth, filterHeight,
                        biasInt, outArrayJS);
            outArrayJS = new Uint8ClampedArray(outArrayJS);
            let outImageDataJS = convertGrayscaleArrayToImageData(outArrayJS, width, height);
            outCtx2.putImageData(outImageDataJS, 0, 0);
            console.log('outArrayJS:');
            console.log(outArrayJS);

            let create_halide_buffer = Module.cwrap('create_halide_buffer', 'number', ['number', 'number', 'number']);
            let srcArrayHeapBytePtr = copyTypedArrayToHeap(srcArray);
            console.log(`srcArrayHeapBytePtr = 0x${srcArrayHeapBytePtr.toString(16)}`);
            let halideBufInputPtr = create_halide_buffer(srcArrayHeapBytePtr, width, height);
            let filterHeapPtr = copyTypedArrayToHeap(filterArray);
            let filterBufPtr = create_halide_buffer(filterHeapPtr, filterWidth, filterHeight);
            let outArrayHeapBytePtr = Module._malloc(srcArray.byteLength);
            let halideBufOutputPtr = create_halide_buffer(outArrayHeapBytePtr, width, height);

            console.log('Running Halide myfunc...');
            halide_myfunc(Module, halideBufInputPtr, filterBufPtr, biasInt, halideBufOutputPtr, width, height, () => {
                console.log('Done running Halide myfunc.');
                let outArray = Module.HEAP32.slice(outArrayHeapBytePtr / 4, outArrayHeapBytePtr / 4 + width * height);
                // myfunc produces Int32Array with values between [0, 255], so
                // outArray values can be directly copied to Uint8ClampedArray:
                outArray = new Uint8ClampedArray(outArray);
                let outImageData = convertGrayscaleArrayToImageData(outArray, width, height);
                outCtx.putImageData(outImageData, 0, 0);
                console.log('outArray:');
                console.log(outArray);

                console.log(`all elements equal: ${outArray.every((v, i) => v == outArrayJS[i])}`);
            });

            // TODO: Module._free malloc'd data after demo is complete
        });
        img.src = 'foden-truck.jpg';
    }
};
