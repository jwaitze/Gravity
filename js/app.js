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
};

function getDistance(ax, ay, bx, by) {
    return Math.sqrt(Math.pow(bx - ax, 2) + Math.pow(by - ay, 2));
}

function getDirection(sourceX, sourceY, targetX, targetY) {
    return (180 * Math.atan2(targetY - sourceY, targetX - sourceX) / Math.PI + 360) % 360;
}

function getNewDirection(sumX, sumY) {
    return (180 * Math.atan2(sumY, sumX) / Math.PI + 360) % 360;
}

function getVectorX(magnitude, direction) {
    return magnitude * Math.cos(direction * Math.PI / 180);
}

function getVectorY(magnitude, direction) {
    return magnitude * Math.sin(direction * Math.PI / 180);
}

function getNewVelocity(sumX, sumY) {
    return Math.sqrt(Math.pow(sumX, 2) + Math.pow(sumY, 2))
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
    var utc = (new Date).getTime();
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
    for (var i = blackholebotCount = floaterCount = exploderCount = foodCount = 0; i < circles.length; i++)
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
    for (var i = 0; i < circles.length; i++) {
        if(sizeFactor > circles[i].mass || circles[i].delete)
            circles.splice(i, 1);
    }
}

function manageSizes() {
    for (var i = 0; i < circles.length; i++)
        if ("exploder" == circles[i].type && circles[i].mass >= (sizeFactor*400) / 3 + (sizeFactor*2))
            circles[i].mass = (sizeFactor*400) / 3 - (sizeFactor*5);
        else {
            var o = .0164 * Math.pow(1.0095, circles[i].mass) - sizeFactor*.014;
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

function pickBlackHoleTarget() {
    var exploderIndex = Math.floor(Math.random() * exploderCount);
    for(var i = 0; i < circles.length; i++) {
        if(circles[i].type == "exploder") {
            if(exploderIndex == 0)
                return i;

            exploderIndex--;
        }
    }
}

function manageBlackHoleBots() {
    for (var i = 0; i < circles.length; i++) {
        if ("blackholebot" == circles[i].type) {
            circles[i].mass = 50;
            var utc = (new Date).getTime();
            if(circles[i].bot.nextShotTime < utc) {
                if(circles[i].bot.shotsToFire == 0 || circles[i].bot.nextShotTime == 0) {
                    circles[i].bot.nextShotTime = utc + 1E3 * (2 * Math.random() + 2);
                    circles[i].bot.shotsToFire = Math.floor(3 * Math.random() + 1);
                    circles[i].bot.delayBetweenShots = 1E3 * (1.25 * Math.random() + .25);
                } else {
                    //var collision = getCollisionCoordinates(0, 1);
                    var target = pickBlackHoleTarget();
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
    var G = 5;
    return (G*((massSource*massTarget)/(distance*distance)))/massSource;
}

function manageGravity(circle) {
    for (var i = circles.length - 1; 0 <= i; i--) {
        //if (!circles[circle] || !circles[i])
        //    continue
        if (circles[circle].id == circles[i].id)
            continue;
        var distance = getDistance(circles[circle].x, circles[circle].y, circles[i].x, circles[i].y);
        var acceleration = getAccelerationDueToGravity(circles[circle].mass, circles[i].mass, distance);
        // get the direction of the target, and then add the vectors... add the acceleration to the velocity of the current
        var directionTarget = getDirection(circles[circle].x, circles[circle].y, circles[i].x, circles[i].y);
        var vectorOriginalX = getVectorX(circles[circle].velocity, circles[circle].direction);
        var vectorOriginalY = getVectorY(circles[circle].velocity, circles[circle].direction);
        var vectorAddX = getVectorX(acceleration, directionTarget);
        var vectorAddY = getVectorY(acceleration, directionTarget);
        //console.log(acceleration);
        circles[circle].velocity = getNewVelocity(vectorOriginalX + vectorAddX, vectorOriginalY + vectorAddY);
        circles[circle].direction = getNewDirection(vectorOriginalX + vectorAddX, vectorOriginalY + vectorAddY);
        //console.log(circles[circle].velocity + ' ' + circles[circle].direction);
    }
}

function manageMovement() {
    for (var i = circles.length - 1; 0 <= i; i--) {
        manageGravity(i);
        if(circles[i].velocity) {
            circles[i].x += getVectorX(sizeFactor*circles[i].velocity, circles[i].direction);
            circles[i].y += getVectorY(sizeFactor*circles[i].velocity, circles[i].direction);
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
    var velocity = 0;
    for (var i = 0; i < Math.floor(countFactor*0) - floaterCount; i++) {
        velocity = 0;
        if(Math.ceil(10 * Math.random()) >= 7)
            velocity = Math.random() * 4 + 1;
        addCircle(Math.random() * screenWidth, Math.random() * screenHeight, velocity, Math.random()*360, Math.random()*25 + 5, null, null, "floater", null);
    }

    for (var i = 0; i < Math.floor(countFactor*0) - foodCount; i++) {
        velocity = 0;
        if(Math.ceil(Math.random() * 10) >= 3)
            velocity = Math.random() * 1;
        addCircle(Math.random() * screenWidth, Math.random() * screenHeight, velocity, Math.random()*360, Math.random()*2 + 3, null, null, "food", null);
    }

    for (var i = 0; i < Math.floor(countFactor*0) - exploderCount; i++) {
        velocity = 0;
        if(Math.ceil(Math.random() * 10) >= 7)
            velocity = Math.random() * 3 + 1;
        addCircle(Math.random() * screenWidth, Math.random() * screenHeight, velocity, Math.random()*360, Math.random()*10 + 30, null, null, "exploder", null);
    }

    for (var i = 0; i < 0 - blackholebotCount; i++)
        addCircle(Math.random() * screenWidth, Math.random() * screenHeight, 0, 0, 0, null, null, "blackholebot", null);
}

function explodeCircle(c) {
    var particles = Math.floor(Math.random() * 5 + 5),
        type = "exploded";
    if(circles[c].type == "exploder") {
        particles = 3;
        if(sizeFactor*circles[c].mass * 3 < sizeFactor*100)
            particles = 4;
        type = circles[c].type;
        circles[c].delete = true;
    }
    var angle = Math.floor(Math.random() * 360);
    for (var i = 0; i < particles; i++) {
        var x = circles[c].x + getVectorX((sizeFactor*circles[c].mass) / 2, angle),
            y = circles[c].y + getVectorY((sizeFactor*circles[c].mass) / 2, angle);
        addCircle(x, y, Math.random() * 4 + 1, angle, circles[c].mass / particles, circles[c].innerColor, circles[c].outerColor, type, null);
        angle = (angle + 360 / particles) % 360;
    }
    circles[c].mass /= 3;
}

function manageCollisions() {
    for (var a = 0; a < circles.length; a++) {
        for (var b = a + 1; b < circles.length; b++) {
            if (circles[a] && circles[b] && !circles[a].delete && !circles[b].delete) {
                var l = a, s = b;
                if(circles[a].mass < circles[b].mass) 
                    l = b, s = a;
                if(circles[a].mass == circles[b].mass) {
                    if(circles[a].velocity > circles[b].velocity)
                        l = a, s = b;
                    else
                        l = b, s = a;
                }
                var distance = getDistance(circles[l].x, circles[l].y, circles[s].x, circles[s].y);
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
                                var vectorLargeX = getVectorX(circles[l].velocity * circles[l].mass, circles[l].direction);
                                var vectorLargeY = getVectorY(circles[l].velocity * circles[l].mass, circles[l].direction);
                                var vectorSmallX = getVectorX(circles[s].velocity * circles[s].mass, circles[s].direction);
                                var vectorSmallY = getVectorY(circles[s].velocity * circles[s].mass, circles[s].direction);
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
    var targetDirection = getDirection(circles[i].x, circles[i].y, targetX, targetY);
    circles[i].mass -= circles[i].mass / 75;
    ejectMass = circles[i].mass / 8;
    var startX = circles[i].x + getVectorX(sizeFactor*circles[i].mass, targetDirection),
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

function getRandomColor() {
    var c = "#";
    for (var i = 0; i < 6; i++)
        c += "0123456789ABCDEF"[Math.floor(16 * Math.random())];
    return c;
}

function drawBackground() {
    canvas.fillStyle = "#555555";
    canvas.fillRect(0, 0, screenWidth, screenHeight);
}

function drawGrid() {
    canvas.lineWidth = 1;
    canvas.strokeStyle = "#F6F6F6";
    canvas.globalAlpha = .15;
    canvas.beginPath();
    for (var i = 0; i < screenWidth; i += screenHeight / 18) 
        canvas.moveTo(i, 0), canvas.lineTo(i, screenHeight);
    for (var i = 0; i < screenHeight; i += screenHeight / 18) 
        canvas.moveTo(0, i), canvas.lineTo(screenWidth, i);
    canvas.stroke();
    canvas.globalAlpha = 1;
}

function getSortedCircles() {
    var s = circles.slice();
    s.sort(function(a, b) {
        var isATypeBlackHoleBot = a.type == "blackholebot";
        var isBTypeBlackHoleBot = b.type == "blackholebot";
        if(isATypeBlackHoleBot && !isBTypeBlackHoleBot)
            return -1;
        else if(!isATypeBlackHoleBot && isBTypeBlackHoleBot)
            return 1;
        else if(isATypeBlackHoleBot && isBTypeBlackHoleBot) {
            if(a.velocity > b.velocity)
                return -1;
            else if(a.velocity < b.velocity)
                return 1;
            else
                return 0;
        }

        if(a.mass > b.mass)
            return -1;
        else if(a.mass < b.mass)
            return 1;
        else {
            if(a.velocity > b.velocity)
                return -1;
            else if(a.velocity < b.velocity)
                return 1;
            else
                return 0;
        }
    });
    return s;
}

function drawCircles() {
    var sc = getSortedCircles();
    for (var i = circles.length - 1; 0 <= i; i--) {

        var transparency = .9;
        if(sc[i].type == "blackholebot")
            transparency = .7;

        var shadow = 0;
        if(sc[i].id == circles[0].id)
            shadow = 10;

        var sides = 25;
        if(sc[i].type == "exploder")
            sides = Math.floor(Math.random() * 15 + 12);

        drawCircle(sc[i].x || screenWidth / 2, sc[i].y || screenHeight / 2, sizeFactor * sc[i].mass, sides, sc[i].innerColor, sc[i].outerColor, transparency, shadow);
        if(sc[i].mass > 16) {
            var y = sc[i].y + 5;
            drawValue(Math.floor(sc[i].mass) * 3, sc[i].x, y);
        }
    }
}

function drawCircle(x, y, radius, sides, innerColor, outerColor, transparency, shadow) {
    var a = 0, b = 0;
    canvas.beginPath();

    canvas.fillStyle = innerColor;
    canvas.lineWidth = 5;
    canvas.strokeStyle = outerColor;
    canvas.globalAlpha = transparency != null ? transparency : 1;
    canvas.shadowColor = "#ccc";
    canvas.shadowBlur = shadow != null ? shadow : 0;
    for (var i = 0; i < sides; i++) {
        a = i / sides * 2 * Math.PI;
        b = x + radius * Math.sin(a);
        a = y + radius * Math.cos(a);
        canvas.lineTo(b, a);
    }
    canvas.closePath();
    canvas.stroke();
    canvas.fill();
}

function drawValue(v, x, y) {
    canvas.shadowBlur = 0;
    canvas.transparency = 1;
    canvas.fillStyle = "#000000";
    canvas.strokeStyle = "#000000";
    canvas.font = "14px Verdana";
    canvas.textAlign = "center";
    canvas.lineWidth = 2;
    canvas.fillText(v, x, y);
    canvas.strokeText(v, x, y);
}

window.requestAnimFrame = function() {
    return window.requestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.mozRequestAnimationFrame
        || function(e) {
        window.setTimeout(e, 1E3 / 60);
    }
}();

function startGravity() {
    gravityOver = false;
    gravityTime = (new Date).getTime();
    document.getElementById("gravityAreaWrapper").style.display = "block";
    circles = [];
    addCircle(screenWidth / 2, screenHeight / 2, 2, 305, 50, null, null, "player", null);
    addCircle(screenWidth / 2.5, screenHeight / 2.5, 2, 125, 49, null, null, "floater", null);
    addCircle(screenWidth / 3.75, screenHeight / 3.75, 3, 315, 5, null, null, "floater", null);
    //addCircle(screenWidth / 3.75, screenHeight / 3.75, 2, 135, 5, null, null, "floater", null);
    animloop();
}

function animloop() {
    if(false) {
        document.getElementById("gravityAreaWrapper").style.display = "none";
        cancelAnimationFrame(animloopHandle);
        animloopHandle = undefined;
        return;
    }
    animloopHandle = requestAnimFrame(animloop);
    appMain();
}

function appMain() {
    gravityMain();
}

function mouseClick(e) {
    ejectCircle(2, 0, e.clientX, e.clientY);
}

function keys(e) {
    switch (e.keyCode || e.which) {
        case 32: // [SPACEBAR]
            ejectCircle(12, 0, mousePosition.x, mousePosition.y);
            break;
    }
}

function mouseMove(e) {
    mousePosition.x = e.clientX;
    mousePosition.y = e.clientY;
}

function handleFocus(e) {
    switch(e.type) {
        case "mouseover":
            c.focus();
            break;
        case "mouseout":
            c.blur();
            break;
    }
}

function makeMeBlackHole() {
    for (var i = 0; i < circles.length; i++)
        if ("blackholebot" == circles[i].type) {
            var t = circles[i];
            circles[i] = circles[0];
            circles[0] = t;
            break;
        }
};

var mousePosition = {},
    circles = [];

var foodCount = 0,
    exploderCount = 0,
    floaterCount = 0,
    blackholebotCount = 0;

var gravityOver = true,
    gravityTime = 0,
    animloopHandle,
    screenWidth = 600,
    screenHeight = 600,
    c = document.getElementById("cvs"),
    canvas = c.getContext("2d"),
    sizeFactor = 0.5,
    countFactor = 1;

c.width = screenWidth;
c.height = screenHeight;

c.addEventListener("mousemove", mouseMove, false);
c.addEventListener("mouseover", handleFocus, false);
c.addEventListener("mouseout", handleFocus, false);
c.addEventListener("click", mouseClick, false);
c.addEventListener("keydown", keys, false);

window.onload = function() {
    startGravity();
};