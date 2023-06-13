import {GPU} from 'gpu.js'
import type {IKernelRunShortcut} from 'gpu.js'
import type {ColorLineDrawValue, LineDrawValue, TheFile} from '@/common/types/apiCommonTypes'

const HSL_FUNC_START_CODE = `
let R=0,G=0,B=0,Max=0,Min=0,H=0, S=0, L=0,a=0,k=0,D=0;
const pixel = src[this.thread.y][this.thread.x]
R = pixel.r;
G = pixel.g;
B = pixel.b;
Max = Math.max(R,Math.max(G,B));
Min = Math.min(R,Math.min(G,B));
L=(Max + Min)/2
D = Max - Min;

if (D !== 0) {
    S = (L === 0 || L === 1) ? 0 : (Max - L) / Math.min(L, 1 - L);
    if(Max==R){
        H = (G - B) / D + (G < B ? 6 : 0); 
    } else if(Max==G){
        H = (B - R) / D + 2;
    } else if(Max==B){
        H = (R - G) / D + 4;
    }
    H = H /6;
}
`
const HSL_FUNC_END_CODE = `
H = H * 360;
if (H < 0) {
    H += 360;
}
a = S * Math.min(L, 1 - L);
k = (0 + H/30) % 12;
R= L - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))
k = (8 + H/30) % 12;
G= L - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))
k = (4 + H/30) % 12;
B= L - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))

`
const HSV_FUNC_START_CODE = `
let R=0,G=0,B=0,Max=0,Min=0,H=0, S=0, L=0,a=0,k=0,D=0,V=0;
const pixel = src[this.thread.y][this.thread.x]
R = pixel.r;
G = pixel.g;
B = pixel.b;
Max = Math.max(R,Math.max(G,B));
Min = Math.min(R,Math.min(G,B));
L=(Max + Min)/2
D = Max - Min;

if (D !== 0) {
    S = (L === 0 || L === 1) ? 0 : (Max - L) / Math.min(L, 1 - L);
    if(Max==R){
        H = (G - B) / D + (G < B ? 6 : 0); 
    }else if(Max==G){
        H = (B - R) / D + 2;
    }else if(Max==B){
        H = (R - G) / D + 4;
    }
    H = H /6;
}
V = L + S * Math.min(L, 1 - L);
S= V === 0? 0 : 2 * (1 - L / V)
`
const HSV_FUNC_END_CODE = `
L = V * (1 - S/2);
S=(L === 0 || L === 1)? 0 : ((V - L) / Math.min(L, 1 - L)) 
H = H * 360%360;
if (H < 0) {
    H += 360;
}
a = S * Math.min(L, 1 - L);
k = (0 + H/30) % 12;
R= L - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))
k = (8 + H/30) % 12;
G= L - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))
k = (4 + H/30) % 12;
B= L - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))
`

async function getImageData(imgUrl: string): Promise<ImageData> {
    const image = new Image()
    image.src = imgUrl
    await new Promise((resolve) => image.addEventListener('load', resolve))
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d') as CanvasRenderingContext2D
    canvas.width = image.width
    canvas.height = image.height
    context.drawImage(image, 0, 0)
    return context.getImageData(0, 0, image.width, image.height)
}

// {image}:{image:ImageData}
function createImageProcessGpu() {
    // let canvas=document.getElementById('create-image-process-gpu-canvas') as HTMLCanvasElement
    // if(!canvas){
    //     canvas = document.createElement('canvas') as HTMLCanvasElement
    //     canvas.style.display='none'
    //     canvas.id='create-image-process-gpu-canvas'
    // }
    // canvas.style.display = 'none'
    const canvas = document.createElement('canvas') as HTMLCanvasElement
    const gl = canvas.getContext('webgl2', {
        preserveDrawingBuffer: true
    }) as WebGL2RenderingContext
    const gpu = new GPU({
        canvas,
        context: gl
    })
    return {gpu}
}

function makeHSLProcess(
    image: ImageData,
    gpu: GPU,
    paramCode: string,
    processCode: string,
    processCodeEnd = ''
) {
    const func = eval(`(function (src, ${paramCode}) {
        ${HSL_FUNC_START_CODE}
        ${processCode}
        ${HSL_FUNC_END_CODE}
        ${processCodeEnd}
        this.color(R, G, B)
    })`)
    return gpu
        .createKernel(func)
        .setOutput([image.width, image.height])
        .setGraphical(true)
}

