canvas.addEventListener("mousedown", function(_) {
  frame = 0
  let body = get_body_under_mouse()
  if (body) {
    current_body = body
  }
})

canvas.addEventListener("mousemove", function(event) {
  let rect = canvas.getBoundingClientRect()
  mouse.x = (event.clientX - rect.left) / canvas.width * 500
  mouse.y = (event.clientY - rect.top) / canvas.height * 500

  frame = 0
  if (current_body) {
    current_body.pos.x = mouse.x
    current_body.pos.y = mouse.y
  }
})

canvas.addEventListener("mouseup", function(_) {
  current_body = null
})

window.addEventListener("resize", function() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight * .9
})
