function draw_grid() {
  let cx = canvas.width / 2
  let cy = canvas.height / 2

  // Base grid spacing in pre-transform canvas pixels (50 logical units)
  let spacing = canvas.width / 500 * 50

  // Adapt so dots are always 40–120 px apart on screen
  while (spacing * viewZoom < 40)  spacing *= 2
  while (spacing * viewZoom > 120) spacing /= 2

  // Visible area in pre-transform canvas pixels
  let left   = (-cx - viewPanX) / viewZoom + cx
  let right  = (canvas.width  - cx - viewPanX) / viewZoom + cx
  let top    = (-cy - viewPanY) / viewZoom + cy
  let bottom = (canvas.height - cy - viewPanY) / viewZoom + cy

  let startX = Math.floor(left  / spacing) * spacing
  let startY = Math.floor(top   / spacing) * spacing

  // Dot radius fixed in screen pixels, converted to pre-transform space
  let r = 1.5 / viewZoom

  ctx.fillStyle = "#26264a"
  for (let x = startX; x <= right; x += spacing) {
    for (let y = startY; y <= bottom; y += spacing) {
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function draw_body(body) {
  let x = body.pos.x / 500 * canvas.width
  let y = body.pos.y / 500 * canvas.height

  ctx.fillStyle = body.color
  if (nameInput.value != "") {
    ctx.fillStyle = "#553333"
    if (body.label.match(nameInput.value)) ctx.fillStyle = "#ff4444"
  }
  ctx.beginPath()
  ctx.arc(x, y, 8, 0, 2 * Math.PI)
  ctx.fill()

  if (toggleNamesInput.checked) {
    let alpha = 0.85
    if (nameFocusInput.checked) {
      let mdx = body.pos.x - mouse.x
      let mdy = body.pos.y - mouse.y
      let distance = Math.sqrt(mdx ** 2 + mdy ** 2)
      alpha = distance < 80 ? 0.95 : 0.15
    }
    ctx.fillStyle = "rgba(210, 210, 240, " + alpha + ")"
    ctx.font = "12px system-ui, sans-serif"
    ctx.fillText(body.label, x + 10, y + 4)
  }
}

function draw_spring(spring) {
  let x1 = spring.body1.pos.x / 500 * canvas.width
  let y1 = spring.body1.pos.y / 500 * canvas.height
  let x2 = spring.body2.pos.x / 500 * canvas.width
  let y2 = spring.body2.pos.y / 500 * canvas.height

  ctx.strokeStyle = "rgba(100, 100, 180, 0.5)"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()

  let angle = Math.atan2(y2 - y1, x2 - x1)
  let arrowSize = 7
  let tipX = x2 - 10 * Math.cos(angle)
  let tipY = y2 - 10 * Math.sin(angle)

  ctx.fillStyle = "rgba(120, 120, 200, 0.7)"
  ctx.beginPath()
  ctx.moveTo(tipX, tipY)
  ctx.lineTo(tipX - arrowSize * Math.cos(angle - Math.PI / 6), tipY - arrowSize * Math.sin(angle - Math.PI / 6))
  ctx.lineTo(tipX - arrowSize * Math.cos(angle + Math.PI / 6), tipY - arrowSize * Math.sin(angle + Math.PI / 6))
  ctx.closePath()
  ctx.fill()
}

function draw() {
  ctx.fillStyle = "#131320"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.save()
  let cx = canvas.width / 2
  let cy = canvas.height / 2
  ctx.translate(cx + viewPanX, cy + viewPanY)
  ctx.scale(viewZoom, viewZoom)
  ctx.translate(-cx, -cy)
  draw_grid()
  springs.forEach(draw_spring)
  bodies.forEach(draw_body)
  ctx.restore()

  let n = bodies.length
  let e = springs.length
  let maxEdges = n > 1 ? n * (n - 1) : 1
  let density = (e / maxEdges).toFixed(3)
  ctx.fillStyle = "#6060a0"
  ctx.font = "11px system-ui, sans-serif"
  ctx.fillText("nodes: " + n + "  edges: " + e + "  density: " + density, 8, canvas.height - 8)
}
