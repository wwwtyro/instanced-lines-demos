const commands = require("./commands");
const demo = require("./demo");

demo.diagonalDemo(
  function(params) {
    return {
      interleavedStrip: commands.interleavedStrip(params.regl),
      roundJoin: commands.roundJoin(params.regl, 16)
    };
  },
  function(params) {
    params.context.roundJoin({
      points: params.buffer,
      width: params.canvas.width / 18,
      color: params.toggle ? [1, 0, 0, 1] : [0, 0, 0, 1],
      projection: params.projection,
      viewport: params.viewport,
      instances: params.pointData.length - 2
    });
    params.context.interleavedStrip({
      points: params.buffer,
      width: params.canvas.width / 18,
      color: [0, 0, 0, 1],
      projection: params.projection,
      viewport: params.viewport,
      segments: params.pointData.length - 1
    });
  }
);
