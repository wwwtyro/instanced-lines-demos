const { mat4 } = require("gl-matrix");
const demo = require("./demo");
const commands = require("./commands");

const { canvas, regl } = demo.initialize();
const noninterleavedStripRoundCapJoin = commands.noninterleavedStripRoundCapJoin(
  regl,
  2
);

const pointsPerItem = 100000;

// Generate the x-axis data.
const pointDataX = new Float32Array(pointsPerItem);
for (let i = 0; i < pointsPerItem; i++) {
  pointDataX[i] = i;
}
const dataX = regl.buffer(pointDataX);

const nItems = 5;
const yMin = 0;
const yMax = canvas.height;
const noise = (2 * canvas.height) / canvas.width;

const dataY = [];
for (let i = 0; i < nItems; i++) {
  const array = new Float32Array(pointsPerItem);
  let y = yMin + Math.random() * (yMax - yMin);
  for (let i = 0; i < pointsPerItem; i++) {
    y += noise * (2 * Math.random() - 1);
    y = Math.min(yMax, Math.max(yMin, y));
    array[i] = y;
  }
  dataY.push(regl.buffer(array));
}

const colors = [];
for (let i = 0; i < nItems; i++) {
  colors.push([Math.random(), Math.random(), Math.random(), 1]);
}

let currentX = pointsPerItem / 2;
let currentRange = pointsPerItem / 2;
let targetX = currentX;
let targetRange = currentRange;

let mousex = null;
let mousedown = false;

function pixel2Plot(pixel, x, range) {
  return x + range * ((2 * pixel) / canvas.width - 1);
}

let mouseover = false;
document.body.addEventListener("mouseenter", () => {
  mouseover = true;
});
document.body.addEventListener("mouseleave", () => {
  mouseover = false;
});

canvas.addEventListener("mousedown", e => {
  if (e.button === 0) {
    mousedown = true;
  }
});

window.addEventListener("mouseup", e => {
  if (e.button === 0) {
    mousedown = false;
  }
});

canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  const nx = e.clientX - rect.left;
  if (mousedown) {
    targetX -=
      pixel2Plot(nx, currentX, currentRange) -
      pixel2Plot(mousex, currentX, currentRange);
  }
  mousex = nx;
});

canvas.addEventListener("wheel", e => {
  e.preventDefault();
  if (mousex === null) {
    return;
  }
  const plotx = pixel2Plot(mousex, currentX, currentRange);
  targetRange *= 1 + 0.1 * Math.sign(e.deltaY);
  const dx = plotx - pixel2Plot(mousex, targetX, targetRange);
  targetX += dx;
});

let hasRendered = false;

function renderLoop() {
  if (mouseover || !hasRendered) {
    targetRange = Math.max(10, Math.min(targetRange, pointsPerItem * 2));
    targetX = Math.max(0, Math.min(pointsPerItem, targetX));

    currentX += 0.25 * (targetX - currentX);
    currentRange += 0.25 * (targetRange - currentRange);

    const projection = mat4.ortho(
      mat4.create(),
      currentX - currentRange,
      currentX + currentRange,
      yMin,
      yMax,
      0,
      -1
    );

    for (let i = 0; i < nItems; i++) {
      noninterleavedStripRoundCapJoin({
        dataX,
        dataY: dataY[i],
        width: 3,
        color: colors[i],
        projection,
        resolution: [canvas.width, canvas.height],
        viewport: { x: 0, y: 0, width: canvas.width, height: canvas.height },
        segments: pointDataX.length - 1
      });
    }
    hasRendered = true;
  }
  requestAnimationFrame(renderLoop);
}

requestAnimationFrame(renderLoop);
