function draw_grid() {
  let cx = canvas.width / 2
  let cy = canvas.height / 2

  let spacing = canvas.width / 500 * 50
  while (spacing * viewZoom < 40)  spacing *= 2
  while (spacing * viewZoom > 120) spacing /= 2

  let left   = (-cx - viewPanX) / viewZoom + cx
  let right  = (canvas.width  - cx - viewPanX) / viewZoom + cx
  let top    = (-cy - viewPanY) / viewZoom + cy
  let bottom = (canvas.height - cy - viewPanY) / viewZoom + cy

  let startX = Math.floor(left  / spacing) * spacing
  let startY = Math.floor(top   / spacing) * spacing
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

function draw_body(body, hovered, neighborSet) {
  let x = body.pos.x / 500 * canvas.width
  let y = body.pos.y / 500 * canvas.height

  let dim = hovered && body !== hovered && !neighborSet.has(body)
  let baseAlpha = dim ? 0.15 : 1.0

  ctx.globalAlpha = baseAlpha
  ctx.fillStyle = body.color
  if (nameInput.value != "") {
    ctx.fillStyle = "#553333"
    if (body.label.includes(nameInput.value)) ctx.fillStyle = "#ff4444"
  }
  ctx.beginPath()
  ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI)
  ctx.fill()

  if (toggleNamesInput.checked) {
    let alpha = 0.85
    if (nameFocusInput.checked) {
      let mdx = body.pos.x - mouse.x
      let mdy = body.pos.y - mouse.y
      let distance = Math.sqrt(mdx ** 2 + mdy ** 2)
      alpha = distance < 80 ? 0.95 : 0.15
    }
    if (dim) alpha *= 0.2
    ctx.fillStyle = "rgba(210, 210, 240, " + alpha + ")"
    ctx.font = "12px system-ui, sans-serif"
    ctx.fillText(body.label, x + 10, y + 4)
  }
  ctx.globalAlpha = 1.0
}

function draw_spring(spring, hovered) {
  let x1 = spring.body1.pos.x / 500 * canvas.width
  let y1 = spring.body1.pos.y / 500 * canvas.height
  let x2 = spring.body2.pos.x / 500 * canvas.width
  let y2 = spring.body2.pos.y / 500 * canvas.height

  let connected = !hovered || spring.body1 === hovered || spring.body2 === hovered
  let lineAlpha  = connected ? 0.5 : 0.07
  let arrowAlpha = connected ? 0.7 : 0.07

  ctx.strokeStyle = "rgba(100, 100, 180, " + lineAlpha + ")"
  ctx.lineWidth = connected ? 1.5 : 0.5
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()

  let angle = Math.atan2(y2 - y1, x2 - x1)
  let arrowSize = 7
  let tipX = x2 - (nodeRadius + 2) * Math.cos(angle)
  let tipY = y2 - (nodeRadius + 2) * Math.sin(angle)

  ctx.fillStyle = "rgba(120, 120, 200, " + arrowAlpha + ")"
  ctx.beginPath()
  ctx.moveTo(tipX, tipY)
  ctx.lineTo(tipX - arrowSize * Math.cos(angle - Math.PI / 6), tipY - arrowSize * Math.sin(angle - Math.PI / 6))
  ctx.lineTo(tipX - arrowSize * Math.cos(angle + Math.PI / 6), tipY - arrowSize * Math.sin(angle + Math.PI / 6))
  ctx.closePath()
  ctx.fill()
}

function get_hovered_body() {
  let threshold = nodeRadius * 500 / canvas.width * 1.5
  for (let b of bodies) {
    let dx = b.pos.x - mouse.x
    let dy = b.pos.y - mouse.y
    if (Math.sqrt(dx * dx + dy * dy) < threshold) return b
  }
  return null
}

function draw() {
  ctx.fillStyle = "#131320"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  let hovered = get_hovered_body()
  let neighborSet = new Set()
  if (hovered) {
    for (let s of springs) {
      if (s.body1 === hovered) neighborSet.add(s.body2)
      if (s.body2 === hovered) neighborSet.add(s.body1)
    }
  }

  ctx.save()
  let cx = canvas.width / 2
  let cy = canvas.height / 2
  ctx.translate(cx + viewPanX, cy + viewPanY)
  ctx.scale(viewZoom, viewZoom)
  ctx.translate(-cx, -cy)
  draw_grid()
  springs.forEach(s => draw_spring(s, hovered))
  bodies.forEach(b => draw_body(b, hovered, neighborSet))
  ctx.restore()

  let n = bodies.length
  let e = springs.length
  let maxEdges = n > 1 ? n * (n - 1) : 1
  let density = (e / maxEdges).toFixed(3)
  ctx.fillStyle = "#6060a0"
  ctx.font = "11px system-ui, sans-serif"
  ctx.fillText("nodes: " + n + "  edges: " + e + "  density: " + density, 8, canvas.height - 8)
}
