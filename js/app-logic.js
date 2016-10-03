function gravityMain() {
  manageSpawns();
  manageCollisions();
  manageBlackHoleBots();
  manageDeadAndDeleted();
  manageMovement();
  manageSizes();
  drawBackground();
  drawGrid();
  drawCircles();
}

function addCircle(x, y, velocity, direction, mass, iC, oC, type, id) {
  innerColor = getRandomColor();
  outerColor = getRandomColor();
  switch (type) {
    case "exploder":
      innerColor = "#FFB300";
      outerColor = "#FF8300";
      break;
    case "blackholebot":
      innerColor = "black";
      break;
    case "player":
      innerColor = "#00DFF0";
      outerColor = "#14C8E5";
      break;
    case "food":
      innerColor = "white";
      break;
    case "floater":
      innerColor = "green";
      break;
  }
  if(iC != null)
    innerColor = iC;
  if(oC != null)
    outerColor = oC;
  let utc = (new Date).getTime();
  circles.push({
    x: x,
    y: y,
    velocity: velocity,
    direction: direction,
    mass: mass,
    innerColor: innerColor,
    outerColor: outerColor,
    type: type,
    id: null == id ? utc + "|" + Math.random() : id,
    delete: !1,
    bot: {
      nextShotTime: 0,
      shotsToFire: 0,
      delayBetweenShots: 0,
      shootX: 0,
      shootY: 0
    },
    creationTime: utc
  });
}

function updateTypeCounts() {
  for (let i = blackholebotCount = floaterCount = exploderCount = foodCount = 0; i < circles.length; i++)
    switch (circles[i].type) {
    case "food":
      foodCount++;
      break;
    case "exploder":
      exploderCount++;
      break;
    case "floater":
      floaterCount++;
      break;
    case "blackholebot":
      blackholebotCount++;
      break;
  }
}

function manageDeadAndDeleted() {
  for (let i = 0; i < circles.length; i++) {
    if(sizeFactor > circles[i].mass || circles[i].delete)
      circles.splice(i, 1);
  }
}

function manageSizes() {
  for (let i = 0; i < circles.length; i++) {
    if ("exploder" == circles[i].type && circles[i].mass >= (sizeFactor*400) / 3 + (sizeFactor*2))
      circles[i].mass = (sizeFactor*400) / 3 - (sizeFactor*5);
    else {
      let o = .0164 * Math.pow(1.0095, circles[i].mass) - sizeFactor*.014;
      if(circles[i].mass > sizeFactor*250)
        circles[i].mass = sizeFactor*250;
      else if(circles[i].mass > sizeFactor*200)
        circles[i].mass -= .5 * o;
      else if(circles[i].mass > sizeFactor*150)
        circles[i].mass -= .25 * o;
      else if(circles[i].mass > sizeFactor*100)
        circles[i].mass -= .125 * o;
      if(circles[i].mass < 0)
        circles[i].mass = Math.abs(circles[i].mass);
    }
  }
}

function pickBlackHoleTarget() {
  let exploderIndex = Math.floor(Math.random() * exploderCount);
  for(let i = 0; i < circles.length; i++) {
    if(circles[i].type == "exploder") {
      if(exploderIndex == 0)
        return i;

      exploderIndex--;
    }
  }
}

function manageBlackHoleBots() {
  for (let i = 0; i < circles.length; i++) {
    if ("blackholebot" == circles[i].type) {
      circles[i].mass = 50;
      let utc = (new Date).getTime();
      if(circles[i].bot.nextShotTime < utc) {
        if(circles[i].bot.shotsToFire == 0 || circles[i].bot.nextShotTime == 0) {
          circles[i].bot.nextShotTime = utc + 1E3 * (2 * Math.random() + 2);
          circles[i].bot.shotsToFire = Math.floor(2 * Math.random() + 1);
          circles[i].bot.delayBetweenShots = 1E3 * (1.25 * Math.random() + .25);
        } else {
          //let collision = getCollisionCoordinates(0, 1);
          let target = pickBlackHoleTarget();
          ejectCircle(6, i, circles[target].x, circles[target].y);
          circles[i].bot.shotsToFire--;
          circles[i].bot.nextShotTime += circles[i].bot.delayBetweenShots;
        }
      }
    }
  }
}

function getAccelerationDueToGravity(massSource, massTarget, distance) { // returns force on source
  // F~ = G*((m1*m2)/(distance^2))
  // F = ma, a = F/m
  // a = (G*((m1*m2)/(distance^2)))/m
  let G = 5;
  return (G*((massSource*massTarget)/(distance*distance)))/massSource;
}