function makeHSVProcess(
    image: ImageData,
    gpu: GPU,
    paramCode: string,
    processCode: string,
    processCodeEnd = ''
) {
    const func = eval(`(function (src, ${paramCode}) {
        ${HSV_FUNC_START_CODE}
        ${processCode}
        ${HSV_FUNC_END_CODE}
        ${processCodeEnd}
        this.color(R, G, B)
    })`)
    return gpu
        .createKernel(func)
        .setOutput([image.width, image.height])
        .setGraphical(true)
}

function getConvolutionImageData(convolution: IKernelRunShortcut) {
    const imageData = new ImageData(
        convolution.getPixels() as unknown as Uint8ClampedArray,
        convolution.output[0],
        convolution.output[1]
    )
    convolution.destroy()
    return imageData
}

function colorFormula({
                          image,
                          gpu,
                          value
                      }: {
    image: ImageData
    gpu: GPU
    value: string
}) {
    if (!value) {
        value = 'r,g,b'
    }
    const func = eval(`(function (src) {
        let r = 0, g = 0, b = 0;
        const pixel = src[this.thread.y][this.thread.x];
        r = pixel.r;
        g = pixel.g;
        b = pixel.b;
        this.color(${value});
    })`)
    const convolution = gpu
        .createKernel(func)
        .setOutput([image.width, image.height])
        .setGraphical(true)
    convolution(image)
    return {image: getConvolutionImageData(convolution)}
}

function colorLine({
                       image,
                       gpu,
                       value
                   }: {
    image: ImageData
    gpu: GPU
    value: ColorLineDrawValue
}) {
    const convolution = gpu
        .createKernel(eval(`(function (
            src,
            rArr,
            gArr,
            bArr
        ) {
            let r = 0,
                g = 0,
                b = 0
            const pixel = src[this.thread.y][this.thread.x]
            r = rArr[Math.round(pixel.r * 255)]
            g = gArr[Math.round(pixel.g * 255)]
            b = bArr[Math.round(pixel.b * 255)]
            this.color(r, g, b)
        })`))
        .setOutput([image.width, image.height])
        .setGraphical(true);
    convolution(image, value.r.pointsY, value.g.pointsY, value.b.pointsY);
    return {image: getConvolutionImageData(convolution)}
}

function saturation({
                        image,
                        gpu,
                        value
                    }: {
    image: ImageData
    gpu: GPU
    value: number
}) {
    const inc = (value - 50) / (100 / 2)
    const convolution = makeHSLProcess(image, gpu, 'inc_S', 'S=S+S*inc_S')
    convolution(image, inc)
    return {image: getConvolutionImageData(convolution)};
}

function brightness({
                        image,
                        gpu,
                        value
                    }: {
    image: ImageData
    gpu: GPU
    value: number
}) {
    const inc = (value - 50) / (100 / 2);
    const convolution = makeHSLProcess(image, gpu, 'inc_L', 'L=L+L*inc_L');
    convolution(image, inc);
    return {image: getConvolutionImageData(convolution)};
}

function hue({
                 image,
                 gpu,
                 value
             }: {
    image: ImageData
    gpu: GPU
    value: number
}) {
    const inc = value
    const convolution = makeHSLProcess(
        image,
        gpu,
        'inc_H',
        'H=H*360;H=(H+inc_H)/360'
    )
    convolution(image, inc)
    return {image: getConvolutionImageData(convolution)}
}

function contrastRatio({image, gpu, value}: {
    image: ImageData
    gpu: GPU
    value: number
}) {
    const contrast = value / 50
    const convolution = gpu
        .createKernel(eval(`(function (src: any, contrast: number) {
            let r = 0,
                g = 0,
                b = 0
            const pixel = src[this.thread.y][this.thread.x]
            r = (pixel.r - 0.5) * contrast + 0.5
            g = (pixel.g - 0.5) * contrast + 0.5
            b = (pixel.b - 0.5) * contrast + 0.5
            this.color(r, g, b)
        })`))
        .setOutput([image.width, image.height])
        .setGraphical(true)
    convolution(image, contrast)
    return {image: getConvolutionImageData(convolution)}
}

