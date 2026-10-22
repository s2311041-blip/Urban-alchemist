const e = { point: { x: 1, y: 0.16, z: 2 } };
const scale = [1, 1, 1];
const options = { onLayoutSurface: true };
const snapX = 1.25;
const snapZ = 2.25;

const bottomY = Math.round(e.point.y * 1000) / 1000;
const finalPos = [snapX, bottomY + (0.25 * scale[1]), snapZ];
console.log(finalPos);
