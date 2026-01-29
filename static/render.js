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
  ctx.arc(x, y, 8, 0, 2 * Math.PI)
  ctx.fill()
  if (toggleNamesInput.checked) {
    ctx.fillStyle = "#222222"

    if (nameFocusInput.checked) {
      let mdx = body.pos.x - mouse.x
      let mdy = body.pos.y - mouse.y
      distance = Math.sqrt(mdx ** 2 + mdy ** 2)
      if (distance < 80) {
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

  ctx.save()
  let cx = canvas.width / 2
  let cy = canvas.height / 2
  ctx.translate(cx + viewPanX, cy + viewPanY)
  ctx.scale(viewZoom, viewZoom)
  ctx.translate(-cx, -cy)
  springs.forEach(draw_spring)
  bodies.forEach(draw_body)
  ctx.restore()

  ctx.fillStyle = "#222222"
  ctx.font = "12px Arial"
  ctx.fillText(bodies.length + " bodies", canvas.width - 70, canvas.height - 10)
}
