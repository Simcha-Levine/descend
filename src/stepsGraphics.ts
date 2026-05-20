const width = 500
const height = 900
const x = width * 0.5
const xr = 200
const yr = 100
const h = height + 500
const poleXr = 40
const poleYr = 20


export default class Step {
    angle: number
    pitch: number
    ctx: CanvasRenderingContext2D
    alpha: number

    constructor(angle: number, pitch: number, ctx: CanvasRenderingContext2D) {
        this.angle = angle
        this.pitch = pitch
        this.ctx = ctx
        this.alpha = 1
    }

    draw_ellipse(y: number) {
        const scale = Math.max(1 - y / h, 0)

        this.ctx.beginPath()
        this.ctx.fillStyle = `rgba(122, 122, 122,${this.alpha})`
        this.ctx.moveTo(x, y)
        this.ctx.ellipse(x, y,
            xr * scale, yr * scale,
            0,
            this.angle + this.pitch,
            this.angle - this.pitch)
        this.ctx.closePath()
        this.ctx.fill()
        // ctx.stroke()
    }

    drawInnerWalls(y: number, depth: number) {

        const scaleTop = Math.max(1 - y / h, 0)
        const scaleBot = Math.max(1 - (y + depth) / h, 0)

        let grad1 = (Math.sin(this.angle + this.pitch) * 0.4 + 0.5) * 255
        let grad2 = (Math.sin(this.angle - this.pitch + Math.PI) * 0.4 + 0.5) * 255

        this.ctx.fillStyle = `rgba(${grad1},${grad1},${grad1},${this.alpha})`
        const startTop = ellipsePoint(x, y, xr * scaleTop, yr * scaleTop, 0, this.angle + this.pitch)
        const startBot = ellipsePoint(x, y, xr * scaleBot, yr * scaleBot, 0, this.angle + this.pitch)
        this.drawInnerWall(y, startTop, startBot, depth)

        this.ctx.fillStyle = `rgba(${grad2},${grad2},${grad2},${this.alpha})`
        const endTop = ellipsePoint(x, y, xr * scaleTop, yr * scaleTop, 0, this.angle - this.pitch)
        const endBot = ellipsePoint(x, y, xr * scaleBot, yr * scaleBot, 0, this.angle - this.pitch)
        this.drawInnerWall(y, endTop, endBot, depth)
    }

    drawInnerWall(y: number, top: { x: number, y: number }, bot: { x: number, y: number }, depth: number,) {
        this.ctx.beginPath()
        this.ctx.moveTo(top.x, top.y)
        this.ctx.lineTo(x, y)
        this.ctx.lineTo(x, y + depth)
        this.ctx.lineTo(bot.x, bot.y + depth)
        this.ctx.lineTo(top.x, top.y)
        // ctx.stroke()
        this.ctx.fill()
    }

    drawInnerPole(y: number, depth: number) {
        const gradPole = this.ctx.createLinearGradient(x - poleXr, y, x + poleXr, y)
        gradPole.addColorStop(1, `rgba(255, 255, 255,${this.alpha})`)
        gradPole.addColorStop(0, `rgba(0, 0, 0,${this.alpha})`)
        this.ctx.fillStyle = gradPole

        const scale1 = Math.max(1 - y / h, 0)
        const scale2 = Math.max(1 - (y + depth) / h, 0)

        const pitStart = this.angle - this.pitch
        const pitEnd = this.angle + this.pitch

        const state = this.get_state()
        if (state == "front") {
            this.ctx.beginPath()
            this.ctx.ellipse(x, y, poleXr * scale1, poleYr * scale1, 0, pitStart, pitEnd)
            this.ctx.ellipse(x, y + depth, poleXr * scale2, poleYr * scale2, 0, pitEnd, pitStart, true)
            this.ctx.closePath()
            this.ctx.fill()
        } else if (state == "right") {
            this.ctx.beginPath()
            this.ctx.ellipse(x, y, poleXr * scale1, poleYr * scale1, 0, 0, pitEnd % Math.PI)
            this.ctx.ellipse(x, y + depth, poleXr * scale2, poleYr * scale2, 0, pitEnd % Math.PI, 0, true)
            this.ctx.closePath()
            this.ctx.fill()
        } else if (state == "left") {
            this.ctx.beginPath()
            this.ctx.ellipse(x, y, poleXr * scale1, poleYr * scale1, 0, pitStart, Math.PI)
            this.ctx.ellipse(x, y + depth, poleXr * scale2, poleYr * scale2, 0, Math.PI, pitStart, true)
            this.ctx.closePath()
            this.ctx.fill()
        }
    }

