let canvas = document.getElementById("canvas")
let ctx = canvas.getContext("2d")

let fpsInput = document.getElementById("fps")
let nameInput = document.getElementById("name")
let tagInput = document.getElementById("tag")
let toggleNamesInput = document.getElementById("toggleNames")
let nameFocusInput = document.getElementById("nameFocus")
let errorDiv = document.getElementById("error")
let loadingDiv = document.getElementById("loading")
let colorLegendDiv = document.getElementById("color-legend")
let detailDiv = document.getElementById("detail")
let detailLabel = document.getElementById("detailLabel")
let detailColor = document.getElementById("detailColor")
let detailDegree = document.getElementById("detailDegree")
let copyLabelButton = document.getElementById("copyLabel")
let fullscreenButton = document.getElementById("fullscreen")
let restartButton = document.getElementById("restart")
let pauseButton = document.getElementById("pause")
let fitButton = document.getElementById("fit")
let resetViewButton = document.getElementById("resetView")
let exportPngButton = document.getElementById("exportPng")
let exportJsonButton = document.getElementById("exportJson")
let mouse = { x: 0, y: 0 }

let viewZoom = 1
let viewPanX = 0
let viewPanY = 0

function screenToLogical(sx, sy) {
  let cx = canvas.width / 2
  let cy = canvas.height / 2
  return {
    x: ((sx - cx - viewPanX) / viewZoom + cx) * 500 / canvas.width,
    y: ((sy - cy - viewPanY) / viewZoom + cy) * 500 / canvas.height
  }
}

function makeSlider(id, valId, setter) {
  let el = document.getElementById(id)
  let valEl = document.getElementById(valId)
  let saved = localStorage.getItem(id)
  if (saved !== null) {
    el.value = saved
    valEl.textContent = saved
    setter(parseFloat(saved))
  }
  el.addEventListener("input", function() {
    setter(parseFloat(el.value))
    valEl.textContent = el.value
    localStorage.setItem(id, el.value)
    frame = 0
    if (!loopRunning) loop()
  })
}

makeSlider("sliderK",         "sliderKVal",         v => physicsK = v)
makeSlider("sliderL",         "sliderLVal",         v => physicsL = v)
makeSlider("sliderDrag",      "sliderDragVal",      v => physicsDrag = v)
makeSlider("sliderRepulsion", "sliderRepulsionVal", v => physicsRepulsion = v)
makeSlider("sliderBoundary",    "sliderBoundaryVal",    v => physicsBoundary = v)
makeSlider("sliderNodeRadius",  "sliderNodeRadiusVal",  v => nodeRadius = v)
makeSlider("sliderDt",         "sliderDtVal",          v => physicsDt = v)
makeSlider("sliderMinDegree",  "sliderMinDegreeVal",   v => minDegree = v)

// Persist checkboxes
;(function() {
  let savedToggle = localStorage.getItem("toggleNames")
  if (savedToggle !== null) toggleNamesInput.checked = savedToggle === "true"
  let savedFocus = localStorage.getItem("nameFocus")
  if (savedFocus !== null) nameFocusInput.checked = savedFocus === "true"
})()
toggleNamesInput.addEventListener("change", () => localStorage.setItem("toggleNames", toggleNamesInput.checked))
nameFocusInput.addEventListener("change",   () => localStorage.setItem("nameFocus",   nameFocusInput.checked))

let frame = 0
let loopRunning = false
let paused = false

let current_body = null

let bodies = []
let springs = []
let hiddenColors = new Set()

function updateColorLegend() {
  let colors = [...new Set(bodies.map(b => b.color))].sort()
  colorLegendDiv.innerHTML = ""
  if (colors.length <= 1) { colorLegendDiv.style.display = "none"; return }
  colors.forEach(color => {
    let chip = document.createElement("div")
    chip.className = "color-chip" + (hiddenColors.has(color) ? " hidden" : "")
    let swatch = document.createElement("div")
    swatch.className = "color-chip-swatch"
    swatch.style.background = color
    chip.appendChild(swatch)
    chip.appendChild(document.createTextNode(color))
    chip.addEventListener("click", function() {
      if (hiddenColors.has(color)) {
        hiddenColors.delete(color)
        chip.classList.remove("hidden")
      } else {
        hiddenColors.add(color)
        chip.classList.add("hidden")
      }
      if (!loopRunning) draw()
    })
    colorLegendDiv.appendChild(chip)
  })
  colorLegendDiv.style.display = "flex"
}

