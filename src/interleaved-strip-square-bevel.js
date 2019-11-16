const commands = require("./commands");
const demo = require("./demo");

demo.diagonalDemo(
  function(params) {
    return {
      interleavedStrip: commands.interleavedStrip(params.regl),
      bevelJoin: commands.bevelJoin(params.regl),
      squareCap: commands.squareCap(params.regl)
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
    params.context.bevelJoin({
      points: params.buffer,
      width: params.canvas.width / 18,
      color: [0, 0, 0, 1],
      projection: params.projection,
      viewport: params.viewport,
      instances: params.pointData.length - 2
    });
    params.context.squareCap({
      pointA: params.scaledData[1],
      pointB: params.scaledData[0],
      width: params.canvas.width / 18,
      color: params.toggle ? [1, 0, 0, 1] : [0, 0, 0, 1],
      projection: params.projection,
      viewport: params.viewport
    });
    params.context.squareCap({
      pointA: params.scaledData[params.scaledData.length - 2],
      pointB: params.scaledData[params.scaledData.length - 1],
      width: params.canvas.width / 18,
      color: params.toggle ? [1, 0, 0, 1] : [0, 0, 0, 1],
      projection: params.projection,
      viewport: params.viewport
    });
  }
);
