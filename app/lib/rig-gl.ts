/**
 * The Rig: every frame of the archive hung around a circular lighting truss,
 * tiers counter-rotating through stage haze while moving heads sweep the room.
 *
 * Plain WebGL2, no dependencies. One canvas, one small draw per frame, previews
 * the splash already downloaded as textures, and a baked noise texture for haze.
 * Rendering stops whenever the section is off screen.
 */

type Vec3 = [number, number, number];

export type RigFrame = { width: number; height: number };

export type RigOptions = {
  canvas: HTMLCanvasElement;
  frames: RigFrame[];
  image: (index: number) => HTMLImageElement | null;
  reducedMotion: boolean;
  onFront: (index: number) => void;
  onHover: (index: number | null) => void;
};

type Placed = {
  index: number;
  tier: number;
  phi: number;
  w: number;
  y: number;
  push: number;
  texture: WebGLTexture | null;
};

const H = 1.5;
const GAP = 0.15;
const TAU = Math.PI * 2;
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const ease = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const normalize = (a: Vec3): Vec3 => scale(a, 1 / Math.hypot(a[0], a[1], a[2]));
const wrap = (angle: number) => ((((angle + Math.PI) % TAU) + TAU) % TAU) - Math.PI;

const FRAME_VS = `#version 300 es
layout(location=0) in vec2 aQuad;
uniform mat4 uViewProj;
uniform vec3 uCenter;
uniform float uAngle;
uniform vec2 uSize;
out vec2 vUv;
out vec3 vWorld;
out vec3 vNormal;
void main(){
  vec3 right = vec3(cos(uAngle), 0.0, -sin(uAngle));
  vec3 world = uCenter + right * aQuad.x * uSize.x + vec3(0.0, 1.0, 0.0) * aQuad.y * uSize.y;
  vUv = aQuad + 0.5;
  vWorld = world;
  vNormal = vec3(sin(uAngle), 0.0, cos(uAngle));
  gl_Position = uViewProj * vec4(world, 1.0);
}`;

const FRAME_FS = `#version 300 es
precision highp float;
in vec2 vUv;
in vec3 vWorld;
in vec3 vNormal;
uniform sampler2D uTex;
uniform float uHasTex;
uniform float uHover;
uniform float uPower;
uniform vec3 uEye;
uniform vec2 uSize;
uniform vec4 uHits[6];
uniform vec3 uHitColor[6];
uniform int uHitCount;
out vec4 outColor;
void main(){
  vec3 toEye = normalize(uEye - vWorld);
  float facing = dot(vNormal, toEye);
  vec3 color;
  if (gl_FrontFacing) {
    // A slim paper border makes each panel read as a print hung on the truss.
    vec2 edge = min(vUv, 1.0 - vUv) * uSize;
    float border = step(min(edge.x, edge.y), 0.035);
    vec3 photo = uHasTex > 0.5 ? texture(uTex, vUv).rgb : vec3(0.07, 0.065, 0.06);
    color = mix(photo, vec3(0.86, 0.82, 0.77), border);
    float lit = mix(0.16, 1.0, smoothstep(-0.05, 0.8, facing));
    color *= lit * mix(0.35, 1.0, uPower);
  } else {
    // The back of the print: dull paper catching a little spill.
    color = vec3(0.12, 0.105, 0.1) * mix(0.5, 1.0, uPower);
  }
  vec3 spill = vec3(0.0);
  for (int i = 0; i < 6; i++) {
    if (i >= uHitCount) break;
    vec3 d = vWorld - uHits[i].xyz;
    spill += uHitColor[i] * exp(-dot(d, d) / (uHits[i].w * uHits[i].w));
  }
  color += spill * (gl_FrontFacing ? 0.28 : 0.5);
  color += vec3(0.95, 0.55, 0.62) * uHover * 0.12;
  // Atmospheric depth: the far side of the ring fades into the page's own ground.
  float depth = smoothstep(14.0, 34.0, distance(uEye, vWorld));
  float alpha = 1.0 - depth * 0.86;
  outColor = vec4(color * alpha, alpha);
}`;

