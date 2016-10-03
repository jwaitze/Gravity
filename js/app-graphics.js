function drawBackground() {
  canvas.fillStyle = "#555555";
  canvas.fillRect(0, 0, screenWidth, screenHeight);
}

function drawGrid() {
  canvas.lineWidth = 1;
  canvas.strokeStyle = "#F6F6F6";
  canvas.globalAlpha = .15;
  canvas.beginPath();
  for (let i = 0; i < screenWidth; i += screenHeight / 18)
    canvas.moveTo(i, 0), canvas.lineTo(i, screenHeight);
  for (let i = 0; i < screenHeight; i += screenHeight / 18)
    canvas.moveTo(0, i), canvas.lineTo(screenWidth, i);
  canvas.stroke();
  canvas.globalAlpha = 1;
}

function drawCircles() {
  let sc = getSortedCircles();
  for (let i = circles.length - 1; 0 <= i; i--) {

    let transparency = .9;
    if(sc[i].type == "blackholebot")
      transparency = .7;

    let shadow = 0;
    if(sc[i].id == circles[0].id && circles[0].type == "player")
      shadow = 10;

    let sides = 25;
    if(sc[i].type == "exploder")
      sides = Math.floor(Math.random() * 15 + 12);

    drawCircle(sc[i].x || screenWidth / 2, sc[i].y || screenHeight / 2, sizeFactor * sc[i].mass, sides, sc[i].innerColor, sc[i].outerColor, transparency, shadow);
    if(sc[i].mass > 16) {
      let y = sc[i].y + 5;
      drawValue(Math.floor(sc[i].mass) * 3, sc[i].x, y);
    }
  }
}

function drawCircle(x, y, radius, sides, innerColor, outerColor, transparency, shadow) {
  let a = 0, b = 0;
  canvas.beginPath();

  canvas.fillStyle = innerColor;
  canvas.lineWidth = 5;
  canvas.strokeStyle = outerColor;
  canvas.globalAlpha = transparency != null ? transparency : 1;
  canvas.shadowColor = "#ccc";
  canvas.shadowBlur = shadow != null ? shadow : 0;
  for (let i = 0; i < sides; i++) {
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

function appMain() {
  gravityMain();
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
