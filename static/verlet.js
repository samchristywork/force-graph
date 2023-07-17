function new_body(x, y, label, color) {
  return {
    label: label,
    color: color,
    pos: { x: x, y: y },
    vel: { x: 0.0, y: 10.0 },
    acc: { x: 0.0, y: 0.0 },
    mass: 1.0,
    drag: 5.0
  }
}

function new_spring(body1, body2) {
  return {
    body1: body1,
    body2: body2,
    k: 100,
    l: 10
  }
}

function update(body, dt) {
}

function update_bodies() {
  bodies.forEach(body => update(body, 0.01))
}

function update_springs() {
}

function update_repulsion() {
}

function circular_boundary() {
}