function showDetail(body) {
  if (!body) { detailDiv.style.display = "none"; return }
  let degree = springs.filter(s => s.body1 === body || s.body2 === body).length
  detailLabel.textContent = "Label: " + body.label
  detailColor.textContent = "Color: "
  let swatch = document.createElement("span")
  swatch.style.cssText = "display:inline-block;width:12px;height:12px;border:1px solid #000;vertical-align:middle"
  swatch.style.background = body.color
  detailColor.appendChild(swatch)
  detailColor.appendChild(document.createTextNode(" " + body.color))
  detailDegree.textContent = "Connections: " + degree
  detailDiv.style.display = "block"
}

function getTag(tag) {
  currentTag = tag
  paused = false
  pauseButton.textContent = "⏸ Pause"
  hiddenColors.clear()
  loadingDiv.style.display = "block"
  fetch("data.json?tag=" + encodeURIComponent(tag))
    .then(response => {
      loadingDiv.style.display = "none"
      if (!response.ok) {
        errorDiv.textContent = "Tag not found: " + tag
        errorDiv.style.display = "block"
        return null
      }
      errorDiv.style.display = "none"
      return response.json()
    })
    .then(json => {
      if (!json) return
      bodies = []
      springs = []

      let bodyMap = new Map()
      json.bodies.forEach(body => {
        let b = new_body(body.x, body.y, body.label, body.color)
        bodies.push(b)
        bodyMap.set(body.label, b)
      })

      json.springs.forEach(spring => {
        let body1 = bodyMap.get(spring.body1)
        let body2 = bodyMap.get(spring.body2)

        if (body1 == null) {
          body1 = new_body(250, 250, spring.body1, "gray")
          bodies.push(body1)
          bodyMap.set(spring.body1, body1)
        }

        if (body2 == null) {
          body2 = new_body(250, 250, spring.body2, "gray")
          bodies.push(body2)
          bodyMap.set(spring.body2, body2)
        }
        springs.push(new_spring(body1, body2))
      })

      updateColorLegend()
      loop()
    })
    .catch(() => { loadingDiv.style.display = "none" })
}

let currentTag = "literature"

fetch("/tags")
  .then(r => r.json())
  .then(tags => {
    let dl = document.getElementById("tag-suggestions")
    tags.forEach(t => {
      let opt = document.createElement("option")
      opt.value = t
      dl.appendChild(opt)
    })
  })
  .catch(() => {})

let urlParams = new URLSearchParams(window.location.search)
let tagParam = urlParams.get("tag")
tagInput.value = tagParam ?? ""
if (tagParam != null) {
  currentTag = tagParam
}
history.replaceState(null, "", window.location.pathname + "?tag=" + encodeURIComponent(currentTag))
getTag(currentTag)

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
  let pos = screenToLogical(event.clientX - rect.left, event.clientY - rect.top)
  for (let i = 0; i < bodies.length; i++) {
    if (hiddenColors.has(bodies[i].color)) continue
    let dx = bodies[i].pos.x - pos.x
    let dy = bodies[i].pos.y - pos.y
    let dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < nodeRadius * 500 / canvas.width * 1.5) {
      return bodies[i]
    }
  }
  return null
}

function kinetic_energy() {
  let ke = 0
  for (let b of bodies) ke += b.vel.x * b.vel.x + b.vel.y * b.vel.y
  return ke
}

function loop() {
  loopRunning = true
  if (paused) {
    loopRunning = false
    return
  }
  frame += 1
  update_bodies()
  update_springs()
  update_repulsion()
  draw()
  update_fps()
  circular_boundary()

  let settled = frame > 60 && kinetic_energy() < 1.0
  if (frame < 3000 && !settled) {
    window.requestAnimationFrame(loop)
  } else {
    loopRunning = false
  }
}

