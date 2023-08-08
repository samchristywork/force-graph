function draw_body(body) {
  ctx.fillStyle = body.color

  if (nameInput.value != "") {
    ctx.fillStyle = "#552222"
    if (body.label.match(nameInput.value)) {
      ctx.fillStyle = "#ff0000"
    }
  }
  ctx.beginPath()
  let x = body.pos.x / 500 * canvas.width
  let y = body.pos.y / 500 * canvas.height
  ctx.arc(x, y, 3, 0, 2 * Math.PI)
  ctx.fill()
  if (toggleNamesInput.checked) {
    ctx.fillStyle = "#222222"

    if (nameFocusInput.checked) {
      dx = x - mouse.x * canvas.width / 500
      dy = y - mouse.y * canvas.height / 500
      distance = Math.sqrt(dx ** 2 + dy ** 2)
      if (distance < 200) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.9)"
      } else {
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
      }
    }
    let font_size = 12
    ctx.font = font_size + "px Arial"
    ctx.fillText(body.label, x + 3, y - 3)
  }
}

function draw_spring(spring) {
  ctx.strokeStyle = "#222222"
  ctx.lineWidth = 0.5
  ctx.beginPath()

  let x1 = spring.body1.pos.x / 500 * canvas.width
  let y1 = spring.body1.pos.y / 500 * canvas.height
  let x2 = spring.body2.pos.x / 500 * canvas.width
  let y2 = spring.body2.pos.y / 500 * canvas.height

  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function draw() {
  ctx.fillStyle = "#cccccc"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  springs.forEach(draw_spring)
  bodies.forEach(draw_body)
}
