function new_body(x, y, label, color) {
  return {
    label: label,
    color: color,
    pos: { x: x, y: y },
    vel: { x: 0.0, y: 0.0 },
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
  if (body == current_body) {
    return
  }

  let new_pos = {
    x: body.pos.x + body.vel.x * dt + body.acc.x * dt * dt * 0.5,
    y: body.pos.y + body.vel.y * dt + body.acc.y * dt * dt * 0.5
  }

  let new_acc = { x: 0.0, y: 0.0 }
  new_acc.x += -body.drag * body.vel.x
  new_acc.y += -body.drag * body.vel.y

  let new_vel = {
    x: body.vel.x + (body.acc.x + new_acc.x) * dt * 0.5,
    y: body.vel.y + (body.acc.y + new_acc.y) * dt * 0.5
  }

  let speed_limit = 1000
  let speed = Math.sqrt(new_vel.x * new_vel.x + new_vel.y * new_vel.y)
  if (speed > speed_limit) {
    new_vel.x *= speed_limit / speed
    new_vel.y *= speed_limit / speed
  }

  body.pos = new_pos
  body.vel = new_vel
  body.acc = new_acc
}

function find_body(label) {
  for (let i = 0; i < bodies.length; i++) {
    if (bodies[i].label == label) {
      return bodies[i]
    }
  }
  console.log("Could not find body with label " + label)
  return null
}

function update_bodies() {
  bodies.forEach(body => update(body, 0.01))
}

function update_springs() {
  springs.forEach(spring => {
    let dx = spring.body2.pos.x - spring.body1.pos.x
    let dy = spring.body2.pos.y - spring.body1.pos.y
    let dist = Math.sqrt(dx * dx + dy * dy)
    let force = spring.k * (dist - spring.l)
    let fx = force * dx / dist
    let fy = force * dy / dist
    spring.body1.acc.x += fx / spring.body1.mass
    spring.body1.acc.y += fy / spring.body1.mass
    spring.body2.acc.x -= fx / spring.body2.mass
    spring.body2.acc.y -= fy / spring.body2.mass
  })
}

function update_repulsion() {
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      let dx = bodies[j].pos.x - bodies[i].pos.x
      let dy = bodies[j].pos.y - bodies[i].pos.y
      let dist = Math.sqrt(dx * dx + dy * dy)

      let force = -1000000.0 / (dist * dist * dist)
      let fx = force * dx
      let fy = force * dy
      bodies[i].acc.x += fx / bodies[i].mass
      bodies[i].acc.y += fy / bodies[i].mass
      bodies[j].acc.x -= fx / bodies[j].mass
      bodies[j].acc.y -= fy / bodies[j].mass
    }
  }
}

function circular_boundary() {
  bodies.forEach(body => {
    if (body == current_body) {
      return
    }

    let dx = body.pos.x - 250
    let dy = body.pos.y - 250
    let dist = Math.sqrt(dx * dx + dy * dy)
    if (dist > 200) {
      body.pos.x = 250 + 200 * dx / dist
      body.pos.y = 250 + 200 * dy / dist
    }
  })
}