function manageGravity(circle) {
  if (circles[circle].type == "blackholebot")
    return;
  for (let i = circles.length - 1; 0 <= i; i--) {
    if (circles[i].type == "blackholebot" || circles[circle].id == circles[i].id)
      continue;
    //if (!circles[circle] || !circles[i])
    //    continue
    if (circles[circle].id == circles[i].id)
      continue;
    let distance = getDistance(circles[circle].x, circles[circle].y, circles[i].x, circles[i].y);
    let acceleration = getAccelerationDueToGravity(circles[circle].mass, circles[i].mass, distance);
    // get the direction of the target, and then add the vectors... add the acceleration to the velocity of the current
    let directionTarget = getDirection(circles[circle].x, circles[circle].y, circles[i].x, circles[i].y);
    let vectorOriginalX = getVectorX(circles[circle].velocity, circles[circle].direction);
    let vectorOriginalY = getVectorY(circles[circle].velocity, circles[circle].direction);
    let vectorAddX = getVectorX(acceleration, directionTarget);
    let vectorAddY = getVectorY(acceleration, directionTarget);
    //console.log(acceleration);
    circles[circle].velocity = getNewVelocity(vectorOriginalX + vectorAddX, vectorOriginalY + vectorAddY);
    circles[circle].direction = getNewDirection(vectorOriginalX + vectorAddX, vectorOriginalY + vectorAddY);
    //console.log(circles[circle].velocity + ' ' + circles[circle].direction);
  }
}

function manageMovement() {
  for (let i = circles.length - 1; 0 <= i; i--) {
    manageGravity(i);
    if(circles[i].velocity) {
      circles[i].x += getVectorX(sizeFactor*circles[i].velocity, circles[i].direction);
      circles[i].y += getVectorY(sizeFactor*circles[i].velocity, circles[i].direction);

      if (circles[i].velocity > 20)
        circles[i].velocity -= .2;
    }

    if(circles[i].x >= screenWidth - sizeFactor*circles[i].mass) {
      circles[i].direction = 180 - circles[i].direction;
      circles[i].x = screenWidth - sizeFactor*circles[i].mass;
    }
    else if(circles[i].x <= sizeFactor*circles[i].mass) {
      circles[i].direction = 180 - circles[i].direction;
      circles[i].x = sizeFactor*circles[i].mass;
    } else if(circles[i].y >= screenHeight - sizeFactor*circles[i].mass) {
      circles[i].direction = 360 - circles[i].direction;
      circles[i].y = screenHeight - sizeFactor*circles[i].mass;
    } else if(circles[i].y <= sizeFactor*circles[i].mass) {
      circles[i].direction = 360 - circles[i].direction;
      circles[i].y = sizeFactor*circles[i].mass;
    }
  }
}

function manageSpawns() {
  updateTypeCounts();
  let velocity = 0;
  for (let i = 0; i < Math.floor(countFactor*5) - floaterCount; i++) {
    velocity = 0;
    if(Math.ceil(10 * Math.random()) >= 7)
      velocity = Math.random() * 4 + 1;
    addCircle(Math.random() * screenWidth, Math.random() * screenHeight, velocity, Math.random()*360, Math.random()*40 + 10, null, null, "floater", null);
  }

  for (let i = 0; i < Math.floor(countFactor*2) - foodCount; i++) {
    velocity = 0;
    if(Math.ceil(Math.random() * 10) >= 3)
      velocity = Math.random() * 1;
    addCircle(Math.random() * screenWidth, Math.random() * screenHeight, velocity, Math.random()*360, Math.random()*2 + 3, null, null, "food", null);
  }

  for (let i = 0; i < Math.floor(countFactor*1) - exploderCount; i++) {
    velocity = 0;
    if(Math.ceil(Math.random() * 10) >= 7)
      velocity = Math.random() * 3 + 1;
    addCircle(Math.random() * screenWidth, Math.random() * screenHeight, velocity, Math.random()*360, Math.random()*10 + 10, null, null, "exploder", null);
  }

  for (let i = 0; i < 1 - blackholebotCount; i++)
    addCircle(Math.random() * screenWidth, Math.random() * screenHeight, 0, 0, 0, null, null, "blackholebot", null);
}

function explodeCircle(c) {
  let particles = Math.floor(Math.random() * 5 + 5),
    type = "exploded";
  if(circles[c].type == "exploder") {
    particles = 3;
    if(sizeFactor*circles[c].mass * 3 < sizeFactor*100)
      particles = 4;
    type = circles[c].type;
    circles[c].delete = true;
  }
  let angle = Math.floor(Math.random() * 360);
  for (let i = 0; i < particles; i++) {
    let x = circles[c].x + getVectorX((sizeFactor*circles[c].mass) / 2, angle),
        y = circles[c].y + getVectorY((sizeFactor*circles[c].mass) / 2, angle);
    addCircle(x, y, Math.random() * 4 + 1, angle, circles[c].mass / particles, circles[c].innerColor, circles[c].outerColor, type, circles[c].id);
    angle = (angle + 360 / particles) % 360;
  }
  circles[c].mass /= 3;
}

