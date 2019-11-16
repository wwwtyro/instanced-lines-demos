function glLines(regl) {
  return regl({
    vert: `
      precision highp float;
      attribute vec2 position;
      uniform mat4 projection;
  
      void main() {
        gl_Position = projection * vec4(position, 0, 1);
      }`,

    frag: `
      precision highp float;
      uniform vec4 color;
      void main() {
        gl_FragColor = color;
      }`,

    attributes: {
      position: regl.prop("position")
    },

    uniforms: {
      color: regl.prop("color"),
      projection: regl.prop("projection")
    },

    primitive: "lines",
    lineWidth: regl.prop("width"),
    count: regl.prop("count"),
    viewport: regl.prop("viewport")
  });
}

function glLineStrip(regl) {
  return regl({
    vert: `
      precision highp float;
      attribute vec2 position;
      uniform mat4 projection;
  
      void main() {
        gl_Position = projection * vec4(position, 0, 1);
      }`,

    frag: `
      precision highp float;
      uniform vec4 color;
      void main() {
        gl_FragColor = color;
      }`,

    attributes: {
      position: regl.prop("position")
    },

    uniforms: {
      color: regl.prop("color"),
      projection: regl.prop("projection")
    },

    primitive: "line strip",
    lineWidth: regl.prop("width"),
    count: regl.prop("count"),
    viewport: regl.prop("viewport")
  });
}

const segmentInstanceGeometry = [
  [0, -0.5],
  [1, -0.5],
  [1, 0.5],
  [0, -0.5],
  [1, 0.5],
  [0, 0.5]
];

function interleavedSegments(regl) {
  return regl({
    vert: `
      precision highp float;
      uniform float width;
      attribute vec2 position, pointA, pointB;
      uniform mat4 projection;
  
      void main() {
        vec2 xBasis = pointB - pointA;
        vec2 yBasis = normalize(vec2(-xBasis.y, xBasis.x));
        vec2 point = pointA + xBasis * position.x + yBasis * width * position.y;
        gl_Position = projection * vec4(point, 0, 1);
      }`,

    frag: `
      precision highp float;
      uniform vec4 color;
      void main() {
        gl_FragColor = color;
      }`,

    attributes: {
      position: {
        buffer: regl.buffer(segmentInstanceGeometry),
        divisor: 0
      },
      pointA: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 0,
        stride: Float32Array.BYTES_PER_ELEMENT * 4
      },
      pointB: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 2,
        stride: Float32Array.BYTES_PER_ELEMENT * 4
      }
    },

    uniforms: {
      width: regl.prop("width"),
      color: regl.prop("color"),
      projection: regl.prop("projection")
    },

    cull: {
      enable: true,
      face: "back"
    },

    count: segmentInstanceGeometry.length,
    instances: regl.prop("segments"),
    viewport: regl.prop("viewport")
  });
}

function interleavedStrip(regl) {
  return regl({
    vert: `
      precision highp float;
      attribute vec2 position;
      attribute vec2 pointA, pointB;
      uniform float width;
      uniform mat4 projection;
  
      void main() {
        vec2 xBasis = pointB - pointA;
        vec2 yBasis = normalize(vec2(-xBasis.y, xBasis.x));
        vec2 point = pointA + xBasis * position.x + yBasis * width * position.y;
        gl_Position = projection * vec4(point, 0, 1);
      }`,

    frag: `
      precision highp float;
      uniform vec4 color;
      void main() {
        gl_FragColor = color;
      }`,

    attributes: {
      position: {
        buffer: regl.buffer(segmentInstanceGeometry),
        divisor: 0
      },
      pointA: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 0
      },
      pointB: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 2
      }
    },

    uniforms: {
      width: regl.prop("width"),
      color: regl.prop("color"),
      projection: regl.prop("projection")
    },

    cull: {
      enable: true,
      face: "back"
    },

    depth: {
      enable: false
    },

    count: segmentInstanceGeometry.length,
    instances: regl.prop("segments"),
    viewport: regl.prop("viewport")
  });
}

function circleGeometry(regl, resolution) {
  const position = [[0, 0]];
  for (wedge = 0; wedge <= resolution; wedge++) {
    const theta = (2 * Math.PI * wedge) / resolution;
    position.push([0.5 * Math.cos(theta), 0.5 * Math.sin(theta)]);
  }
  return {
    buffer: regl.buffer(position),
    count: position.length
  };
}

