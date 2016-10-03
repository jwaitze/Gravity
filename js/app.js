function startGravity() {
    gravityOver = false;
    gravityTime = (new Date).getTime();
    document.getElementById("gravityAreaWrapper").style.display = "block";
    circles = [];

    addCircle(0, 0, 0, 305, 50, null, null, "player", null);
    //addCircle(screenWidth / 2, screenHeight / 2, 0, 305, 50, null, null, "player", null);

    // addCircle(screenWidth / 2, screenHeight / 2, 0, 305, 150, null, null, "player", null);
    // addCircle(screenWidth / 2 + 150, screenHeight / 2, Math.sqrt((4.2*150)/75), 270, 10, null, null, "floater", null);
    // addCircle(screenWidth / 2 - 150, screenHeight / 2, Math.sqrt((4.2*150)/75), 90, 10, null, null, "floater", null);

    //addCircle(screenWidth / 2 + 40, screenHeight / 2, Math.sqrt((4.2*50)/15), 270, 10, null, null, "floater", null);
    //addCircle(screenWidth / 2 - 40, screenHeight / 2, Math.sqrt((4.2*50)/15), 90, 10, null, null, "floater", null);

    //addCircle(screenWidth / 2 + 100, screenHeight / 2, Math.sqrt((7.27*50)/75), 270, 10, null, null, "floater", null);
    //addCircle(screenWidth / 2 - 100, screenHeight / 2, Math.sqrt((7.27*50)/75), 90, 10, null, null, "floater", null);

    //addCircle(screenWidth / 2, screenHeight / 2 + 200, Math.sqrt((7.27*50)/175), 180, 10, null, null, "floater", null);
    //addCircle(screenWidth / 2, screenHeight / 2 - 200, Math.sqrt((7.27*50)/175), 0, 10, null, null, "floater", null);

    //addCircle(screenWidth / 2, screenHeight / 2, 2, 305, 50, null, null, "player", null);
    //addCircle(screenWidth / 2.5, screenHeight / 2.5, 2, 125, 49, null, null, "floater", null);
    //addCircle(screenWidth / 3.75, screenHeight / 3.75, 3, 315, 5, null, null, "floater", null);
    //addCircle(screenWidth / 3.75, screenHeight / 3.75, 2, 135, 5, null, null, "floater", null);

    addCircle(screenWidth / 2, screenHeight / 2, 0, 360, 50, null, null, "floater", null);
    addCircle(screenWidth / 2 - 75, screenHeight / 2, Math.sqrt((10*50)/50), 270, 25, null, null, "floater", null);
    addCircle(screenWidth / 2 + 75, screenHeight / 2, Math.sqrt((10*50)/50), 90, 25, null, null, "floater", null);
    addCircle(screenWidth / 2, screenHeight / 2 - 75, Math.sqrt((10*50)/50), 0, 25, null, null, "floater", null);
    addCircle(screenWidth / 2, screenHeight / 2 + 75, Math.sqrt((10*50)/50), 180, 25, null, null, "floater", null);

    animloop();
}

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
