const commands = require("./commands");
const demo = require("./demo");

demo.diagonalDemo(
  function(params) {
    return {
      interleavedStrip: commands.interleavedStrip(params.regl),
      miterJoin: commands.miterJoin(params.regl)
    };
  },
  function(params) {
    params.context.interleavedStrip({
      points: params.buffer,
      width: params.canvas.width / 18,
      color: [0, 0, 0, 1],
      projection: params.projection,
      viewport: params.viewport,
      segments: params.pointData.length - 1
    });
    params.context.miterJoin({
      points: params.buffer,
      width: params.canvas.width / 18,
      color: params.toggle ? [1, 0, 0, 1] : [0, 0, 0, 1],
      projection: params.projection,
      viewport: params.viewport,
      instances: params.pointData.length - 2
    });
  }
);