const BEAM_VS = `#version 300 es
layout(location=0) in vec2 aBeam;
uniform mat4 uViewProj;
uniform vec3 uOrigin;
uniform vec3 uDir;
uniform vec3 uEye;
uniform float uLength;
uniform vec2 uWidth;
out vec2 vBeam;
out vec3 vWorld;
void main(){
  vec3 along = uOrigin + uDir * aBeam.x * uLength;
  vec3 side = normalize(cross(uDir, normalize(uEye - along)));
  float width = mix(uWidth.x, uWidth.y, aBeam.x);
  vec3 world = along + side * aBeam.y * width;
  vBeam = aBeam;
  vWorld = world;
  gl_Position = uViewProj * vec4(world, 1.0);
}`;

const BEAM_FS = `#version 300 es
precision highp float;
in vec2 vBeam;
in vec3 vWorld;
uniform sampler2D uNoise;
uniform vec3 uColor;
uniform float uIntensity;
uniform float uTime;
out vec4 outColor;
void main(){
  float core = pow(1.0 - abs(vBeam.y), 2.2);
  float fade = pow(1.0 - vBeam.x, 1.35) * smoothstep(0.0, 0.035, vBeam.x);
  float haze = texture(uNoise, vWorld.xy * 0.07 + vec2(uTime * 0.012, -uTime * 0.02)).r;
  haze = mix(0.45, 1.25, haze);
  float flare = exp(-vBeam.x * 38.0) * pow(1.0 - abs(vBeam.y), 6.0) * 1.4;
  outColor = vec4(uColor * (core * fade * haze * 0.42 + flare) * uIntensity, 0.0);
}`;

const SCREEN_VS = `#version 300 es
layout(location=0) in vec2 aQuad;
out vec2 vUv;
void main(){ vUv = aQuad + 0.5; gl_Position = vec4(aQuad * 2.0, 0.0, 1.0); }`;

