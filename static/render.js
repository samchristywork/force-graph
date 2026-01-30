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
  let x1 = spring.body1.pos.x / 500 * canvas.width
  let y1 = spring.body1.pos.y / 500 * canvas.height
  let x2 = spring.body2.pos.x / 500 * canvas.width
  let y2 = spring.body2.pos.y / 500 * canvas.height

  ctx.strokeStyle = "#222222"
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()

  let angle = Math.atan2(y2 - y1, x2 - x1)
  let arrowSize = 8
  let tipX = x2 - 10 * Math.cos(angle)
  let tipY = y2 - 10 * Math.sin(angle)

  ctx.fillStyle = "#444444"
  ctx.beginPath()
  ctx.moveTo(tipX, tipY)
  ctx.lineTo(tipX - arrowSize * Math.cos(angle - Math.PI / 6), tipY - arrowSize * Math.sin(angle - Math.PI / 6))
  ctx.lineTo(tipX - arrowSize * Math.cos(angle + Math.PI / 6), tipY - arrowSize * Math.sin(angle + Math.PI / 6))
  ctx.closePath()
  ctx.fill()
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

  let n = bodies.length
  let e = springs.length
  let maxEdges = n > 1 ? n * (n - 1) : 1
  let density = (e / maxEdges).toFixed(3)
  ctx.fillStyle = "#222222"
  ctx.font = "12px Arial"
  ctx.fillText("nodes: " + n + "  edges: " + e + "  density: " + density, 8, canvas.height - 10)
}
