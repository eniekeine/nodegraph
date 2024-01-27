function posToText(pos) {
  return `${pos.x} ${pos.y}`;
}

function posToLine(pos) {
  return `L ${posToText(pos)}`;
}

function posToMove(pos) {
  return `M ${posToText(pos)}`;
}

function posToPathD(posArray) {
  let d = '';
  for (let i = 0; i < posArray.length; i += 1) {
    if (i === 0) {
      d += posToMove(posArray[i]);
    } else {
      d += posToLine(posArray[i]);
    }
  }
  return d;
}
function posToPath(posArray) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttributeNS(null, 'd', posToPathD(posArray));
  path.setAttributeNS(null, 'stroke', '#34b939');
  path.setAttributeNS(null, 'stroke-width', '1.5');
  path.setAttributeNS(null, 'fill', 'none');
  return path;
}