const HAZE_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uNoise;
uniform float uTime;
uniform float uAspect;
uniform float uPower;
uniform float uFront;
out vec4 outColor;
void main(){
  vec2 p = vec2(vUv.x * uAspect, vUv.y);
  float a = texture(uNoise, p * 0.9 + vec2(uTime * 0.008, uTime * 0.004)).r;
  float b = texture(uNoise, p * 2.1 - vec2(uTime * 0.013, -uTime * 0.006)).r;
  float smoke = a * 0.65 + b * 0.35;
  if (uFront > 0.5) {
    // Low smoke rolling over the bottom tier, lit red from the stage.
    float band = smoothstep(0.42, 0.0, vUv.y);
    float alpha = band * smoothstep(0.28, 0.85, smoke) * 0.55 * mix(0.4, 1.0, uPower);
    outColor = vec4(vec3(0.42, 0.06, 0.05) * alpha, alpha);
    return;
  }
  float floorGlow = smoothstep(0.75, 0.0, vUv.y) * (0.55 + 0.45 * smoke);
  float centre = exp(-pow((vUv.x - 0.5) * 2.2, 2.0)) * smoothstep(0.9, 0.15, vUv.y);
  vec3 color = vec3(0.3, 0.03, 0.025) * floorGlow * smoke * mix(0.25, 1.0, uPower);
  color += vec3(0.18, 0.03, 0.045) * centre * smoke * 0.6 * uPower;
  // Pure light: added to whatever the page shows behind the canvas.
  outColor = vec4(color, 0.0);
}`;

const LINE_VS = `#version 300 es
layout(location=0) in vec3 aPos;
uniform mat4 uViewProj;
uniform vec3 uEye;
out float vDepth;
void main(){ vDepth = distance(aPos, uEye); gl_Position = uViewProj * vec4(aPos, 1.0); }`;

const LINE_FS = `#version 300 es
precision highp float;
in float vDepth;
uniform float uPower;
out vec4 outColor;
void main(){
  float fade = (1.0 - smoothstep(16.0, 36.0, vDepth) * 0.85) * mix(0.45, 0.85, uPower);
  outColor = vec4(vec3(0.66, 0.58, 0.6) * fade, fade);
}`;

function perspective(fovy: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ]);
}

function lookAt(eye: Vec3, target: Vec3) {
  const z = normalize(sub(eye, target));
  const x = normalize(cross([0, 1, 0], z));
  const y = cross(z, x);
  return new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -dot(x, eye), -dot(y, eye), -dot(z, eye), 1,
  ]);
}

function multiply(a: Float32Array, b: Float32Array) {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++)
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += a[k * 4 + row] * b[col * 4 + k];
      out[col * 4 + row] = sum;
    }
  return out;
}

function noiseTexture(gl: WebGL2RenderingContext) {
  // Tileable value-noise fBm, baked once; the shaders only sample it.
  const size = 128;
  const lattice = (cells: number, seed: number) => {
    let s = seed;
    const values = Array.from({ length: cells * cells }, () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    });
    return (x: number, y: number) => {
      const fx = (x / size) * cells;
      const fy = (y / size) * cells;
      const ix = Math.floor(fx);
      const iy = Math.floor(fy);
      const tx = fx - ix;
      const ty = fy - iy;
      const sx = tx * tx * (3 - 2 * tx);
      const sy = ty * ty * (3 - 2 * ty);
      const at = (i: number, j: number) =>
        values[((j % cells) + cells) % cells * cells + (((i % cells) + cells) % cells)];
      const top = at(ix, iy) + (at(ix + 1, iy) - at(ix, iy)) * sx;
      const bottom = at(ix, iy + 1) + (at(ix + 1, iy + 1) - at(ix, iy + 1)) * sx;
      return top + (bottom - top) * sy;
    };
  };
  const octaves = [lattice(4, 11), lattice(8, 23), lattice(16, 37), lattice(32, 51)];
  const data = new Uint8Array(size * size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      let value = 0;
      let amplitude = 0.55;
      let total = 0;
      octaves.forEach((octave) => {
        value += octave(x, y) * amplitude;
        total += amplitude;
        amplitude *= 0.5;
      });
      data[y * size + x] = Math.round((value / total) * 255);
    }
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, size, size, 0, gl.RED, gl.UNSIGNED_BYTE, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
  return texture;
}

function program(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      throw new Error(gl.getShaderInfoLog(shader) ?? "Shader failed to compile.");
    return shader;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(p) ?? "Program failed to link.");
  const cache = new Map<string, WebGLUniformLocation | null>();
  const u = (name: string) => {
    if (!cache.has(name)) cache.set(name, gl.getUniformLocation(p, name));
    return cache.get(name)!;
  };
  return { p, u };
}

export function createRig(options: RigOptions) {
  const { canvas, frames, reducedMotion } = options;
  const gl = canvas.getContext("webgl2", {
    antialias: true,
    alpha: true,
    premultipliedAlpha: true,
    powerPreference: "high-performance",
    preserveDrawingBuffer: false,
  });
  if (!gl) return null;

  const frameProgram = program(gl, FRAME_VS, FRAME_FS);
  const beamProgram = program(gl, BEAM_VS, BEAM_FS);
  const hazeProgram = program(gl, SCREEN_VS, HAZE_FS);
  const lineProgram = program(gl, LINE_VS, LINE_FS);
  const noise = noiseTexture(gl);
  const anisotropy = gl.getExtension("EXT_texture_filter_anisotropic");

  const quad = gl.createVertexArray();
  gl.bindVertexArray(quad);
  const quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5]),
    gl.STATIC_DRAW,
  );
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const beamVao = gl.createVertexArray();
  gl.bindVertexArray(beamVao);
  const beamBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, beamBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0, -1, 1, -1, 1, 1, 0, -1, 1, 1, 0, 1]),
    gl.STATIC_DRAW,
  );
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  let tiers = 3;
  let radius = 9;
  let placed: Placed[] = [];
  let tierY: number[] = [];
  let lineVao: WebGLVertexArrayObject | null = null;
  let lineBuffer: WebGLBuffer | null = null;
  let lineCount = 0;
  const textures: (WebGLTexture | null)[] = frames.map(() => null);

  function build(portrait: boolean) {
    tiers = portrait ? 5 : 3;
    const perTier = Math.ceil(frames.length / tiers);
    const widths = frames.map((frame) =>
      Math.max(0.95, Math.min(2.3, (H * frame.width) / frame.height)),
    );
    const groups = Array.from({ length: tiers }, (_, t) =>
      frames.map((_, i) => i).slice(t * perTier, (t + 1) * perTier),
    );
    const circumference = Math.max(
      ...groups.map((group) => group.reduce((sum, i) => sum + widths[i] + GAP, 0)),
    );
    radius = circumference / TAU;
    const spacing = H + 0.2;
    tierY = groups.map((_, t) => ((tiers - 1) / 2 - t) * spacing);
    placed = [];
    groups.forEach((group, t) => {
      const used = group.reduce((sum, i) => sum + widths[i], 0);
      const gap = (circumference - used) / group.length;
      let arc = 0;
      group.forEach((i) => {
        placed.push({
          index: i,
          tier: t,
          phi: (arc + widths[i] / 2) / radius,
          w: widths[i],
          y: tierY[t],
          push: 0,
          texture: textures[i],
        });
        arc += widths[i] + gap;
      });
    });

    // Box truss rings above and below the frames, with zig-zag bracing.
    const vertices: number[] = [];
    const ring = (y: number, r: number) => {
      const segments = 96;
      for (let s = 0; s < segments; s++) {
        const a = (s / segments) * TAU;
        const b = ((s + 1) / segments) * TAU;
        vertices.push(Math.sin(a) * r, y, Math.cos(a) * r, Math.sin(b) * r, y, Math.cos(b) * r);
      }
    };
    const top = tierY[0] + H / 2 + 0.45;
    const bottom = tierY[tiers - 1] - H / 2 - 0.45;
    [top, bottom].forEach((y) => {
      ring(y, radius - 0.2);
      ring(y + 0.32, radius - 0.2);
      const segments = 96;
      for (let s = 0; s < segments; s++) {
        const a = (s / segments) * TAU;
        const b = ((s + 1) / segments) * TAU;
        const r = radius - 0.2;
        const [y1, y2] = s % 2 ? [y, y + 0.32] : [y + 0.32, y];
        vertices.push(Math.sin(a) * r, y1, Math.cos(a) * r, Math.sin(b) * r, y2, Math.cos(b) * r);
      }
    });
    // Hanging pipes from the top truss down to each tier.
    for (let s = 0; s < 24; s++) {
      const a = (s / 24) * TAU;
      vertices.push(
        Math.sin(a) * (radius - 0.2), top, Math.cos(a) * (radius - 0.2),
        Math.sin(a) * (radius - 0.2), bottom + 0.32, Math.cos(a) * (radius - 0.2),
      );
    }
    lineCount = vertices.length / 3;
    if (!lineVao) {
      lineVao = gl!.createVertexArray();
      lineBuffer = gl!.createBuffer();
    }
    gl!.bindVertexArray(lineVao);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, lineBuffer);
    gl!.bufferData(gl!.ARRAY_BUFFER, new Float32Array(vertices), gl!.STATIC_DRAW);
    gl!.enableVertexAttribArray(0);
    gl!.vertexAttribPointer(0, 3, gl!.FLOAT, false, 0, 0);
  }

  // Moving heads on the truss plus two floor washes behind the ring.
  const beams = [
    { a: -0.72, color: [1, 0.2, 0.13] as Vec3, floor: false, phase: 0.2, speed: 0.21 },
    { a: -0.28, color: [1, 0.86, 0.8] as Vec3, floor: false, phase: 1.7, speed: 0.17 },
    { a: 0.22, color: [0.95, 0.42, 0.55] as Vec3, floor: false, phase: 3.1, speed: 0.19 },
    { a: 0.7, color: [1, 0.24, 0.16] as Vec3, floor: false, phase: 4.4, speed: 0.23 },
    { a: Math.PI - 0.5, color: [1, 0.18, 0.12] as Vec3, floor: true, phase: 0.9, speed: 0.13 },
    { a: Math.PI + 0.55, color: [0.92, 0.5, 0.6] as Vec3, floor: true, phase: 2.6, speed: 0.11 },
  ];

  let width = 1;
  let height = 1;
  let quality = 1;
  let progress = 0;
  let time = 0;
  let last = 0;
  let running = false;
  let raf = 0;
  let playing = !reducedMotion;
  let spin = 0;
  let velocity = 0;
  let dragging = false;
  let dragX = 0;
  let hovered: number | null = null;
  let front = -1;
  let focusTarget: { tier: number; angle: number } | null = null;
  let pinned: number | null = null;
  const focusOffset: number[] = [0, 0, 0, 0, 0];
  let holdUntil = 0;
  let pointer: [number, number] | null = null;
  let eye: Vec3 = [0, 0, 20];
  let target: Vec3 = [0, 0, 0];
  let fov = 0.55;
  let viewProj = new Float32Array(16);
  const frameTimes: number[] = [];
  let destroyed = false;

  const direction = (tier: number) => (tier % 2 ? -1 : 1);
  const tierAngle = (tier: number) =>
    direction(tier) * (spin + progress * 2.4) + focusOffset[tier];

  function resize() {
    const portrait = canvas.clientHeight > canvas.clientWidth * 1.15;
    const ratio = Math.min(window.devicePixelRatio || 1, portrait ? 1.25 : 1.5) * quality;
    width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    canvas.width = width;
    canvas.height = height;
    const shouldBePortrait = portrait;
    if ((tiers === 5) !== shouldBePortrait || !placed.length) build(shouldBePortrait);
    request();
  }

  function camera() {
    const aspect = width / height;
    const portrait = aspect < 0.87;
    fov = portrait ? 0.92 : aspect < 1.3 ? 0.68 : 0.54;
    const halfWidth = Math.tan(fov / 2) * aspect;
    // Rest distance: the front arc fills the frame edge to edge.
    const span = portrait ? 6.6 : Math.min(11.5, radius * 1.05);
    const rest = radius + span / (2 * halfWidth);
    const intro = ease(progress / 0.32);
    eye = [0, -1.3 + (1 - intro) * 7.5, rest + (1 - intro) * 17];
    target = [0, 0.45 - (1 - intro) * 1.5, 0];
    if (pointer && !dragging && !reducedMotion) {
      eye = add(eye, [pointer[0] * 1.2, -pointer[1] * 0.6, 0]);
    }
    viewProj = multiply(perspective(fov, aspect, 0.1, 120), lookAt(eye, target));
  }

  function uploadTextures(budget: number) {
    let uploads = 0;
    for (const item of placed) {
      if (uploads >= budget) break;
      if (textures[item.index]) continue;
      const image = options.image(item.index);
      if (!image) continue;
      const texture = gl!.createTexture();
      gl!.bindTexture(gl!.TEXTURE_2D, texture);
      gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, true);
      try {
        gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, image);
      } catch {
        gl!.deleteTexture(texture);
        textures[item.index] = null;
        continue;
      }
      gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, false);
      gl!.generateMipmap(gl!.TEXTURE_2D);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR_MIPMAP_LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      if (anisotropy)
        gl!.texParameterf(gl!.TEXTURE_2D, anisotropy.TEXTURE_MAX_ANISOTROPY_EXT, 4);
      textures[item.index] = texture;
      uploads++;
    }
    placed.forEach((item) => {
      item.texture = textures[item.index];
    });
    return uploads;
  }

  function beamState(index: number) {
    const beam = beams[index];
    const motion = reducedMotion ? 0 : time;
    const truss = tierY[0] + H / 2 + 0.6;
    if (beam.floor) {
      const origin: Vec3 = [Math.sin(beam.a) * radius * 0.55, tierY[tiers - 1] - 1.6, Math.cos(beam.a) * radius * 0.55];
      const yaw = beam.a + Math.PI + Math.sin(motion * beam.speed + beam.phase) * 0.45;
      const dir = normalize([Math.sin(yaw) * 0.55, 1, Math.cos(yaw) * 0.55 + 0.25]);
      return { origin, dir, length: 30, widths: [0.18, 3.6] as [number, number] };
    }
    const origin: Vec3 = [Math.sin(beam.a) * (radius - 0.2), truss, Math.cos(beam.a) * (radius - 0.2)];
    const yaw = beam.a + Math.sin(motion * beam.speed + beam.phase) * 0.62;
    const pitch = -0.55 - 0.32 * (0.5 + 0.5 * Math.sin(motion * beam.speed * 1.3 + beam.phase * 2.1));
    const dir = normalize([Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)]);
    return { origin, dir, length: 26, widths: [0.12, 2.6] as [number, number] };
  }

  function beamPower(index: number) {
    // Light check: fixtures come up one by one as the section arrives.
    const on = 0.05 + index * 0.035;
    const t = (progress - on) / 0.05;
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return t < 0.3 ? 0.9 : t < 0.5 ? 0.15 : t < 0.7 ? 1 : 0.6 + t * 0.4;
  }

  function hitPoint(origin: Vec3, dir: Vec3): Vec3 | null {
    // Where a beam crosses the cylinder of frames (outward-facing side).
    const a = dir[0] * dir[0] + dir[2] * dir[2];
    const b = 2 * (origin[0] * dir[0] + origin[2] * dir[2]);
    const c = origin[0] * origin[0] + origin[2] * origin[2] - radius * radius;
    const disc = b * b - 4 * a * c;
    if (a < 1e-5 || disc < 0) return null;
    const t = (-b + Math.sqrt(disc)) / (2 * a);
    return t > 0 ? add(origin, scale(dir, t)) : null;
  }

  function frameCenter(item: Placed): { center: Vec3; angle: number } {
    const angle = item.phi + tierAngle(item.tier);
    const r = radius + item.push;
    return { center: [Math.sin(angle) * r, item.y, Math.cos(angle) * r], angle };
  }

  function pick(x: number, y: number) {
    const aspect = width / height;
    const ndcX = x * 2 - 1;
    const ndcY = 1 - y * 2;
    const forward = normalize(sub(target, eye));
    const right = normalize(cross(forward, [0, 1, 0]));
    const up = cross(right, forward);
    const t = Math.tan(fov / 2);
    const ray = normalize(
      add(forward, add(scale(right, ndcX * t * aspect), scale(up, ndcY * t))),
    );
    let best: number | null = null;
    let nearest = Infinity;
    placed.forEach((item) => {
      const { center, angle } = frameCenter(item);
      const normal: Vec3 = [Math.sin(angle), 0, Math.cos(angle)];
      const facing = dot(ray, normal);
      if (facing >= -0.05) return;
      const distance = dot(sub(center, eye), normal) / facing;
      if (distance <= 0 || distance > nearest) return;
      const hit = sub(add(eye, scale(ray, distance)), center);
      const u = dot(hit, [Math.cos(angle), 0, -Math.sin(angle)]) / item.w;
      const v = hit[1] / H;
      if (Math.abs(u) <= 0.5 && Math.abs(v) <= 0.5) {
        nearest = distance;
        best = item.index;
      }
    });
    return best;
  }

  function project(point: Vec3) {
    const m = viewProj;
    const x = m[0] * point[0] + m[4] * point[1] + m[8] * point[2] + m[12];
    const y = m[1] * point[0] + m[5] * point[1] + m[9] * point[2] + m[13];
    const w = m[3] * point[0] + m[7] * point[1] + m[11] * point[2] + m[15];
    return [(x / w + 1) / 2, (1 - y / w) / 2];
  }

  function frameRect(index: number) {
    const item = placed.find((entry) => entry.index === index);
    if (!item) return null;
    const { center, angle } = frameCenter(item);
    const right: Vec3 = [Math.cos(angle), 0, -Math.sin(angle)];
    const corners = [
      [-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5],
    ].map(([u, v]) =>
      project(add(center, add(scale(right, u * item.w), [0, v * H, 0]))),
    );
    const bounds = canvas.getBoundingClientRect();
    const xs = corners.map((c) => bounds.left + c[0] * bounds.width);
    const ys = corners.map((c) => bounds.top + c[1] * bounds.height);
    const left = Math.min(...xs);
    const top = Math.min(...ys);
    return new DOMRect(left, top, Math.max(...xs) - left, Math.max(...ys) - top);
  }

  function updateFront() {
    const middle = Math.floor(tiers / 2);
    let best = -1;
    let closest = Infinity;
    placed.forEach((item) => {
      if (item.tier !== middle) return;
      const offset = Math.abs(wrap(item.phi + tierAngle(item.tier)));
      if (offset < closest) {
        closest = offset;
        best = item.index;
      }
    });
    // A frame brought forward by keyboard stays the caption until idle resumes.
    if (pinned !== null && performance.now() < holdUntil) best = pinned;
    else pinned = null;
    if (best !== front) {
      front = best;
      options.onFront(best);
    }
  }

  function draw() {
    camera();
    const power = Math.max(0.25, ...beams.map((_, i) => beamPower(i)));
    gl!.viewport(0, 0, width, height);
    gl!.clearColor(0, 0, 0, 0);
    gl!.clear(gl!.COLOR_BUFFER_BIT | gl!.DEPTH_BUFFER_BIT);
    gl!.disable(gl!.DEPTH_TEST);
    gl!.enable(gl!.BLEND);
    gl!.blendFunc(gl!.ONE, gl!.ONE);

    // 1. Haze: stage light in the room, added over the page's ground.
    gl!.useProgram(hazeProgram.p);
    gl!.bindVertexArray(quad);
    gl!.activeTexture(gl!.TEXTURE1);
    gl!.bindTexture(gl!.TEXTURE_2D, noise);
    gl!.uniform1i(hazeProgram.u("uNoise"), 1);
    gl!.uniform1f(hazeProgram.u("uTime"), reducedMotion ? 0 : time);
    gl!.uniform1f(hazeProgram.u("uAspect"), width / height);
    gl!.uniform1f(hazeProgram.u("uPower"), power);
    gl!.uniform1f(hazeProgram.u("uFront"), 0);
    gl!.drawArrays(gl!.TRIANGLES, 0, 6);

    gl!.enable(gl!.DEPTH_TEST);
    gl!.blendFunc(gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);

    // 2. Truss.
    if (lineVao) {
      gl!.useProgram(lineProgram.p);
      gl!.uniformMatrix4fv(lineProgram.u("uViewProj"), false, viewProj);
      gl!.uniform3fv(lineProgram.u("uEye"), eye);
      gl!.uniform1f(lineProgram.u("uPower"), power);
      gl!.bindVertexArray(lineVao);
      gl!.drawArrays(gl!.LINES, 0, lineCount);
    }

    // 3. Frames, lit by wherever the moving heads land.
    const states = beams.map((_, i) => beamState(i));
    const hits = new Float32Array(24);
    const hitColors = new Float32Array(18);
    let hitCount = 0;
    states.forEach((state, i) => {
      const point = hitPoint(state.origin, state.dir);
      const strength = beamPower(i);
      if (!point || strength <= 0 || beams[i].floor) return;
      hits.set([point[0], point[1], point[2], 1.9], hitCount * 4);
      hitColors.set(scale(beams[i].color, strength), hitCount * 3);
      hitCount++;
    });
    gl!.useProgram(frameProgram.p);
    gl!.bindVertexArray(quad);
    gl!.uniformMatrix4fv(frameProgram.u("uViewProj"), false, viewProj);
    gl!.uniform3fv(frameProgram.u("uEye"), eye);
    gl!.uniform1f(frameProgram.u("uPower"), power);
    gl!.uniform4fv(frameProgram.u("uHits"), hits);
    gl!.uniform3fv(frameProgram.u("uHitColor"), hitColors);
    gl!.uniform1i(frameProgram.u("uHitCount"), hitCount);
    gl!.uniform1i(frameProgram.u("uTex"), 0);
    gl!.activeTexture(gl!.TEXTURE0);
    // Back to front, so frames fading into the ground composite correctly.
    const order = placed
      .map((item) => {
        const { center } = frameCenter(item);
        return { item, distance: Math.hypot(center[0] - eye[0], center[1] - eye[1], center[2] - eye[2]) };
      })
      .sort((a, b) => b.distance - a.distance);
    order.forEach(({ item }) => {
      const target = item.index === hovered ? 0.55 : 0;
      item.push += (target - item.push) * (reducedMotion ? 1 : 0.18);
      const { center, angle } = frameCenter(item);
      gl!.uniform3fv(frameProgram.u("uCenter"), center);
      gl!.uniform1f(frameProgram.u("uAngle"), angle);
      gl!.uniform2f(frameProgram.u("uSize"), item.w, H);
      gl!.uniform1f(frameProgram.u("uHover"), item.index === hovered ? 1 : 0);
      gl!.uniform1f(frameProgram.u("uHasTex"), item.texture ? 1 : 0);
      gl!.bindTexture(gl!.TEXTURE_2D, item.texture);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
    });

    // 4. Beams, additive through the haze, occluded by the frames.
    gl!.blendFunc(gl!.ONE, gl!.ONE);
    gl!.depthMask(false);
    gl!.useProgram(beamProgram.p);
    gl!.bindVertexArray(beamVao);
    gl!.uniformMatrix4fv(beamProgram.u("uViewProj"), false, viewProj);
    gl!.uniform3fv(beamProgram.u("uEye"), eye);
    gl!.uniform1f(beamProgram.u("uTime"), reducedMotion ? 0 : time);
    gl!.activeTexture(gl!.TEXTURE1);
    gl!.bindTexture(gl!.TEXTURE_2D, noise);
    gl!.uniform1i(beamProgram.u("uNoise"), 1);
    states.forEach((state, i) => {
      const strength = beamPower(i);
      if (strength <= 0) return;
      gl!.uniform3fv(beamProgram.u("uOrigin"), state.origin);
      gl!.uniform3fv(beamProgram.u("uDir"), state.dir);
      gl!.uniform1f(beamProgram.u("uLength"), state.length);
      gl!.uniform2f(beamProgram.u("uWidth"), state.widths[0], state.widths[1]);
      gl!.uniform3fv(beamProgram.u("uColor"), beams[i].color);
      gl!.uniform1f(beamProgram.u("uIntensity"), strength * (beams[i].floor ? 0.7 : 1));
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
    });

    // 5. Low smoke in front of the bottom tier.
    gl!.disable(gl!.DEPTH_TEST);
    gl!.blendFunc(gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);
    gl!.useProgram(hazeProgram.p);
    gl!.bindVertexArray(quad);
    gl!.uniform1f(hazeProgram.u("uFront"), 1);
    gl!.drawArrays(gl!.TRIANGLES, 0, 6);
    gl!.depthMask(true);
    gl!.disable(gl!.BLEND);
  }

  function tick(now: number) {
    if (!running || destroyed) return;
    const delta = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    if (!reducedMotion) time += delta;

    // Idle drift, drag momentum, and the eased walk to a focused frame.
    if (!dragging) {
      velocity *= Math.pow(0.04, delta);
      if (Math.abs(velocity) < 0.0005) velocity = 0;
    }
    const idle = playing && !dragging && now > holdUntil ? 0.05 : 0;
    spin += (idle + velocity) * delta;
    if (focusTarget) {
      const current = tierAngle(focusTarget.tier);
      const remaining = wrap(focusTarget.angle - current);
      const step = remaining * (reducedMotion ? 1 : Math.min(1, delta * 6));
      focusOffset[focusTarget.tier] += step;
      if (Math.abs(remaining) < 0.002) focusTarget = null;
    }

    uploadTextures(6);
    draw();
    updateFront();

    // Resolution adapts down if a device cannot hold ~45fps.
    frameTimes.push(delta);
    if (frameTimes.length > 90) {
      frameTimes.shift();
      const average = frameTimes.reduce((sum, t) => sum + t, 0) / frameTimes.length;
      if (average > 0.022 && quality > 0.6) {
        quality = Math.max(0.6, quality - 0.15);
        frameTimes.length = 0;
        resize();
      }
    }

    const animating =
      !reducedMotion ||
      dragging ||
      velocity !== 0 ||
      focusTarget !== null ||
      placed.some((item) => Math.abs(item.push - (item.index === hovered ? 0.55 : 0)) > 0.001) ||
      placed.some((item) => !item.texture && options.image(item.index));
    raf = animating ? requestAnimationFrame(tick) : 0;
    if (!animating) last = 0;
  }

  function request() {
    if (running && !raf && !destroyed) raf = requestAnimationFrame(tick);
  }

  const api = {
    start() {
      if (running || destroyed) return;
      running = true;
      last = 0;
      request();
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    },
    resize,
    setProgress(value: number) {
      progress = clamp01(value);
      request();
    },
    setPointer(x: number, y: number) {
      pointer = [x - 0.5, y - 0.5];
      if (dragging) {
        const deltaX = x - dragX;
        dragX = x;
        spin += deltaX * 3.2;
        velocity = deltaX * 120;
      } else {
        const next = pick(x, y);
        if (next !== hovered) {
          hovered = next;
          options.onHover(next);
        }
      }
      request();
    },
    leave() {
      pointer = null;
      dragging = false;
      if (hovered !== null) {
        hovered = null;
        options.onHover(null);
      }
      request();
    },
    press(x: number) {
      dragging = true;
      pinned = null;
      dragX = x;
      velocity = 0;
      holdUntil = performance.now() + 2500;
    },
    release() {
      dragging = false;
      holdUntil = performance.now() + 1800;
      request();
    },
    pickAt(x: number, y: number) {
      return pick(x, y);
    },
    frameRect,
    setPlaying(value: boolean) {
      playing = value && !reducedMotion;
      request();
    },
    /** Turn the frame's tier until that frame faces the audience. */
    focus(index: number) {
      const item = placed.find((entry) => entry.index === index);
      if (!item) return;
      focusTarget = { tier: item.tier, angle: -item.phi };
      pinned = index;
      holdUntil = performance.now() + 6000;
      request();
    },
    front: () => front,
    destroy() {
      destroyed = true;
      api.stop();
      textures.forEach((texture) => texture && gl!.deleteTexture(texture));
      const lose = gl!.getExtension("WEBGL_lose_context");
      lose?.loseContext();
    },
  };

  resize();
  return api;
}

export type Rig = NonNullable<ReturnType<typeof createRig>>;