function roundJoin(regl, resolution) {
  const roundBuffer = circleGeometry(regl, resolution);
  return regl({
    vert: `
      precision highp float;
      attribute vec2 position;
      attribute vec2 point;
      uniform float width;
      uniform mat4 projection;
  
      void main() {
        gl_Position = projection * vec4(width * position + point, 0, 1);
      }`,

    frag: `
      precision highp float;
      uniform vec4 color;
      void main() {
        gl_FragColor = color;
      }`,

    depth: {
      enable: false
    },

    attributes: {
      position: {
        buffer: roundBuffer.buffer,
        divisor: 0
      },
      point: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 2
      }
    },

    uniforms: {
      width: regl.prop("width"),
      color: regl.prop("color"),
      projection: regl.prop("projection")
    },

    cull: {
      enable: true,
      face: "back"
    },

    primitive: "triangle fan",
    count: roundBuffer.count,
    instances: regl.prop("instances"),
    viewport: regl.prop("viewport")
  });
}

instanceMiterJoin = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 0],
  [0, 1, 0],
  [0, 0, 1]
];

function miterJoin(regl) {
  return regl({
    vert: `
      precision highp float;
      attribute vec2 pointA, pointB, pointC;
      attribute vec3 position;
      uniform float width;
      uniform mat4 projection;
  
      void main() {
        // Find the miter vector.
        vec2 tangent = normalize(normalize(pointC - pointB) + normalize(pointB - pointA));
        vec2 miter = vec2(-tangent.y, tangent.x);

        // Find the perpendicular vectors.
        vec2 ab = pointB - pointA;
        vec2 cb = pointB - pointC;
        vec2 abNorm = normalize(vec2(-ab.y, ab.x));
        vec2 cbNorm = -normalize(vec2(-cb.y, cb.x));

        // Determine the bend direction.
        float sigma = sign(dot(ab + cb, miter));

        // Calculate the basis vectors for the miter geometry.
        vec2 p0 = 0.5 * width * sigma * (sigma < 0.0 ? abNorm : cbNorm);
        vec2 p1 = 0.5 * miter * sigma * width / dot(miter, abNorm);
        vec2 p2 = 0.5 * width * sigma * (sigma < 0.0 ? cbNorm : abNorm);

        // Calculate the final point position.
        vec2 point = pointB + position.x * p0 + position.y * p1 + position.z * p2;
        gl_Position = projection * vec4(point, 0, 1);
      }`,

    frag: `
      precision highp float;
      uniform vec4 color;
      void main() {
        gl_FragColor = color;
      }`,

    depth: {
      enable: false
    },

    attributes: {
      position: {
        buffer: regl.buffer(instanceMiterJoin),
        divisor: 0
      },
      pointA: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 0
      },
      pointB: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 2
      },
      pointC: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 4
      }
    },

    uniforms: {
      width: regl.prop("width"),
      color: regl.prop("color"),
      projection: regl.prop("projection")
    },

    cull: {
      enable: true,
      face: "back"
    },

    count: instanceMiterJoin.length,
    instances: regl.prop("instances"),
    viewport: regl.prop("viewport")
  });
}

instanceBevelJoin = [[0, 0], [1, 0], [0, 1]];

function bevelJoin(regl) {
  return regl({
    vert: `
    precision highp float;
    attribute vec2 pointA, pointB, pointC;
    attribute vec2 position;
    uniform float width;
    uniform mat4 projection;

    void main() {
      vec2 tangent = normalize(normalize(pointC - pointB) + normalize(pointB - pointA));
      vec2 normal = vec2(-tangent.y, tangent.x);
      vec2 ab = pointB - pointA;
      vec2 cb = pointB - pointC;
      float sigma = sign(dot(ab + cb, normal));
      vec2 abn = normalize(vec2(-ab.y, ab.x));
      vec2 cbn = -normalize(vec2(-cb.y, cb.x));
      vec2 p0 = 0.5 * sigma * width * (sigma < 0.0 ? abn : cbn);
      vec2 p1 = 0.5 * sigma * width * (sigma < 0.0 ? cbn : abn);
      vec2 point = pointB + position.x * p0 + position.y * p1;
      gl_Position = projection * vec4(point, 0, 1);
    }`,

    frag: `
    precision highp float;
    uniform vec4 color;
    void main() {
      gl_FragColor = color;
    }`,

    depth: {
      enable: false
    },

    attributes: {
      position: {
        buffer: regl.buffer(instanceBevelJoin),
        divisor: 0
      },
      pointA: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 0
      },
      pointB: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 2
      },
      pointC: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 4
      }
    },

    uniforms: {
      width: regl.prop("width"),
      color: regl.prop("color"),
      projection: regl.prop("projection")
    },

    cull: {
      enable: true,
      face: "back"
    },

    count: instanceBevelJoin.length,
    instances: regl.prop("instances"),
    viewport: regl.prop("viewport")
  });
}