    drawTopPole(y: number) {
        const gradPole = this.ctx.createLinearGradient(x - poleXr, y, x + poleXr, y)
        gradPole.addColorStop(1, `rgba(255, 255, 255,${this.alpha})`)
        gradPole.addColorStop(0, `rgba(0, 0, 0,${this.alpha})`)

        const scale = Math.max(1 - y / h, 0)

        this.ctx.fillStyle = gradPole
        this.ctx.beginPath()
        this.ctx.ellipse(x, 0, poleXr, poleYr, 0, 0, Math.PI)
        this.ctx.ellipse(x, y, poleXr * scale, poleYr * scale, 0, Math.PI, 0, true)
        this.ctx.closePath()
        // ctx.stroke()
        this.ctx.fill()
    }

    drawDisk(y: number, depth: number) {
        const state = this.get_state()

        const scale1 = Math.max(1 - y / h, 0)
        const scale2 = Math.max(1 - (y + depth) / h, 0)

        const pitStart = this.angle - this.pitch
        const pitEnd = this.angle + this.pitch

        const grad = this.ctx.createLinearGradient(x - xr, y, x + xr, y)
        grad.addColorStop(1, `rgba(255, 255, 255,${this.alpha})`)
        grad.addColorStop(0, `rgba(0, 0, 0,${this.alpha})`)
        this.ctx.fillStyle = grad
        if (state == "back") {
            this.ctx.beginPath()
            this.ctx.ellipse(x, y, xr * scale1, yr * scale1, 0, 0, Math.PI)
            this.ctx.ellipse(x, y + depth, xr * scale2, yr * scale2, 0, Math.PI, 0, true)
            this.ctx.closePath()
            this.ctx.fill()
        } else if (state == "right") {
            this.ctx.beginPath()
            this.ctx.ellipse(x, y, xr * scale1, yr * scale1, 0, pitEnd, Math.PI)
            this.ctx.ellipse(x, y + depth, xr * scale2, yr * scale2, 0, Math.PI, pitEnd, true)
            this.ctx.closePath()
            this.ctx.fill()
        } else if (state == "front") {
            this.ctx.beginPath()
            this.ctx.ellipse(x, y, xr * scale1, yr * scale1, 0, pitEnd, Math.PI)
            this.ctx.ellipse(x, y + depth, xr * scale2, yr * scale2, 0, Math.PI, pitEnd, true)
            this.ctx.closePath()
            this.ctx.fill()

            this.ctx.beginPath()
            this.ctx.ellipse(x, y, xr * scale1, yr * scale1, 0, 0, pitStart)
            this.ctx.ellipse(x, y + depth, xr * scale2, yr * scale2, 0, pitStart, 0, true)
            this.ctx.closePath()
            this.ctx.fill()
        } else if (state == "left") {
            this.ctx.beginPath()
            this.ctx.ellipse(x, y, xr * scale1, yr * scale1, 0, 0, pitStart)
            this.ctx.ellipse(x, y + depth, xr * scale2, yr * scale2, 0, pitStart, 0, true)
            this.ctx.closePath()
            // ctx.stroke()
            this.ctx.fill()
        }
    }

    get_state() {
        // deg = x 
        const one = ((this.angle + this.pitch) % (Math.PI * 2)) * 180 / Math.PI
        const tow = (((this.angle - this.pitch) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)) * 180 / Math.PI

        if (one > 180 && tow > 180) {
            return "back"
        } else if (one < 180 && tow > 180) {
            return "right"
        } else if (one < 180 && tow < 180) {
            return "front"
        } else if (one > 180 && tow < 180) {
            return "left"
        }
    }

    drawFullStep(y: number, depth: number) {

        this.drawInnerWalls(y, depth)

        this.drawInnerPole(y, depth)


        this.draw_ellipse(y)

        this.drawTopPole(y)

        this.drawDisk(y, depth)
    }

}

function ellipsePoint(x: number, y: number, rx: number, ry: number, rotation: number, angle: number) {
    return {
        x: x + rx * Math.cos(rotation) * Math.cos(angle) - ry * Math.sin(rotation) * Math.sin(angle),
        y: y + rx * Math.sin(rotation) * Math.cos(angle) + ry * Math.cos(rotation) * Math.sin(angle),
    }
}