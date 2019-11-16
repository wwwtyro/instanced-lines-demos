const commands = require("./commands");
const demo = require("./demo");

demo.diagonalDemo(
  function(params) {
    return {
      glLineStrip: commands.glLineStrip(params.regl)
    };
  },
  function(params) {
    params.context.glLineStrip({
      position: params.buffer,
      count: params.pointData.length,
      width: params.regl.limits.lineWidthDims[1],
      color: [0, 0, 0, 1],
      projection: params.projection,
      viewport: params.viewport
    });
  }
);