function roundCap(regl, resolution) {
  const roundBuffer = circleGeometry(regl, resolution);
  return regl({
    vert: `
    precision highp float;
    attribute vec2 position;
    uniform vec2 point;
    uniform float width;
    uniform mat4 projection;

    void main() {
      gl_Position = projection * vec4(point + width * position, 0, 1);
  }`,

    frag: `
    precision highp float;
    uniform vec4 color;
    void main() {
      gl_FragColor = color;
    }`,

    depth: {
      enable: false
    },

    attributes: {
      position: {
        buffer: roundBuffer.buffer
      }
    },

    uniforms: {
      point: regl.prop("point"),
      width: regl.prop("width"),
      color: regl.prop("color"),
      projection: regl.prop("projection")
    },

    cull: {
      enable: true,
      face: "back"
    },

    primitive: "triangle fan",
    count: roundBuffer.count,
    viewport: regl.prop("viewport")
  });
}

function squareCap(regl) {
  return regl({
    vert: `
      precision highp float;
      attribute vec2 position;
      uniform vec2 pointA, pointB;
      uniform float width;
      uniform mat4 projection;
  
      void main() {
        vec2 xBasis = normalize(pointB - pointA);
        vec2 yBasis = vec2(-xBasis.y, xBasis.x);
        vec2 point = pointB + xBasis * 0.5 * width * position.x + yBasis * width * position.y;
        gl_Position = projection * vec4(point, 0, 1);
    }`,

    frag: `
      precision highp float;
      uniform vec4 color;
      void main() {
        gl_FragColor = color;
      }`,

    depth: {
      enable: false
    },

    attributes: {
      position: {
        buffer: regl.buffer(segmentInstanceGeometry)
      }
    },

    uniforms: {
      pointA: regl.prop("pointA"),
      pointB: regl.prop("pointB"),
      width: regl.prop("width"),
      color: regl.prop("color"),
      projection: regl.prop("projection")
    },

    cull: {
      enable: true,
      face: "back"
    },

    count: segmentInstanceGeometry.length,
    viewport: regl.prop("viewport")
  });
}

function roundCapJoinGeometry(regl, resolution) {
  const instanceRoundRound = [
    [0, -0.5, 0],
    [0, -0.5, 1],
    [0, 0.5, 1],
    [0, -0.5, 0],
    [0, 0.5, 1],
    [0, 0.5, 0]
  ];
  // Add the left cap.
  for (let step = 0; step < resolution; step++) {
    const theta0 = Math.PI / 2 + ((step + 0) * Math.PI) / resolution;
    const theta1 = Math.PI / 2 + ((step + 1) * Math.PI) / resolution;
    instanceRoundRound.push([0, 0, 0]);
    instanceRoundRound.push([
      0.5 * Math.cos(theta0),
      0.5 * Math.sin(theta0),
      0
    ]);
    instanceRoundRound.push([
      0.5 * Math.cos(theta1),
      0.5 * Math.sin(theta1),
      0
    ]);
  }
  // Add the right cap.
  for (let step = 0; step < resolution; step++) {
    const theta0 = (3 * Math.PI) / 2 + ((step + 0) * Math.PI) / resolution;
    const theta1 = (3 * Math.PI) / 2 + ((step + 1) * Math.PI) / resolution;
    instanceRoundRound.push([0, 0, 1]);
    instanceRoundRound.push([
      0.5 * Math.cos(theta0),
      0.5 * Math.sin(theta0),
      1
    ]);
    instanceRoundRound.push([
      0.5 * Math.cos(theta1),
      0.5 * Math.sin(theta1),
      1
    ]);
  }
  return {
    buffer: regl.buffer(instanceRoundRound),
    count: instanceRoundRound.length
  };
}

