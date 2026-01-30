let mouseDownPos = null
let mouseDownBody = null
let panning = false

canvas.addEventListener("mousedown", function(event) {
  frame = 0
  let body = get_body_under_mouse(event)
  mouseDownPos = { x: event.clientX, y: event.clientY }
  mouseDownBody = body
  if (body) {
    current_body = body
    showDetail(body)
  } else {
    panning = true
  }
  if (!loopRunning) loop()
})

canvas.addEventListener("mousemove", function(event) {
  let rect = canvas.getBoundingClientRect()
  let pos = screenToLogical(event.clientX - rect.left, event.clientY - rect.top)
  mouse.x = pos.x
  mouse.y = pos.y

  if (panning && mouseDownPos) {
    viewPanX += event.clientX - mouseDownPos.x
    viewPanY += event.clientY - mouseDownPos.y
    mouseDownPos = { x: event.clientX, y: event.clientY }
    if (!loopRunning) draw()
    return
  }

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
  panning = false
})

canvas.addEventListener("wheel", function(event) {
  event.preventDefault()
  let rect = canvas.getBoundingClientRect()
  let sx = event.clientX - rect.left
  let sy = event.clientY - rect.top
  let cx = canvas.width / 2
  let cy = canvas.height / 2

  let factor = event.deltaY > 0 ? 0.9 : 1.1
  let newZoom = Math.max(0.1, Math.min(10, viewZoom * factor))

  viewPanX = sx - cx - (sx - cx - viewPanX) * newZoom / viewZoom
  viewPanY = sy - cy - (sy - cy - viewPanY) * newZoom / viewZoom
  viewZoom = newZoom

  if (!loopRunning) draw()
}, { passive: false })

window.addEventListener("resize", function() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight * .9
})
