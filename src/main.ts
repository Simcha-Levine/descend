import './style.css'
import Step from './stepsGraphics'


const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!

const width = 500
const height = 900
canvas.width = width
canvas.height = height


const floor = 240
const poleHight = 1000

let dir = 0
let steps: Step[] = []
let ball = { x: width * 0.5, y: floor - 20, r: 30 }
let movement = 0
let platformMove = false
let platformRatio = 0
let platformMovement = 3

let pointer = 0

let score = 0

const scoreBoard = document.getElementById("score")


function init() {
  dir = 0
  steps = []
  ball = { x: width * 0.5, y: floor - 20, r: 30 }
  movement = 0
  platformMove = false
  platformRatio = 0
  platformMovement = 3
  pointer = 0
  score = 0
  scoreBoard!.innerHTML = `${score}`

  for (let i = 0; i < 15; i++) {
    pushNewStep()
  }

  last = performance.now()
}

function pushNewStep() {
  const angle = Math.random() * Math.PI * 2
  const pitch = Math.max(Math.random() * Math.PI * 0.4, Math.PI * 0.15)
  steps.push(new Step(angle, pitch, ctx))
}

function update(delta_time: number): void {

  const limit = Math.PI * 2
  for (const step of steps) {
    step.angle = ((step.angle + dir * 3 * delta_time) % limit + limit) % limit
  }

  if (ball.y + ball.r >= floor) {
    const step = steps[pointer]
    const start = (step.angle - step.pitch) / Math.PI * 180
    const end = (step.angle + step.pitch) / Math.PI * 180
    // console.log(`${start} <-> ${end}`)
    if (start < 80 && end > 100) {
      platformMove = true
    } else {
      if (platformMove && platformRatio < 0.5) {
        alert("game over")
        init()
      }
      movement = 500
      platformMovement = 3
    }
  }

  console.log(platformMovement)

  if (platformMove) {
    let newp = platformRatio + delta_time * platformMovement
    platformMovement += 0.1
    if (newp >= 1) {
      platformMove = false
      platformRatio = 0
      steps[pointer].alpha = 0
      // pointer++
      steps.shift()
      pushNewStep()
      score++
      scoreBoard!.innerHTML = `${score}`
    } else {
      platformRatio = newp
    }
  } else {
    movement -= 800 * delta_time
    ball.y -= movement * delta_time
  }

}



function drawSteps() {
  const depth = 60

  const h = height + 500

  const fScale = Math.max(1 - poleHight / h, 0)
  let lastY = poleHight - 150 * fScale * platformRatio

  steps[pointer].alpha = 1 - platformRatio


  const n = 10 + pointer
  for (let i = 0; i <= n; i++) {
    const scale = Math.max(1 - lastY / h, 0)
    lastY = lastY - 150 * scale

    if (n - i < steps.length) {
      let step = steps[n - i]

      step.drawFullStep(lastY, depth * scale)
    }
  }
}

function lightBall(x: number, y: number, r: number) {
  const lightX = x + r * 0.5
  const lightY = y - r * 0.3

  const grad = ctx.createRadialGradient(
    lightX, lightY, 0,      // inner circle (highlight)
    x, y, r                 // outer circle (edge)
  )
  grad.addColorStop(0, 'rgb(255, 255, 255)')  // bright highlight
  grad.addColorStop(0.3, 'rgb(100, 160, 255)')  // your ball color
  grad.addColorStop(1, 'rgb(10,  30,  80)')   // dark edge

  ctx.fillStyle = grad
}

function drawShadow() {
  const top = steps[pointer]
  const h = height + 500
  const w = 170
  const scale = Math.max(1 - w / h, 0)
  ctx.save()
  ctx.beginPath()
  ctx.fillStyle = 'rgb(255, 0, 0)'
  ctx.moveTo(width * 0.5, w)
  ctx.ellipse(width * 0.5, w, 200 * scale, 100 * scale, 0, top.angle + top.pitch, top.angle - top.pitch)
  ctx.closePath()
  // ctx.fill()
  ctx.clip()

  const distance = floor - ball.y
  const ratio = 1 - distance / 200
  const r = Math.max(ball.r * ratio, 0)
  ctx.beginPath()
  ctx.ellipse(width * 0.5, floor, r, r * 0.5, 0, 0, Math.PI * 2)
  ctx.fillStyle = "rgb(40, 40, 40)"
  ctx.filter = 'blur(5px)'
  ctx.fill()
  ctx.restore()
}

function draw(): void {
  ctx.fillStyle = 'rgb(0, 0, 0)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawSteps()

  drawShadow()

  ctx.beginPath()
  lightBall(ball.x, ball.y, ball.r)
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2)
  ctx.fill()
}

// ─── Loop ─────────────────────────────────────────────────────────────────────

let last = performance.now()
function loop(): void {
  const now = performance.now()
  const delta_time = (now - last) / 1000  // delta in seconds
  last = now


  update(delta_time)
  draw()
  requestAnimationFrame(loop)
}
// ─── Init ─────────────────────────────────────────────────────────────────────

init()
loop()

document.addEventListener("keydown", (e) => {
  if (e.code == "ArrowLeft") {
    dir = -1
  } else if (e.code == "ArrowRight") {
    dir = 1
  }
})

document.addEventListener("keyup", (e) => {
  if (e.code == "ArrowLeft" || e.code == "ArrowRight") {
    dir = 0
  }
})

document.addEventListener('visibilitychange', () => {
  if (document.hidden === false) {
    ball = { x: width * 0.5, y: floor - 20, r: 30 }
    last = performance.now()  // reset timer when coming back
  }
})



