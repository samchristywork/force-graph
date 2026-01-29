let mouseDownPos = null
let mouseDownBody = null

canvas.addEventListener("mousedown", function(event) {
  frame = 0
  let body = get_body_under_mouse(event)
  mouseDownPos = { x: event.clientX, y: event.clientY }
  mouseDownBody = body
  if (body) {
    current_body = body
  }
  if (!loopRunning) loop()
})

canvas.addEventListener("mousemove", function(event) {
  let rect = canvas.getBoundingClientRect()
  mouse.x = (event.clientX - rect.left) / canvas.width * 500
  mouse.y = (event.clientY - rect.top) / canvas.height * 500

  frame = 0
  if (current_body) {
    current_body.pos.x = mouse.x
    current_body.pos.y = mouse.y
    if (!loopRunning) loop()
  }
})

canvas.addEventListener("mouseup", function(event) {
  if (mouseDownBody) {
    let dx = event.clientX - mouseDownPos.x
    let dy = event.clientY - mouseDownPos.y
    let dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 5) {
      getTag(mouseDownBody.label)
      window.history.pushState(null, null, window.location.pathname + "?tag=" + mouseDownBody.label)
    }
  }
  current_body = null
  mouseDownBody = null
  mouseDownPos = null
})

window.addEventListener("resize", function() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight * .9
})
