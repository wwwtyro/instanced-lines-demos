const commands = require("./commands");
const demo = require("./demo");

demo.diagonalDemo(
  function(params) {
    return {
      interleavedSegments: commands.interleavedSegments(params.regl)
    };
  },
  function(params) {
    params.context.interleavedSegments({
      points: params.buffer,
      width: params.canvas.width / 18,
      color: [0, 0, 0, 1],
      projection: params.projection,
      viewport: params.viewport,
      segments: params.pointData.length / 2
    });
  }
);
