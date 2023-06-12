import type {IGPUSettings} from 'gpu.js'
import {GPU} from 'gpu.js';
import {rgb2hsl, rgb2hsv} from "./utils";
import type {FuncApi} from "@/common/types/apiCommonTypes";
import {imageFuncMap} from "@/common/funcApis/imageFuncApiDef";

declare global {  //设置全局属性
    interface Window {  //window对象属性
        gpu: GPU;   //加入对象
    }
}
type StoreImg = ImageData

export interface FuncProcessGpuRecord {
    img: StoreImg
    funcApi: FuncApi
}

function copy(obj: any) {
    return JSON.parse(JSON.stringify(obj))
}

async function getImageData(imgUrl: string): Promise<ImageData> {
    const image = new Image();
    image.src = imgUrl;
    await new Promise(resolve => image.addEventListener("load", resolve));
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    const ratio = 1;
    canvas.width = image.width * ratio;
    canvas.height = image.height * ratio;
    context.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width * ratio, image.height * ratio);
    return context.getImageData(0, 0, image.width * ratio, image.height * ratio)
}

class ImageProcessGpu {
    gpu: GPU
    orgImg: StoreImg = new ImageData(1, 1)
    redoList: FuncProcessGpuRecord[] = []
    undoList: FuncProcessGpuRecord[] = []
    currentImg: StoreImg = new ImageData(1, 1)
    notApplyImg: StoreImg = new ImageData(1, 1)//未应用时的
    imgSize = {width: 0, height: 0}
    funcKeys: any = {}
    imgSrc: string
    canvasId: string
    analysisData: {
        count: {
            r: number[],
            g: number[],
            b: number[],
            scale: number[],
        }
    } = {
        count: {
            r: new Array(256).fill(0),
            g: new Array(256).fill(0),
            b: new Array(256).fill(0),
            scale: new Array(256).fill(0)
        }
    }

    constructor(img: string, canvasId: string, setting: IGPUSettings = {}) {
        let canvas = document.getElementById(canvasId) as HTMLCanvasElement
        const gl = canvas.getContext('webgl2', {preserveDrawingBuffer: true}) as WebGL2RenderingContext;
        this.gpu = new GPU({
            canvas,
            context: gl,
        });
        this.funcKeys = imageFuncMap
        // this.gpu = new GPU(setting);
        this.canvasId = canvasId
        window.gpu = this.gpu
        this.imgSrc = img
    }

    getPointData(x: number, y: number) {
        if (!this.currentImg) {
            return
        }
        x = Math.round(this.imgSize.width * x)
        y = Math.round(this.imgSize.height * y)
        let rSum = 0
        let gSum = 0
        let bSum = 0
        let wSize = 10
        for (let i = 0; i < wSize; i++) {
            for (let j = 0; j < wSize; j++) {
                const index = ((y + j - wSize / 2) * this.imgSize.width + (x + i - wSize / 2)) * 4
                const r = this.currentImg.data[index] / 255
                const g = this.currentImg.data[index + 1] / 255
                const b = this.currentImg.data[index + 2] / 255
                rSum += r
                gSum += g
                bSum += b
            }
        }
        const r = rSum / wSize / wSize
        const g = gSum / wSize / wSize
        const b = bSum / wSize / wSize
        const hsl = rgb2hsl(r, g, b)
        const hsv = rgb2hsv(r, g, b)
        return {hsl, hsv, rgb: [r, g, b] as [number, number, number]}
    }

    imgDataToShow(storeImg: StoreImg) {
        const func = this.gpu.createKernel(function (src: any) {
            let r = 0, g = 0, b = 0;
            const pixel = src[this.thread.y][this.thread.x];
            r = pixel.r;
            g = pixel.g;
            b = pixel.b;
            this.color(r, g, b);
        })
            .setOutput([storeImg.width, storeImg.height])
            .setGraphical(true)
        func(storeImg)
        func.destroy(false)
    }

    getImgSize() {
        this.imgSize.height = (this.currentImg).height
        this.imgSize.width = (this.currentImg).width

    }

    async initImageCanvas(imgSrc: string) {
        let imageData = await getImageData(imgSrc)
        imageData = imageFuncMap.colorFormula({image: imageData, gpu: this.gpu, value: "r,g,b"}).image
        this.orgImg = imageData
        this.currentImg = imageData
        this.notApplyImg = imageData
        this.analysisImage(this.currentImg)
        this.getImgSize()
    }

    async func({image, key, paramsDic}:
                   {
                       image: StoreImg,
                       key: string,
                       paramsDic: {}
                   }) {
        let theFunc = this.funcKeys[key]
        let msg, state
        try {
            const imageData = theFunc({...paramsDic, image, gpu: this.gpu,}).image
            return {
                state: 1,
                img: imageData,
                msg: ""
            }
        } catch (e) {
            console.log(e)
            msg = e
        }
        return {
            state: 0,
            img: null,
            msg: msg
        }

    }


    async doFunc(funcApi: FuncApi, apply = true) {
        let returnImg = this.currentImg
        const key = funcApi.key
        const paramsDic = {} as any
        funcApi.params?.forEach(item => {
            if (item.config.value !== undefined) {
                paramsDic[item.key] = item.config.value
            }
        })
        const data = await this.func({
            image: this.currentImg,
            key,
            paramsDic
        })
        if (data.state === 1 && data.img) {
            if (apply) {
                this.currentImg = data.img
                this.analysisImage(this.currentImg)
                returnImg = this.currentImg
                this.undoList.push({img: this.currentImg, funcApi: copy(funcApi)})
            } else {
                this.notApplyImg = data.img
                returnImg = this.notApplyImg
            }
        } else {
        }
        return returnImg
    }

    redo() {
        const record = this.redoList.pop()
        if (record) {
            this.undoList.push(record)
            const lastRecord = this.redoList.slice(-1)[0]
            if (lastRecord) {
                this.currentImg = lastRecord.img
            } else {
                this.currentImg = this.orgImg
            }
        } else {
            this.currentImg = this.orgImg
        }
        this.analysisImage(this.currentImg)
    }

    undo() {
        const record = this.undoList.pop()
        if (record) {
            const lastRecord = this.undoList.slice(-1)[0]
            if (lastRecord) {
                this.currentImg = lastRecord.img
            } else {
                this.currentImg = this.orgImg
            }
        } else {
            this.currentImg = this.orgImg
        }
        this.imgDataToShow(this.currentImg)
    }

    // 图像数据分析
    analysisImage(image: ImageData) {
        const length = image.data.length
        const rCount = new Array(256).fill(0)
        const gCount = new Array(256).fill(0)
        const bCount = new Array(256).fill(0)
        const scaleCount = new Array(256).fill(0)
        for (let i = 0; i < length; i += 4) {
            const r = image.data[i]
            const g = image.data[i + 1]
            const b = image.data[i + 2]
            const a = image.data[i + 3]
            rCount[r]++
            gCount[g]++
            bCount[b]++
            scaleCount[r]++
            scaleCount[g]++
            scaleCount[b]++
        }
        this.analysisData.count.r = rCount.map(v => v / (length / 4))
        this.analysisData.count.g = gCount.map(v => v / (length / 4))
        this.analysisData.count.b = bCount.map(v => v / (length / 4))
        this.analysisData.count.scale = scaleCount.map(v => v / (length / 4 * 3))
    }

}

export {ImageProcessGpu}