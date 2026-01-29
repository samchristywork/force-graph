let canvas = document.getElementById("canvas")
let ctx = canvas.getContext("2d")

let fpsInput = document.getElementById("fps")
let nameInput = document.getElementById("name")
let tagInput = document.getElementById("tag")
let toggleNamesInput = document.getElementById("toggleNames")
let nameFocusInput = document.getElementById("nameFocus")
let restartButton = document.getElementById("restart")
let pauseButton = document.getElementById("pause")
let mouse = { x: 0, y: 0 }

function makeSlider(id, valId, setter) {
  let el = document.getElementById(id)
  let valEl = document.getElementById(valId)
  el.addEventListener("input", function() {
    setter(parseFloat(el.value))
    valEl.textContent = el.value
    frame = 0
    if (!loopRunning) loop()
  })
}

makeSlider("sliderK",         "sliderKVal",         v => physicsK = v)
makeSlider("sliderL",         "sliderLVal",         v => physicsL = v)
makeSlider("sliderDrag",      "sliderDragVal",      v => physicsDrag = v)
makeSlider("sliderRepulsion", "sliderRepulsionVal", v => physicsRepulsion = v)
makeSlider("sliderBoundary",  "sliderBoundaryVal",  v => physicsBoundary = v)

let frame = 0
let loopRunning = false
let paused = false

let current_body = null
let current_body_name = null

let bodies = []
let springs = []

function getTag(tag) {
  currentTag = tag
  fetch("data.json?tag=" + tag)
    .then(response => response.json())
    .then(json => {
      bodies = []
      springs = []

      json.bodies.forEach(body => {
        bodies.push(new_body(body.x, body.y, body.label, body.color))
      })

      json.springs.forEach(spring => {
        let body1 = find_body(spring.body1)
        let body2 = find_body(spring.body2)

        if (body1 == null) {
          body1 = new_body(250, 250, spring.body1)
          bodies.push(body1)
        }

        if (body2 == null) {
          body2 = new_body(250, 250, spring.body2)
          bodies.push(body2)
        }
        springs.push(new_spring(body1, body2))
      })

      loop()
    })
}

let currentTag = "main"

let urlParams = new URLSearchParams(window.location.search)
let tagParam = urlParams.get("tag")
tagInput.value = tagParam
if (tagParam != null) {
  currentTag = tagParam
  getTag(tagParam)
} else {
  getTag(currentTag)
}

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

function get_body_under_mouse(event) {
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
  loopRunning = true
  if (paused) {
    loopRunning = false
    return
  }
  frame += 1
  if (frame < 3000) {
    update_bodies()
    update_springs()
    update_repulsion()
    draw()
    update_fps()
    circular_boundary()

    window.requestAnimationFrame(loop)
  } else {
    loopRunning = false
  }
}

tagInput.addEventListener("keyup", function(event) {
  console.log(event.keyCode)
  if (event.keyCode === 13) {
    console.log("enter")
    event.preventDefault()
    getTag(tagInput.value)

    window.history.pushState(
      null,
      null,
      window.location.pathname + "?tag=" + tagInput.value
    )

    tagInput.value = ""
  }
})

restartButton.addEventListener("click", function() {
  getTag(currentTag)
})

pauseButton.addEventListener("click", function() {
  paused = !paused
  pauseButton.textContent = paused ? "Resume" : "Pause"
  if (!paused && !loopRunning) loop()
})

canvas.width = window.innerWidth
canvas.height = window.innerHeight * .9
