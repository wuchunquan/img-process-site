interface LineDraw3dConfig {
    canvasId: string
    xRange: [number, number]
    yRange: [number, number]
    zRange: [number, number]
}

class LineDraw3d {
    config: LineDraw3dConfig
    el: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    constructor(config: LineDraw3dConfig) {
        this.config = config
        this.el = document.getElementById(this.config.canvasId) as HTMLCanvasElement
        this.ctx = this.el.getContext('2d') as CanvasRenderingContext2D
    }
    draw(){
        // this.ctx.lineTo()
    }
}

export {LineDraw3d}