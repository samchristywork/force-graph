canvas.addEventListener("mousedown", function(event) {
  frame = 0
  let body = get_body_under_mouse(event)
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

canvas.addEventListener("mouseup", function(_) {
  current_body = null
})

window.addEventListener("resize", function() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight * .9
})
