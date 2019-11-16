const commands = require("./commands");
const demo = require("./demo");

demo.diagonalDemo(
  function(params) {
    return {
      interleavedStrip: commands.interleavedStrip(params.regl),
      customPoints: commands.customPoints(params.regl),
      // prettier-ignore
      diamond: params.regl.buffer([0, -0.5, 0.5, 0, 0, 0.5, 0, -0.5, 0, 0.5, -0.5, 0])
    };
  },
  function(params) {
    params.context.interleavedStrip({
      points: params.buffer,
      width: params.canvas.width / 36,
      color: [0, 0, 0, 1],
      projection: params.projection,
      viewport: params.viewport,
      segments: params.pointData.length - 1
    });
    params.context.customPoints({
      pointGeometry: params.context.diamond,
      pointCount: 6,
      pointPrimitive: "triangles",
      points: params.buffer,
      width: params.canvas.width / 18,
      color: [1, 0.25, 0, 1],
      projection: params.projection,
      viewport: params.viewport,
      instances: params.pointData.length
    });
  }
);
