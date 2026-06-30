export const vertexShader = `
  varying vec2 vUv;
  void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

export const feedbackFragmentShader = `
  precision highp float;

  uniform sampler2D tMap;
  uniform float uFalloff;
  uniform float uAlpha;
  uniform float uDissipation;
  uniform float uAspect;
  uniform vec2  uMouse;
  uniform vec2  uVelocity;

  varying vec2 vUv;

  void main() {
    vec4 color = texture2D(tMap, vUv) * uDissipation;

    vec2 cursor = vUv - uMouse;
    cursor.x *= uAspect;

    vec3 stamp = vec3(uVelocity * vec2(1.0, -1.0), 1.0 - pow(1.0 - min(1.0, length(uVelocity)), 3.0));
    float falloff = smoothstep(uFalloff, 0.0, length(cursor)) * uAlpha;

    color.rgb = mix(color.rgb, stamp, vec3(falloff));

    gl_FragColor = color;
  }
`

export const displayFragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform float uEffectiveTime;
  uniform float uBlurMix;
  uniform vec2  uMouse;
  uniform vec2  uResolution;
  uniform sampler2D tFlow;
  uniform float uRevert;
  uniform vec3  uColorDark;
  uniform vec3  uColorLight;

  varying vec2 vUv;

  // ---- Simplex噪声 (2D) ----
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // 动态颗粒
  float grain(vec2 uv, float time) {
    vec2 seed = uv * uResolution + time;
    return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453);
  }

  // ---- 主渲染 ----
  void main() {
      vec2 uv = vUv;
      float t = uEffectiveTime;

      vec4 flow = texture2D(tFlow, uv);
      vec2 flowVector = (flow.rg * 2.0 - 1.0) * 0.5;

      vec2 offset = vec2(
          snoise(uv * 1.0 + t * 0.05),
          snoise(uv * 1.0 - t * 0.03 + 100.0)
      ) * 0.4;

      vec2 offset2 = vec2(
          snoise(uv * 0.6 + t * 0.08),
          snoise(uv * 0.6 - t * 0.10 + 50.0)
      ) * 0.25;

      vec2 distortedUv = uv + flowVector + offset + offset2;

      float shape1 = snoise(distortedUv * 1.2 + t * 0.12);
      float shape2 = snoise(distortedUv * 0.7 - t * 0.10 + vec2(50.0, 30.0));
      float shape3 = snoise((distortedUv + offset * 0.3) * 1.8 + t * 0.08);

      float wave = snoise(uv * 0.5 + t * 0.06) * 0.3;

      float combined = shape1 * 0.4 + shape2 * 0.35 + shape3 * 0.25;
      combined += wave;

      float depth = snoise(distortedUv * 0.4 - t * 0.05);
      combined += depth * 0.4;

      combined = combined * 0.5 + 0.5;
      combined = smoothstep(0.3, 0.7, combined);

      float blur = 0.0;
      blur += snoise(distortedUv * 0.8 + t * 0.07) * 0.4;
      blur += snoise(distortedUv * 0.5 - t * 0.06) * 0.6;
      blur = blur * 0.5 + 0.5;

      float final = mix(combined, blur, uBlurMix);
      final = smoothstep(0.2, 0.8, final);

      vec3 color = vec3(final);
      color = pow(color, vec3(1.5));
      color = mix(uColorDark, uColorLight, color);

      float vignette = length(uv - 0.5);
      vignette = 1.0 - smoothstep(0.3, 1.1, vignette);
      color *= mix(0.7, 1.0, vignette);

      float grainValue = grain(uv, uEffectiveTime * 50.0);
      color += (grainValue - 0.5) * 0.08;

      vec3 differenceColor = abs(vec3(1.0) - color);
      color = mix(color, differenceColor, uRevert);

      gl_FragColor = vec4(color, 1.0);
  }
`