tagInput.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault()
    getTag(tagInput.value)

    window.history.pushState(
      null,
      null,
      window.location.pathname + "?tag=" + encodeURIComponent(tagInput.value)
    )

    tagInput.value = ""
  }
})

window.addEventListener("popstate", function() {
  let tag = new URLSearchParams(window.location.search).get("tag") || "literature"
  getTag(tag)
})

fullscreenButton.addEventListener("click", function() {
  let container = document.getElementById("graph-container")
  if (!document.fullscreenElement) {
    container.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
})

document.addEventListener("fullscreenchange", function() {
  fullscreenButton.textContent = document.fullscreenElement ? "✖" : "⛶"
  resizeCanvas()
  if (!loopRunning) draw()
})

restartButton.addEventListener("click", function() {
  getTag(currentTag)
})

pauseButton.addEventListener("click", function() {
  paused = !paused
  pauseButton.textContent = paused ? "Resume" : "Pause"
  if (!paused && !loopRunning) loop()
})

function fitBodies(bs) {
  if (!bs || bs.length === 0) return
  const padding = 40
  let minX = bs[0].pos.x, maxX = minX
  let minY = bs[0].pos.y, maxY = minY
  for (let b of bs) {
    if (b.pos.x < minX) minX = b.pos.x
    if (b.pos.x > maxX) maxX = b.pos.x
    if (b.pos.y < minY) minY = b.pos.y
    if (b.pos.y > maxY) maxY = b.pos.y
  }
  let cx = canvas.width / 2
  let cy = canvas.height / 2
  let pxMin = minX / 500 * canvas.width
  let pxMax = maxX / 500 * canvas.width
  let pyMin = minY / 500 * canvas.height
  let pyMax = maxY / 500 * canvas.height
  let w = Math.max(pxMax - pxMin, 1)
  let h = Math.max(pyMax - pyMin, 1)
  let zoom = Math.max(0.1, Math.min(
    (canvas.width  - 2 * padding) / w,
    (canvas.height - 2 * padding) / h,
    4
  ))
  viewZoom = zoom
  viewPanX = (cx - (pxMin + pxMax) / 2) * zoom
  viewPanY = (cy - (pyMin + pyMax) / 2) * zoom
  if (!loopRunning) draw()
}

function fitView() { fitBodies(bodies) }

function resetView() {
  viewZoom = 1
  viewPanX = 0
  viewPanY = 0
  if (!loopRunning) draw()
}

fitButton.addEventListener("click", fitView)
resetViewButton.addEventListener("click", resetView)

nameInput.addEventListener("input", function() {
  if (!nameInput.value) { fitView(); return }
  let matched = bodies.filter(b => b.label.includes(nameInput.value))
  if (matched.length > 0) fitBodies(matched)
})

copyLabelButton.addEventListener("click", function() {
  let label = detailLabel.textContent.replace(/^Label: /, "")
  if (!label) return
  navigator.clipboard.writeText(label).then(() => {
    let orig = copyLabelButton.textContent
    copyLabelButton.textContent = "Copied!"
    setTimeout(() => copyLabelButton.textContent = orig, 1200)
  })
})

exportPngButton.addEventListener("click", function() {
  let a = document.createElement("a")
  a.href = canvas.toDataURL("image/png")
  a.download = "graph.png"
  a.click()
})

exportJsonButton.addEventListener("click", function() {
  let data = {
    tag: currentTag,
    nodes: bodies.map(b => ({ label: b.label, color: b.color, x: b.pos.x, y: b.pos.y })),
    edges: springs.map(s => ({ from: s.body1.label, to: s.body2.label }))
  }
  let blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  let a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = currentTag + ".json"
  a.click()
  URL.revokeObjectURL(a.href)
})

function resizeCanvas() {
  let container = document.getElementById("graph-container")
  canvas.width = container.clientWidth
  canvas.height = container.clientHeight
}
resizeCanvas()
