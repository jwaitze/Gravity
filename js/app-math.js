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
