import type {ImgProcessFunc} from "@/imgProcess/types";

class ImgProcess {
    containerId: string
    actionStack = []

    constructor(containerId: string) {
        this.containerId = containerId
        const el=document.getElementById(this.containerId) as HTMLCanvasElement
    }

    doProcess(func:ImgProcessFunc, params) {
        func(params,this.)
    }
}
export {}