function manageCollisions() {
  for (let a = 0; a < circles.length; a++) {
    for (let b = a + 1; b < circles.length; b++) {
      if (circles[a] && circles[b] && !circles[a].delete && !circles[b].delete) {
        let l = a, s = b;
        if(circles[a].mass < circles[b].mass)
            l = b, s = a;
        if(circles[a].mass == circles[b].mass) {
            if(circles[a].velocity > circles[b].velocity)
                l = a, s = b;
            else
                l = b, s = a;
        }
        let distance = getDistance(circles[l].x, circles[l].y, circles[s].x, circles[s].y);
        if (!(circles[s].type == "blackholebot" || circles[l].type == "blackholebot"
          && circles[s].type == "exploder" || circles[l].id == circles[s].id
          && distance + 1E-4 <= Math.floor(sizeFactor*(circles[l].mass + circles[s].mass)))
          && distance + 1E-4 <= Math.floor(sizeFactor*circles[l].mass) && circles[l].id != circles[s].id) {
          if (!("ejected" != circles[s].type && 100 > (new Date).getTime() - circles[s].creationTime)) {
            if ("exploder" == circles[s].type)
              explodeCircle(l);
            else {
                if(circles[s].velocity == 0) {
                  circles[l].velocity = (circles[l].mass * circles[l].velocity + circles[s].mass * circles[s].velocity) / (circles[l].mass + circles[s].mass);
                  circles[l].mass += circles[s].mass / 5;
                } else {
                  let vectorLargeX = getVectorX(circles[l].velocity * circles[l].mass, circles[l].direction);
                  let vectorLargeY = getVectorY(circles[l].velocity * circles[l].mass, circles[l].direction);
                  let vectorSmallX = getVectorX(circles[s].velocity * circles[s].mass, circles[s].direction);
                  let vectorSmallY = getVectorY(circles[s].velocity * circles[s].mass, circles[s].direction);
                  circles[l].mass += circles[s].mass / 5;
                  circles[l].velocity = getNewVelocity(vectorLargeX + vectorSmallX, vectorLargeY + vectorSmallY) / circles[l].mass;
                  circles[l].direction = getNewDirection(vectorLargeX + vectorSmallX, vectorLargeY + vectorSmallY);
                }
                if(circles[s].type == "player") {
                  console.log(s + "(mass:" + 3 * Math.floor(circles[s].mass) + ") absorbed by " + l + "(mass:" + 3 * Math.floor(circles[l].mass) + ") after " + ((new Date).getTime() - circles[s].creationTime) / 1E3 + " secs");
                  if(s == 0)
                    gravityOver = true;
                }
             }
          }
          circles[s].delete = true;
        }
      }
    }
  }
}

function ejectCircle(velocity, i, targetX, targetY) {
  let targetDirection = getDirection(circles[i].x, circles[i].y, targetX, targetY);
  circles[i].mass -= circles[i].mass / 75;
  ejectMass = circles[i].mass / 8;
  let startX = circles[i].x + getVectorX(sizeFactor*circles[i].mass, targetDirection),
      startY = circles[i].y + getVectorY(sizeFactor*circles[i].mass, targetDirection),
      oppositeDirection = (targetDirection + 180) % 360,
      newEjectX = getVectorX(velocity * ejectMass, oppositeDirection),
      newEjectY = getVectorY(velocity * ejectMass, oppositeDirection),
      newSourceX = getVectorX(circles[i].velocity * circles[i].mass, circles[i].direction),
      newSourceY = getVectorY(circles[i].velocity * circles[i].mass, circles[i].direction);
  circles[i].velocity = getNewVelocity(newEjectX + newSourceX, newEjectY + newSourceY) / circles[i].mass;
  circles[i].direction = getNewDirection(newEjectX + newSourceX, newEjectY + newSourceY);
  newEjectX = getVectorX(velocity, targetDirection);
  newEjectY = getVectorY(velocity, targetDirection);
  newSourceX = getVectorX(circles[i].velocity, circles[i].direction);
  newSourceY = getVectorY(circles[i].velocity, circles[i].direction);
  velocity = getNewVelocity(newEjectX + newSourceX, newEjectY + newSourceY) - circles[i].velocity + 2*velocity;
  addCircle(startX, startY, velocity, targetDirection, ejectMass, circles[i].innerColor, circles[i].outerColor, "ejected", circles[i].id)
}
