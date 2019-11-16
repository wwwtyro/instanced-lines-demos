const REGL = require("regl");
const { mat4 } = require("gl-matrix");

function diagonalDemo(
  generateContext,
  renderFrame,
  { toggleDefault = true, tooltip = "" } = {}
) {
  const { canvas, regl } = initialize();

  const projection = mat4.ortho(
    mat4.create(),
    -canvas.width / 2,
    canvas.width / 2,
    -canvas.height / 2,
    canvas.height / 2,
    0,
    -1
  );

  const pointData = generateSamplePointsInterleaved(
    canvas.width,
    canvas.height
  );

  const buffer = regl.buffer(pointData);

  const context = generateContext({
    regl,
    canvas
  });

  let mouseover = false;
  document.body.addEventListener("mouseenter", () => {
    mouseover = true;
  });
  document.body.addEventListener("mouseleave", () => {
    mouseover = false;
  });

  let toggle = toggleDefault;
  document.body.addEventListener("click", () => (toggle = !toggle));
  document.body.title = tooltip;

  let tick = 0;
  function loop() {
    if (mouseover || tick === 0) {
      tick++;
      scale = 0.45 * Math.sin(tick * 0.04) + 0.75;
      const scaledData = [];
      for (const point of pointData) {
        scaledData.push([point[0] * scale, point[1]]);
      }
      buffer({
        data: scaledData
      });
      renderFrame({
        regl,
        context,
        buffer,
        canvas,
        projection,
        viewport: { x: 0, y: 0, width: canvas.width, height: canvas.height },
        pointData,
        scaledData,
        toggle
      });
    }
    requestAnimationFrame(loop);
  }

  loop();
}

function generateSamplePointsInterleaved(width, height) {
  const stepx = width / 9;
  const stepy = height / 3;
  const points = [];
  for (let x = 1; x < 9; x += 2) {
    points.push([(x + 0) * stepx - width / 2, 1 * stepy - height / 2]);
    points.push([(x + 1) * stepx - width / 2, 2 * stepy - height / 2]);
  }
  return points;
}

function initialize() {
  document.body.style.margin = "0px";
  document.body.parentElement.style.height = "100%";
  document.body.style.width = document.body.style.height = "100%";

  const canvas = document.createElement("canvas");
  canvas.style.width = canvas.style.height = "100%";
  document.body.appendChild(canvas);

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  const regl = REGL({
    canvas,
    attributes: {
      antialias: true
    },
    extensions: ["ANGLE_instanced_arrays"]
  });

  // If there's no built-in MSAA, double the resolution of the canvas
  // and downsample it with CSS.
  if (regl._gl.getParameter(regl._gl.SAMPLES) < 2) {
    canvas.width = canvas.clientWidth * 2;
    canvas.height = canvas.clientHeight * 2;
  }

  return {
    canvas,
    regl
  };
}

module.exports = {
  initialize,
  generateSamplePointsInterleaved,
  diagonalDemo
};
