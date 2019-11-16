const commands = require("./commands");
const demo = require("./demo");

demo.diagonalDemo(
  function(params) {
    return {
      interleavedStripRoundCapJoin: commands.interleavedStripRoundCapJoin(
        params.regl,
        16
      ),
      interleavedStripRoundCapJoinDEMO: commands.interleavedStripRoundCapJoinDEMO(
        params.regl,
        16
      )
    };
  },
  function(params) {
    if (params.toggle) {
      params.context.interleavedStripRoundCapJoinDEMO({
        points: params.buffer,
        width: params.canvas.width / 18,
        color: [0, 0, 0, 1],
        colorDEMO: [1, 0, 0, 1],
        projection: params.projection,
        viewport: params.viewport,
        segments: params.pointData.length - 1
      });
    } else {
      params.context.interleavedStripRoundCapJoin({
        points: params.buffer,
        width: params.canvas.width / 18,
        color: [0, 0, 0, 1],
        projection: params.projection,
        viewport: params.viewport,
        segments: params.pointData.length - 1
      });
    }
  }
);
