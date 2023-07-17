let canvas = document.getElementById("canvas")
let ctx = canvas.getContext("2d")

let fpsInput = document.getElementById("fps")
let nameInput = document.getElementById("name")
let toggleNamesInput = document.getElementById("toggleNames")
let mouse = { x: 0, y: 0 }

let frame = 0

let current_body = null
let current_body_name = null

let bodies = []
let springs = []

fetch("data.json")
  .then(response => response.json())
  .then(json => {
    json.bodies.forEach(body => {
      body.x = Math.random() * 500
      body.y = Math.random() * 500
      bodies.push(new_body(body.x, body.y, body.label, body.color))
    })
    json.springs.forEach(spring => {
      let body1 = find_body(spring.body1)
      let body2 = find_body(spring.body2)

      if (body2 == null) {
        // TODO: Fix data ingestion
        return
        body2 = new_body(0, 0, spring.body2)
        bodies.push(body2)
      }
      springs.push(new_spring(body1, body2))
    })
  })

function pretty_print(body) {
  return `pos: (${body.pos.x.toFixed(2)}, ${body.pos.y.toFixed(2)})<br>
  vel: (${body.vel.x.toFixed(2)}, ${body.vel.y.toFixed(2)})<br>
  acc: (${body.acc.x.toFixed(2)}, ${body.acc.y.toFixed(2)})<br>`
}

let last_time = performance.now()
let counter = 0
let average_fps = 0
function update_fps() {
  let now = performance.now()
  let dt = now - last_time
  last_time = now
  let immediate_fps = 1000.0 / dt
  average_fps = 0.9 * average_fps + 0.1 * immediate_fps
  if (counter % 10 == 0) {
    fpsInput.innerHTML = average_fps.toFixed(2) + ": " + frame
  }
  counter += 1
}

function get_body_under_mouse() {
  let rect = canvas.getBoundingClientRect()
  let x = event.clientX - rect.left
  let y = event.clientY - rect.top
  for (let i = 0; i < bodies.length; i++) {
    let dx = bodies[i].pos.x - x / canvas.width * 500
    let dy = bodies[i].pos.y - y / canvas.height * 500
    let dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 10) {
      return bodies[i]
    }
  }
  return null
}

function loop() {
  frame += 1
  if (frame < 5000) {
    update_bodies()
    update_springs()
    update_repulsion()
    draw()
    update_fps()
    circular_boundary()
    window.requestAnimationFrame(loop)
  }
}

canvas.width = window.innerWidth
canvas.height = window.innerHeight

loop()