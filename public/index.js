function halide_myfunc(Module, halideBufInput, filterBufPtr, biasInt, halideBufOutput, width, height, doneCallback) {
    let custom_halide_error_buffer_argument_is_null = Module.cwrap('custom_halide_error_buffer_argument_is_null', 'number', ['number', 'number']);
    let custom_halide_malloc = Module.cwrap('custom_halide_malloc', null, ['number', 'number']);
    let memset = Module.cwrap('memset', 'number', ['number', 'number', 'number']);
    let custom_halide_error_bad_type = Module.cwrap('custom_halide_error_bad_type', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number']);
    let custom_halide_error_access_out_of_bounds = Module.cwrap('custom_halide_error_access_out_of_bounds', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number']);
    let custom_halide_error_bad_dimensions = Module.cwrap('custom_halide_error_bad_dimensions', 'number', ['number', 'number', 'number', 'number']);
    let custom_halide_error_buffer_extents_negative = Module.cwrap('custom_halide_error_buffer_extents_negative', 'number', ['number', 'number', 'number', 'number']);
    let custom_halide_error_constraint_violated = Module.cwrap('custom_halide_error_constraint_violated', 'number', ['number', 'number', 'number', 'number', 'number']);
    let custom_halide_error_buffer_allocation_too_large = Module.cwrap('custom_halide_error_buffer_allocation_too_large', 'number', ['number', 'number', 'number', 'number']);
    let custom_halide_error_buffer_extents_too_large = Module.cwrap('custom_halide_error_buffer_extents_too_large', 'number', ['number', 'number', 'number', 'number']);
    let custom_halide_error_host_is_null = Module.cwrap('custom_halide_error_host_is_null', 'number', ['number', 'number']);
    let custom_halide_error_out_of_memory = Module.cwrap('custom_halide_error_out_of_memory', 'number', ['number']);
    let custom_halide_free = Module.cwrap('custom_halide_free', null, ['number', 'number']);

    let get_halide_buffer_data = Module.cwrap('get_halide_buffer_data', 'number', ['number']);

    let halideBufInputDataBytePtr = get_halide_buffer_data(halideBufInput);

    WebAssembly.instantiateStreaming(fetch('bin/myfunc.wasm'), {
        env: {
            memory: Module.wasmMemory,
            halide_error_buffer_argument_is_null: custom_halide_error_buffer_argument_is_null,
            halide_malloc: custom_halide_malloc,
            memset: Module._memset,
            halide_error_bad_type: custom_halide_error_bad_type,
            halide_error_access_out_of_bounds: custom_halide_error_access_out_of_bounds,
            halide_error_bad_dimensions: custom_halide_error_bad_dimensions,
            halide_error_buffer_extents_negative: custom_halide_error_buffer_extents_negative,
            halide_error_constraint_violated: custom_halide_error_constraint_violated,
            halide_error_buffer_allocation_too_large: custom_halide_error_buffer_allocation_too_large,
            halide_error_buffer_extents_too_large: custom_halide_error_buffer_extents_too_large,
            halide_error_host_is_null: custom_halide_error_host_is_null,
            halide_error_out_of_memory: custom_halide_error_out_of_memory,
            halide_free: custom_halide_free
        }
    })
    .then(myFuncWasm => {
        console.time("myfuncHalide");
        let myFuncRetStatus = myFuncWasm.instance.exports.myfunc(halideBufInput, filterBufPtr, biasInt, halideBufOutput);
        console.timeEnd("myfuncHalide");
        // Module.print(`myFunc return status: ${myFuncRetStatus}`);

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

    let intermediate = new Int32Array(inputTypedArray.length);
    convolve(inputTypedArray, intermediate);
    clamp(intermediate, outputTypedArray, 0, 255);
}

function drawAndShowCanvas(canvasCtx, canvasId, loadingId, imageData) {
    let canvasElement = document.getElementById(canvasId);
    // Need to set width and height of canvas (which are different from
    // style.width and style.height set in css):
    canvasElement.width = imageData.width;
    canvasElement.height = imageData.height;
    canvasCtx.putImageData(imageData, 0, 0);
    document.getElementById(loadingId).classList.add('hidden');
    canvasElement.classList.remove('hidden');
}

var Module = { // Note: have to use var rather than let, for compatability with emscripten
    onRuntimeInitialized: () => {
        let srcCtx = document.getElementById('canvas-image-src').getContext('2d');
        let outJsCtx = document.getElementById('canvas-image-out-js').getContext('2d');
        let outCppCtx = document.getElementById('canvas-image-out-cpp').getContext('2d');
        let outHalideCtx = document.getElementById('canvas-image-out-halide').getContext('2d');
        let img = new Image();
        img.addEventListener('load', () => {
            const width = 1024;
            const height = 1024;
            let srcImageData = getImageData(img, width, height);
            let srcArray = getRedChannelUint8ClampedArray(srcImageData);
            srcImageData = convertGrayscaleArrayToImageData(srcArray, width, height);
            drawAndShowCanvas(srcCtx, 'canvas-image-src', 'src-loading', srcImageData);

            srcArray = new Int32Array(srcArray); // convert from Uint8Clamped to Int32
            let filterArray = new Int32Array([-2, -1, 1, -1, -1, 1, -2,
                                              -2, -1, 1, -1, -1, 1, -2,
                                              -2, -1, 1, -1, -1, 1, -2,
                                              -1, -1, 1, 60, -1, 1, -1,
                                              -2, -1, 1, -1, -1, 1, -2,
                                              -2, -1, 1, -1, -1, 1, -2,
                                              -2, -1, 1, -1, -1, 1, -2]);
            const filterWidth = 7;
            const filterHeight = 7;
            let biasInt = 10;

            let outArrayJS = new Int32Array(srcArray.length);
            console.time("myfuncJS");
            myfuncJS(srcArray, width, height, filterArray, filterWidth, filterHeight,
                        biasInt, outArrayJS);
            console.timeEnd("myfuncJS");
            outArrayJS = new Uint8ClampedArray(outArrayJS);
            let outImageDataJS = convertGrayscaleArrayToImageData(outArrayJS, width, height);
            drawAndShowCanvas(outJsCtx, 'canvas-image-out-js', 'out-js-loading', outImageDataJS);

            let srcArrayHeapBytePtr = copyTypedArrayToHeap(srcArray);
            let filterHeapPtr = copyTypedArrayToHeap(filterArray);

            let myfunc_cpp = Module.cwrap('myfunc_cpp', null, ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number']);
            let outArrayCppHeapBytePtr = Module._malloc(srcArray.byteLength);
            console.time("myfunc_cpp");
            myfunc_cpp(srcArrayHeapBytePtr, width, height, filterHeapPtr, filterWidth, filterHeight, biasInt, outArrayCppHeapBytePtr);
            console.timeEnd("myfunc_cpp");
            let outArrayCpp = Module.HEAP32.slice(outArrayCppHeapBytePtr / 4, outArrayCppHeapBytePtr / 4 + width * height);
            // myfunc_cpp produces Int32Array with values between [0, 255], so
            // Int32Array values can be directly copied to Uint8ClampedArray:
            outArrayCpp = new Uint8ClampedArray(outArrayCpp);
            // Values have been copied, so can free original:
            Module._free(outArrayCppHeapBytePtr);
            let outImageDataCpp = convertGrayscaleArrayToImageData(outArrayCpp, width, height);
            if(outArrayCpp.some((v, i) => v != outArrayJS[i])) {
                console.error("C++ not equal to JS");
            }
            drawAndShowCanvas(outCppCtx, 'canvas-image-out-cpp', 'out-cpp-loading', outImageDataCpp);

            let create_halide_buffer = Module.cwrap('create_halide_buffer', 'number', ['number', 'number', 'number']);
            let halideBufInputPtr = create_halide_buffer(srcArrayHeapBytePtr, width, height);
            let filterBufPtr = create_halide_buffer(filterHeapPtr, filterWidth, filterHeight);
            let outArrayHeapBytePtr = Module._malloc(srcArray.byteLength);
            let halideBufOutputPtr = create_halide_buffer(outArrayHeapBytePtr, width, height);

            halide_myfunc(Module, halideBufInputPtr, filterBufPtr, biasInt, halideBufOutputPtr, width, height, () => {
                let outArray = Module.HEAP32.slice(outArrayHeapBytePtr / 4, outArrayHeapBytePtr / 4 + width * height);
                // myfunc produces Int32Array with values between [0, 255], so
                // Int32Array values can be directly copied to Uint8ClampedArray:
                outArray = new Uint8ClampedArray(outArray);
                // Values have been copied, so can free original:
                Module._free(outArrayHeapBytePtr);
                let outImageData = convertGrayscaleArrayToImageData(outArray, width, height);
                drawAndShowCanvas(outHalideCtx, 'canvas-image-out-halide', 'out-halide-loading', outImageData);

                if(outArray.some((v, i) => v != outArrayJS[i])) {
                    console.error("Halide not equal to JS");
                }

                Module._free(srcArrayHeapBytePtr);
                Module._free(filterHeapPtr);
            });
        });
        img.src = 'foden-truck.jpg';
    }
};