function interleavedStripRoundCapJoin(regl, resolution) {
  roundCapJoin = roundCapJoinGeometry(regl, resolution);
  return regl({
    vert: `
      precision highp float;
      attribute vec3 position;
      attribute vec2 pointA, pointB;
      uniform float width;
      uniform mat4 projection;
  
      void main() {
        vec2 xBasis = normalize(pointB - pointA);
        vec2 yBasis = vec2(-xBasis.y, xBasis.x);
        vec2 offsetA = pointA + width * (position.x * xBasis + position.y * yBasis);
        vec2 offsetB = pointB + width * (position.x * xBasis + position.y * yBasis);
        vec2 point = mix(offsetA, offsetB, position.z);
        gl_Position = projection * vec4(point, 0, 1);
      }`,

    frag: `
      precision highp float;
      uniform vec4 color;
      void main() {
        gl_FragColor = color;
      }`,

    attributes: {
      position: {
        buffer: roundCapJoin.buffer,
        divisor: 0
      },
      pointA: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 0
      },
      pointB: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 2
      }
    },

    uniforms: {
      width: regl.prop("width"),
      color: regl.prop("color"),
      projection: regl.prop("projection")
    },

    depth: {
      enable: false
    },

    cull: {
      enable: true,
      face: "back"
    },

    count: roundCapJoin.count,
    instances: regl.prop("segments"),
    viewport: regl.prop("viewport")
  });
}

function interleavedStripRoundCapJoin3D(regl, resolution) {
  roundCapJoin = roundCapJoinGeometry(regl, resolution);
  return regl({
    vert: `
      precision highp float;
      attribute vec3 position;
      attribute vec3 pointA, pointB;
      uniform float width;
      uniform vec2 resolution;
      uniform mat4 model, view, projection;
  
      void main() {
        vec4 clip0 = projection * view * model * vec4(pointA, 1.0);
        vec4 clip1 = projection * view * model * vec4(pointB, 1.0);
        vec2 screen0 = resolution * (0.5 * clip0.xy/clip0.w + 0.5);
        vec2 screen1 = resolution * (0.5 * clip1.xy/clip1.w + 0.5);
        vec2 xBasis = normalize(screen1 - screen0);
        vec2 yBasis = vec2(-xBasis.y, xBasis.x);
        vec2 pt0 = screen0 + width * (position.x * xBasis + position.y * yBasis);
        vec2 pt1 = screen1 + width * (position.x * xBasis + position.y * yBasis);
        vec2 pt = mix(pt0, pt1, position.z);
        vec4 clip = mix(clip0, clip1, position.z);
        gl_Position = vec4(clip.w * (2.0 * pt/resolution - 1.0), clip.z, clip.w);
      }`,

    frag: `
      precision highp float;
      uniform vec4 color;
      void main() {
        gl_FragColor = color;
      }`,

    attributes: {
      position: {
        buffer: roundCapJoin.buffer,
        divisor: 0
      },
      pointA: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 0
      },
      pointB: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 3
      }
    },

    uniforms: {
      width: regl.prop("width"),
      color: regl.prop("color"),
      model: regl.prop("model"),
      view: regl.prop("view"),
      projection: regl.prop("projection"),
      resolution: regl.prop("resolution")
    },

    depth: {
      enable: false
    },

    cull: {
      enable: true,
      face: "back"
    },

    count: roundCapJoin.count,
    instances: regl.prop("segments"),
    viewport: regl.prop("viewport")
  });
}

function customPoints(regl) {
  return regl({
    vert: `
    precision highp float;
    attribute vec2 position;
    attribute vec2 point;
    uniform float width;
    uniform mat4 projection;

    void main() {
      gl_Position = projection * vec4(width * position + point, 0, 1);
    }`,

    frag: `
    precision highp float;
    uniform vec4 color;
    void main() {
      gl_FragColor = color;
    }`,

    depth: {
      enable: false
    },

    attributes: {
      position: {
        buffer: regl.prop("pointGeometry"),
        divisor: 0
      },
      point: {
        buffer: regl.prop("points"),
        divisor: 1
      }
    },

    uniforms: {
      width: regl.prop("width"),
      color: regl.prop("color"),
      projection: regl.prop("projection")
    },

    cull: {
      enable: true,
      face: "back"
    },

    primitive: regl.prop("pointPrimitive"),
    count: regl.prop("pointCount"),
    instances: regl.prop("instances"),
    viewport: regl.prop("viewport")
  });
}

