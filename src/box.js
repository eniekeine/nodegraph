function tellQuadrant(l, t, r, b, x, y) {
  const cx = (l + r) / 2;
  const cy = (t + b) / 2;
  const dl = l - cx;
  const dr = r - cx;
  const dt = t - cy;
  const db = b - cy;
  const dx = x - cx;
  const dy = y - cy;
  const a0 = Math.atan2(dt, dl);
  const a1 = Math.atan2(dt, dr);
  const a2 = Math.atan2(db, dr);
  const a3 = Math.atan2(db, dl);
  const a = Math.atan2(dy, dx);
  if (a0 <= a && a < a1) {
    // console.log('1');
    return 1;
  }
  if (a1 <= a && a < a2) {
    // console.log('2');
    return 2;
  }
  if (a2 <= a && a < a3) {
    // console.log('3');
    return 3;
  }
  //   console.log('4');
  return 4;
}

function boxIntersect(l, t, r, b, x, y) {
  const cx = (l + r) / 2;
  const cy = (t + b) / 2;
  const dl = l - cx;
  const dr = r - cx;
  const dt = t - cy;
  const db = b - cy;
  const dx = x - cx;
  const dy = y - cy;
  // console.log('boxIntersect');
  const quadrant = tellQuadrant(l, t, r, b, x, y);
  switch (quadrant) {
    case 1:
    {
      const p = dt / dy;
      const ix = cx + dx * p;
      const coord = [ix, t];
      return coord;
    }
    case 2:
    {
      const p = dr / dx;
      const iy = cy + dy * p;
      const coord = [r, iy];
      return coord;
    }
    case 3:
    {
      const p = db / dy;
      const ix = cx + dx * p;
      const coord = [ix, b];
      return coord;
    }
    case 4:
    {
      const p = dl / dx;
      const iy = cy + dy * p;
      const coord = [l, iy];
      return coord;
    }
    default:
      console.error('boxIntersect: invalid quadrant');
  }
}

export { tellQuadrant, boxIntersect };
