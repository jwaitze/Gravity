function getRandomColor() {
  let c = "#";
  for (let i = 0; i < 6; i++)
    c += "0123456789ABCDEF"[Math.floor(16 * Math.random())];
  return c;
}

function getSortedCircles() {
  let s = circles.slice();
  s.sort(function(a, b) {
    let isATypeBlackHoleBot = a.type == "blackholebot";
    let isBTypeBlackHoleBot = b.type == "blackholebot";
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

function makeMeBlackHole() {
  for (let i = 0; i < circles.length; i++) {
    if ("blackholebot" == circles[i].type) {
      let t = circles[i];
      circles[i] = circles[0];
      circles[0] = t;
      break;
    }
  }
}