function noninterleavedStripRoundCapJoin(regl, resolution) {
  roundCapJoin = roundCapJoinGeometry(regl, resolution);

  return regl({
    vert: `
      precision highp float;
      attribute vec3 position;
      attribute float ax, ay, bx, by;
      uniform float width;
      uniform vec2 resolution;
      uniform mat4 projection;
  
      void main() {
        vec2 clipA = (projection * vec4(ax, ay, 0, 1)).xy;
        vec2 clipB = (projection * vec4(bx, by, 0, 1)).xy;
        vec2 offsetA = resolution * (0.5 * clipA + 0.5);
        vec2 offsetB = resolution * (0.5 * clipB + 0.5);
        vec2 xBasis = normalize(offsetB - offsetA);
        vec2 yBasis = vec2(-xBasis.y, xBasis.x);
        vec2 pointA = offsetA + width * (position.x * xBasis + position.y * yBasis);
        vec2 pointB = offsetB + width * (position.x * xBasis + position.y * yBasis);
        vec2 point = mix(pointA, pointB, position.z);
        gl_Position = vec4(2.0 * point/resolution - 1.0, 0, 1);
      }`,

    frag: `
      precision highp float;
      uniform vec4 color;
      void main() {
        gl_FragColor = color;
      }`,

    depth: {
      enable: false
    },

    attributes: {
      position: {
        buffer: roundCapJoin.buffer,
        divisor: 0
      },
      ax: {
        buffer: regl.prop("dataX"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 0
      },
      ay: {
        buffer: regl.prop("dataY"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 0
      },
      bx: {
        buffer: regl.prop("dataX"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 1
      },
      by: {
        buffer: regl.prop("dataY"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 1
      }
    },

    uniforms: {
      width: regl.prop("width"),
      color: regl.prop("color"),
      resolution: regl.prop("resolution"),
      projection: regl.prop("projection")
    },

    cull: {
      enable: true,
      face: "back"
    },

    count: roundCapJoin.count,
    instances: regl.prop("segments"),
    viewport: regl.prop("viewport")
  });
}

function roundCapJoinGeometryDEMO(regl, resolution) {
  const instanceRoundRound = [
    [0, -0.5, 0, 0],
    [0, -0.5, 1, 0],
    [0, 0.5, 1, 0],
    [0, -0.5, 0, 0],
    [0, 0.5, 1, 0],
    [0, 0.5, 0, 0]
  ];
  // Add the left cap.
  for (let step = 0; step < resolution; step++) {
    const theta0 = Math.PI / 2 + ((step + 0) * Math.PI) / resolution;
    const theta1 = Math.PI / 2 + ((step + 1) * Math.PI) / resolution;
    instanceRoundRound.push([0, 0, 0, 1]);
    instanceRoundRound.push([
      0.5 * Math.cos(theta0),
      0.5 * Math.sin(theta0),
      0,
      1
    ]);
    instanceRoundRound.push([
      0.5 * Math.cos(theta1),
      0.5 * Math.sin(theta1),
      0,
      1
    ]);
  }
  // Add the right cap.
  for (let step = 0; step < resolution; step++) {
    const theta0 = (3 * Math.PI) / 2 + ((step + 0) * Math.PI) / resolution;
    const theta1 = (3 * Math.PI) / 2 + ((step + 1) * Math.PI) / resolution;
    instanceRoundRound.push([0, 0, 1, 1]);
    instanceRoundRound.push([
      0.5 * Math.cos(theta0),
      0.5 * Math.sin(theta0),
      1,
      1
    ]);
    instanceRoundRound.push([
      0.5 * Math.cos(theta1),
      0.5 * Math.sin(theta1),
      1,
      1
    ]);
  }
  return {
    buffer: regl.buffer(instanceRoundRound),
    count: instanceRoundRound.length
  };
}

function interleavedStripRoundCapJoinDEMO(regl, resolution) {
  roundCapJoin = roundCapJoinGeometryDEMO(regl, resolution);
  return regl({
    vert: `
      precision highp float;
      attribute vec4 position;
      attribute vec2 pointA, pointB;
      uniform float width;
      uniform mat4 projection;
  
      varying float colorIndexDEMO;

      void main() {
        colorIndexDEMO = position.w;
        vec2 xBasis = normalize(pointB - pointA);
        vec2 yBasis = vec2(-xBasis.y, xBasis.x);
        vec2 pointA = pointA + width * (position.x * xBasis + position.y * yBasis);
        vec2 pointB = pointB + width * (position.x * xBasis + position.y * yBasis);
        vec2 point = mix(pointA, pointB, position.z);
        gl_Position = projection * vec4(point, 0, 1);
      }`,

    frag: `
      precision highp float;
      uniform vec4 color;
      uniform vec4 colorDEMO;
      varying float colorIndexDEMO;
      void main() {
        gl_FragColor = mix(color, colorDEMO, colorIndexDEMO);
      }`,

    attributes: {
      position: {
        buffer: roundCapJoin.buffer,
        divisor: 0
      },
      pointA: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 0
      },
      pointB: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 2
      }
    },

    uniforms: {
      width: regl.prop("width"),
      color: regl.prop("color"),
      colorDEMO: regl.prop("colorDEMO"),
      projection: regl.prop("projection")
    },

    depth: {
      enable: false
    },

    cull: {
      enable: true,
      face: "back"
    },

    count: roundCapJoin.count,
    instances: regl.prop("segments"),
    viewport: regl.prop("viewport")
  });
}

function interleavedStripRoundCapJoin3DDEMO(regl, resolution) {
  roundCapJoin = roundCapJoinGeometry(regl, resolution);
  return regl({
    vert: `
      precision highp float;
      attribute vec3 position;
      attribute vec3 pointA, pointB;
      attribute vec3 colorA, colorB;

      uniform float width;
      uniform vec2 resolution;
      uniform mat4 model, view, projection;

      varying vec3 vColor;

      void main() {
        vec4 clip0 = projection * view * model * vec4(pointA, 1.0);
        vec4 clip1 = projection * view * model * vec4(pointB, 1.0);
        vec2 screen0 = resolution * (0.5 * clip0.xy/clip0.w + 0.5);
        vec2 screen1 = resolution * (0.5 * clip1.xy/clip1.w + 0.5);
        vec2 xBasis = normalize(screen1 - screen0);
        vec2 yBasis = vec2(-xBasis.y, xBasis.x);
        vec2 pt0 = screen0 + width * (position.x * xBasis + position.y * yBasis);
        vec2 pt1 = screen1 + width * (position.x * xBasis + position.y * yBasis);
        vec2 pt = mix(pt0, pt1, position.z);
        vec4 clip = mix(clip0, clip1, position.z);
        gl_Position = vec4(clip.w * (2.0 * pt/resolution - 1.0), clip.z, clip.w);
        vColor = mix(colorA, colorB, position.z);
      }`,

    frag: `
      precision highp float;
      varying vec3 vColor;
      void main() {
        gl_FragColor = vec4(vColor, 1);
      }`,

    cull: {
      enable: true,
      face: "back"
    },

    attributes: {
      position: {
        buffer: roundCapJoin.buffer,
        divisor: 0
      },
      pointA: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 0
      },
      pointB: {
        buffer: regl.prop("points"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 3
      },
      colorA: {
        buffer: regl.prop("color"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 0
      },
      colorB: {
        buffer: regl.prop("color"),
        divisor: 1,
        offset: Float32Array.BYTES_PER_ELEMENT * 3
      }
    },

    uniforms: {
      width: regl.prop("width"),
      model: regl.prop("model"),
      view: regl.prop("view"),
      projection: regl.prop("projection"),
      resolution: regl.prop("resolution")
    },

    cull: {
      enable: true,
      face: "back"
    },

    count: roundCapJoin.count,
    instances: regl.prop("segments"),
    viewport: regl.prop("viewport")
  });
}

module.exports = {
  miterJoin,
  bevelJoin,
  roundJoin,
  roundCap,
  squareCap,
  interleavedStripRoundCapJoin,
  interleavedStripRoundCapJoin3D,
  interleavedStripRoundCapJoin3DDEMO,
  noninterleavedStripRoundCapJoin,
  interleavedStripRoundCapJoinDEMO,
  customPoints,
  interleavedStrip,
  interleavedSegments,
  glLines,
  glLineStrip
};
