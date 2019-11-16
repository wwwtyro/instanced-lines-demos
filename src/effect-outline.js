const commands = require("./commands");
const demo = require("./demo");

demo.diagonalDemo(
  function(params) {
    return {
      interleavedStripRoundCapJoin: commands.interleavedStripRoundCapJoin(
        params.regl,
        16
      )
    };
  },
  function(params) {
    params.context.interleavedStripRoundCapJoin({
      points: params.buffer,
      width: params.canvas.width / 18,
      color: [0, 0, 0, 1],
      projection: params.projection,
      viewport: params.viewport,
      segments: params.pointData.length - 1
    });
    params.context.interleavedStripRoundCapJoin({
      points: params.buffer,
      width: params.canvas.width / 36,
      color: [1, 0.25, 0, 1],
      projection: params.projection,
      viewport: params.viewport,
      segments: params.pointData.length - 1
    });
  }
);
