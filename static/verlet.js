let physicsK = 100
let physicsL = 10
let physicsDrag = 5
let physicsRepulsion = 1000000
let physicsBoundary = 200
let physicsDt = 0.01
let nodeRadius = 8
let minDegree = 0

function new_body(x, y, label, color) {
  return {
    label: label,
    color: color,
    pos: { x: x, y: y },
    vel: { x: 0.0, y: 0.0 },
    acc: { x: 0.0, y: 0.0 },
    mass: 1.0,
    pinned: false,
  }
}

const max_velocity = 500.0
const max_acceleration = 10.0

function new_spring(body1, body2) {
  return {
    body1: body1,
    body2: body2,
  }
}

function update(body, dt) {
  if (body == current_body || body.pinned) {
    return
  }

  let new_pos = {
    x: body.pos.x + body.vel.x * dt + body.acc.x * dt * dt * 0.5,
    y: body.pos.y + body.vel.y * dt + body.acc.y * dt * dt * 0.5
  }

  let new_acc = { x: 0.0, y: 0.0 }
  new_acc.x += -physicsDrag * body.vel.x
  new_acc.y += -physicsDrag * body.vel.y

  let new_vel = {
    x: body.vel.x + (body.acc.x + new_acc.x) * dt * 0.5,
    y: body.vel.y + (body.acc.y + new_acc.y) * dt * 0.5
  }

  let speed = Math.sqrt(new_vel.x * new_vel.x + new_vel.y * new_vel.y)
  if (speed > max_velocity) {
    new_vel.x *= max_velocity / speed
    new_vel.y *= max_velocity / speed
  }

  let acceleration = Math.sqrt(new_acc.x * new_acc.x + new_acc.y * new_acc.y)
  if (acceleration > max_acceleration) {
    new_acc.x *= max_acceleration / acceleration
    new_acc.y *= max_acceleration / acceleration
  }

  body.pos = new_pos
  body.vel = new_vel
  body.acc = new_acc
}


function update_bodies() {
  bodies.forEach(body => update(body, physicsDt))
}

function update_springs() {
  springs.forEach(spring => {
    let dx = spring.body2.pos.x - spring.body1.pos.x
    let dy = spring.body2.pos.y - spring.body1.pos.y
    let dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.1)
    let force = physicsK * (dist - physicsL)
    let fx = force * dx / dist
    let fy = force * dy / dist
    spring.body1.acc.x += fx / spring.body1.mass
    spring.body1.acc.y += fy / spring.body1.mass
    spring.body2.acc.x -= fx / spring.body2.mass
    spring.body2.acc.y -= fy / spring.body2.mass
  })
}

const THETA = 0.5

function qtMakeNode(x, y, size) {
  return { x, y, size, mass: 0, cx: 0, cy: 0, nw: null, ne: null, sw: null, se: null, body: null }
}

function qtInsertChild(node, body) {
  let half = node.size / 2
  let mx = node.x + half, my = node.y + half
  if (body.pos.x < mx) {
    if (body.pos.y < my) qtInsert(node.nw, body)
    else qtInsert(node.sw, body)
  } else {
    if (body.pos.y < my) qtInsert(node.ne, body)
    else qtInsert(node.se, body)
  }
}

function qtInsert(node, body) {
  if (node.mass === 0) {
    node.body = body
    node.mass = body.mass
    node.cx = body.pos.x
    node.cy = body.pos.y
    return
  }
  let total = node.mass + body.mass
  node.cx = (node.cx * node.mass + body.pos.x * body.mass) / total
  node.cy = (node.cy * node.mass + body.pos.y * body.mass) / total
  node.mass = total
  if (node.nw === null) {
    if (node.size > 0.01) {
      let half = node.size / 2
      let mx = node.x + half, my = node.y + half
      node.nw = qtMakeNode(node.x, node.y, half)
      node.ne = qtMakeNode(mx, node.y, half)
      node.sw = qtMakeNode(node.x, my, half)
      node.se = qtMakeNode(mx, my, half)
      if (node.body !== null) { qtInsertChild(node, node.body); node.body = null }
      qtInsertChild(node, body)
    }
    return
  }
  qtInsertChild(node, body)
}

function qtApply(node, body) {
  if (node === null || node.mass === 0) return
  let dx = node.cx - body.pos.x
  let dy = node.cy - body.pos.y
  let dist = Math.sqrt(dx * dx + dy * dy)
  if (node.nw === null) {
    if (node.body === body) return
    dist = Math.max(dist, 0.1)
    let force = -physicsRepulsion * node.mass / (dist * dist * dist)
    body.acc.x += force * dx / body.mass
    body.acc.y += force * dy / body.mass
    return
  }
  if (dist > 0 && node.size / dist < THETA) {
    dist = Math.max(dist, 0.1)
    let force = -physicsRepulsion * node.mass / (dist * dist * dist)
    body.acc.x += force * dx / body.mass
    body.acc.y += force * dy / body.mass
  } else {
    qtApply(node.nw, body)
    qtApply(node.ne, body)
    qtApply(node.sw, body)
    qtApply(node.se, body)
  }
}

function update_repulsion() {
  if (bodies.length < 2) return
  let minX = bodies[0].pos.x, maxX = minX
  let minY = bodies[0].pos.y, maxY = minY
  for (let b of bodies) {
    if (b.pos.x < minX) minX = b.pos.x
    if (b.pos.x > maxX) maxX = b.pos.x
    if (b.pos.y < minY) minY = b.pos.y
    if (b.pos.y > maxY) maxY = b.pos.y
  }
  let size = Math.max(maxX - minX, maxY - minY) + 1
  let root = qtMakeNode(minX - size * 0.005, minY - size * 0.005, size * 1.01)
  for (let b of bodies) qtInsert(root, b)
  for (let b of bodies) qtApply(root, b)
}

function circular_boundary() {
  bodies.forEach(body => {
    if (body == current_body || body.pinned) {
      return
    }

    let dx = body.pos.x - 250
    let dy = body.pos.y - 250
    let dist = Math.sqrt(dx * dx + dy * dy)
    if (dist > physicsBoundary) {
      body.pos.x = 250 + physicsBoundary * dx / dist
      body.pos.y = 250 + physicsBoundary * dy / dist
    }
  })
}
