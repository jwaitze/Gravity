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
