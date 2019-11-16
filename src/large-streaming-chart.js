const { mat4 } = require("gl-matrix");
const demo = require("./demo");

const commands = require("./commands");

const { canvas, regl } = demo.initialize();
const noninterleavedStripRoundCapJoin = commands.noninterleavedStripRoundCapJoin(
  regl,
  2
);

const buffer = 800;
const nItems = 300;
const yMin = 0;
const yMax = canvas.height;
const noise = (10 * canvas.height) / canvas.width;

const pointDataX = new Float32Array(buffer);
const dataX = regl.buffer(pointDataX);
const pointDataY = [];
for (let i = 0; i < nItems; i++) {
  const array = new Float32Array(buffer);
  array[buffer - 1] = yMin + Math.random() * (yMax - yMin);
  const data = regl.buffer(array);
  pointDataY.push({
    array,
    data
  });
}

const colors = [];
for (let i = 0; i < nItems; i++) {
  colors.push([Math.random(), Math.random(), Math.random(), 1]);
}

let mouseover = false;
document.body.addEventListener("mouseenter", () => {
  mouseover = true;
});
document.body.addEventListener("mouseleave", () => {
  mouseover = false;
});

let time = 0;
function renderLoop() {
  if (mouseover || time === 0) {
    time++;
    pointDataX.copyWithin(0, 1);
    pointDataX[buffer - 1] = time;
    dataX(pointDataX);
    for (const dy of pointDataY) {
      dy.array.copyWithin(0, 1);
      let y = dy.array[buffer - 2];
      y += noise * (2 * Math.random() - 1);
      y = Math.min(yMax, Math.max(yMin, y));
      dy.array[buffer - 1] = y;
      dy.data(dy.array);
    }

    // prettier-ignore
    const projection = mat4.ortho(mat4.create(), time - canvas.width, time, yMin, yMax, 0, -1);

    for (let i = 0; i < nItems; i++) {
      noninterleavedStripRoundCapJoin({
        dataX,
        dataY: pointDataY[i].data,
        width: 0.5,
        color: colors[i],
        projection,
        resolution: [canvas.width, canvas.height],
        viewport: { x: 0, y: 0, width: canvas.width, height: canvas.height },
        segments: buffer - 1
      });
    }
  }

  requestAnimationFrame(renderLoop);
}

requestAnimationFrame(renderLoop);