function colorScaleLine({
                            image,
                            gpu,
                            value
                        }: {
    image: ImageData
    gpu: GPU
    value: LineDrawValue
}) {
    const convolution = gpu
        .createKernel(eval(`(function (src, arr) {
            let r = 0,
                g = 0,
                b = 0
            const pixel = src[this.thread.y][this.thread.x]
            r = pixel.r
            g = pixel.g
            b = pixel.b
            r = arr[Math.round(r * 255)]
            g = arr[Math.round(g * 255)]
            b = arr[Math.round(b * 255)]
            this.color(r, g, b)
        })`))
        .setOutput([image.width, image.height])
        .setGraphical(true);
    convolution(image, value.pointsY);
    return {image: getConvolutionImageData(convolution)}
}

function saturationLine({
                            image,
                            gpu,
                            value
                        }: {
    image: ImageData
    gpu: GPU
    value: LineDrawValue
}) {
    const convolution = makeHSLProcess(
        image,
        gpu,
        'arr',
        // `S = (rArr[Math.round(R*255)] * S+gArr[Math.round(G*255)] * S+bArr[Math.round(B*255)] * S)/3;`)
        `S = arr[Math.round(S*255)];`
    )
    convolution(image, value.pointsY)
    return {image: getConvolutionImageData(convolution)}
}

function brightnessLine({
                            image,
                            gpu,
                            value
                        }: {
    image: ImageData
    gpu: GPU
    value: LineDrawValue
}) {
    const convolution = makeHSLProcess(
        image,
        gpu,
        'arr',
        // `L = (rArr[Math.round(R*255)] * L+gArr[Math.round(G*255)] * L+bArr[Math.round(B*255)] * L)/3;`
        `L = arr[Math.round(L*255)];`
    )
    convolution(image, value.pointsY)
    return {image: getConvolutionImageData(convolution)}
}

function hueLine({
                     image,
                     gpu,
                     value
                 }: {
    image: ImageData
    gpu: GPU
    value: LineDrawValue
}) {
    const convolution = makeHSLProcess(
        image,
        gpu,
        'hueArr',
        // `H = hueArr[Math.round(H*360)]*H`
        `H = H+(hueArr[Math.round(H*360)]-0.5)*2`
    )
    convolution(image, value.pointsY)
    return {image: getConvolutionImageData(convolution)}
}

function hueSaturationLine({
                               image,
                               gpu,
                               value
                           }: {
    image: ImageData
    gpu: GPU
    value: LineDrawValue
}) {
    const convolution = makeHSLProcess(
        image,
        gpu,
        'hueArr',
        // `H = hueArr[Math.round(H*360)]*H`
        `S = S*hueArr[Math.round(H*360)]*2`
    )
    convolution(image, value.pointsY)
    return {image: getConvolutionImageData(convolution)}
}

function hueBrightnessLine({
                               image,
                               gpu,
                               value
                           }: {
    image: ImageData
    gpu: GPU
    value: LineDrawValue
}) {
    const convolution = makeHSLProcess(
        image,
        gpu,
        'hueArr',
        `L=L*hueArr[Math.round(H*360)]*2`
    )
    convolution(image, value.pointsY)
    return {image: getConvolutionImageData(convolution)}
}

function hueLightnessLine({
                              image,
                              gpu,
                              value
                          }: {
    image: ImageData
    gpu: GPU
    value: LineDrawValue
}) {
    const convolution = makeHSVProcess(
        image,
        gpu,
        'hueArr',
        `V=V*hueArr[Math.round(H*360)]*2`
    )
    convolution(image, value.pointsY)
    return {image: getConvolutionImageData(convolution)}
}

function lightnessLine({
                           image,
                           gpu,
                           value
                       }: {
    image: ImageData
    gpu: GPU
    value: LineDrawValue
}) {
    const convolution = makeHSVProcess(
        image,
        gpu,
        'arr',
        `V = arr[Math.round(V*255)];`
    )
    convolution(image, value.pointsY)
    return {image: getConvolutionImageData(convolution)}
}

async function getImageDataFromTheFile({file}: { file: TheFile }) {
    const image = await getImageData(file.url)
    return {image}
}

export const imageFuncMap = {
    getImageDataFromTheFile,
    createImageProcessGpu,
    colorFormula,
    saturation,
    brightness,
    hue,
    contrastRatio,
    colorLine,
    colorScaleLine,
    saturationLine,
    brightnessLine,
    hueLine,
    hueSaturationLine,
    hueBrightnessLine,
    hueLightnessLine,
    lightnessLine
}
