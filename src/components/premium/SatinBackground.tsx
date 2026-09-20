import { useEffect, useRef, type MutableRefObject } from "react";
import { Renderer, Program, Mesh, Triangle, Color } from "ogl";

const vertexShader = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// A satin/silk cloth — layered sine interference for the woven pattern
// (not a lit height-field like a water surface), tinted teal/cyan. Reacts
// to the cursor as a real pinch/gather in the weave (not a ripple), and
// its flow rides on scroll velocity/direction. Speed is pre-integrated on
// the JS side so a change in pace never jumps the pattern's phase.
const fragmentShader = /* glsl */ `
precision highp float;

uniform float uRealTime;
uniform float uFlowPhase;
uniform float uScale;
uniform float uNoiseIntensity;
uniform float uAspect;
uniform vec2  uMouse;
uniform float uHover;
uniform float uMouseKick;
uniform vec3  uDeep;
uniform vec3  uMid;

varying vec2 vUv;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

void main() {
  float rnd = noise(gl_FragCoord.xy);
  vec2 uv = vUv;
  uv.x *= uAspect;

  vec2 mouseUv = uMouse;
  mouseUv.x *= uAspect;

  // a single point where the cloth is pressed — kept as a very light touch
  // on the texture coordinates (a real, but subtle, gather) so the visible
  // shape of the dimple is carried by the shading below instead, which
  // depends only on distance from the cursor and so is identical at every
  // angle — a plain circle, never a directional pull or a pinwheel
  vec2 toMouse = uv - mouseUv;
  float mDist = length(toMouse);
  float influence = exp(-mDist * 5.8) * uHover;
  float pinch = influence * influence;
  vec2 dir = normalize(toMouse + 0.0001);

  vec2 tex = uv * uScale;
  tex -= dir * pinch * 0.16;

  // pre-integrated phase (speed * dt, accumulated in JS) instead of
  // uSpeed * elapsed-time, so a pace change never jumps the pattern
  float tOffset = uFlowPhase;
  tex.y += 0.014 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.62 +
    0.38 * sin(5.0 * (tex.x + tex.y +
      cos(3.0 * tex.x + 5.0 * tex.y) +
      0.02 * tOffset) +
      sin(10.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec3 col = mix(uDeep, uMid, pattern);
  col -= rnd / 30.0 * uNoiseIntensity;

  // the depression itself: a plain radial shade — darker toward the
  // centre like a real press, with a soft brighter ring where the fold
  // catches light. Both terms are pure functions of distance from the
  // cursor, so the shape reads as one clean circle regardless of which
  // way the weave's diagonal grain runs underneath it.
  float rim = smoothstep(0.0, 0.5, influence) * smoothstep(1.0, 0.5, influence);
  col *= 1.0 - pinch * 0.32;
  col += uMid * rim * 0.24;

  // vignette so the cloth reads as a background, not a flat poster
  float vig = smoothstep(1.15, 0.25, length(vUv - 0.5) * 1.35);
  col = mix(uDeep * 0.7, col, vig);

  gl_FragColor = vec4(col, 1.0);
}
`;

const PALETTE = {
  deep: [0.008, 0.05, 0.06] as [number, number, number],
  mid: [0.03, 0.34, 0.4] as [number, number, number],
  clear: [0.007, 0.045, 0.055] as [number, number, number],
};

/** Full-screen fixed WebGL satin backdrop. Noise speed/intensity ride on
 *  live Lenis scroll velocity (with a direct nudge from scroll direction,
 *  so it flows along with the page, not just quickens in place), and the
 *  weave gathers around the live cursor position — all read each frame via
 *  refs, never React props, so none of this triggers a re-render. */
export default function SatinBackground({ velocityRef }: { velocityRef: MutableRefObject<number> }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 2), alpha: false });
    const gl = renderer.gl;
    gl.clearColor(PALETTE.clear[0], PALETTE.clear[1], PALETTE.clear[2], 1);
    container.appendChild(gl.canvas);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uRealTime: { value: 0 },
        uFlowPhase: { value: 0 },
        uScale: { value: 1.6 },
        uNoiseIntensity: { value: 0.62 },
        uAspect: { value: 1 },
        uMouse: { value: [0.5, 0.5] },
        uHover: { value: 0 },
        uMouseKick: { value: 0 },
        uDeep: { value: new Color(...PALETTE.deep) },
        uMid: { value: new Color(...PALETTE.mid) },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      const w = container!.clientWidth;
      const h = container!.clientHeight;
      renderer.setSize(w, h);
      program.uniforms.uAspect.value = w / h;
    }
    window.addEventListener("resize", resize);
    resize();

    const mouseTarget = { x: 0.5, y: 0.5 };
    const mouseSmoothed = { x: 0.5, y: 0.5 };
    let rawSpeed = 0;
    let lastMoveAt = -Infinity;

    function onPointerMove(ev: PointerEvent) {
      const nx = ev.clientX / window.innerWidth;
      const ny = 1 - ev.clientY / window.innerHeight;
      const dx = nx - mouseTarget.x;
      const dy = ny - mouseTarget.y;
      rawSpeed = Math.min(Math.sqrt(dx * dx + dy * dy) * 45, 3.5);
      mouseTarget.x = nx;
      mouseTarget.y = ny;
      lastMoveAt = performance.now();
    }
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let rafId = 0;
    let smoothedScrollKick = 0;
    let smoothedHover = 0;
    let smoothedMouseKick = 0;
    let flowPhase = 0;
    const start = performance.now();
    let lastFrame = start;

    function update(now: number) {
      const elapsed = (now - start) / 1000;
      const dt = Math.min((now - lastFrame) / 1000, 1 / 30);
      lastFrame = now;

      const rawScrollKick = Math.min(Math.abs(velocityRef.current) * 0.05, 4);
      const kickRate = rawScrollKick > smoothedScrollKick ? 0.05 : 0.015;
      smoothedScrollKick += (rawScrollKick - smoothedScrollKick) * kickRate;

      mouseSmoothed.x += (mouseTarget.x - mouseSmoothed.x) * 0.08;
      mouseSmoothed.y += (mouseTarget.y - mouseSmoothed.y) * 0.08;

      const idleMs = now - lastMoveAt;
      const hoverTarget = idleMs < 1800 ? 1 : 0;
      smoothedHover += (hoverTarget - smoothedHover) * (hoverTarget ? 0.09 : 0.07);
      smoothedMouseKick += (rawSpeed - smoothedMouseKick) * 0.1;
      rawSpeed *= 0.82;

      // a clearly-visible idle drift even when nothing is scrolling or
      // being hovered — "static" should never mean the water looks frozen
      const speed = 0.18 + smoothedScrollKick * 0.16;
      flowPhase += speed * dt;
      flowPhase += velocityRef.current * 0.0035 * (dt * 60);

      program.uniforms.uRealTime.value = elapsed;
      program.uniforms.uFlowPhase.value = flowPhase;
      program.uniforms.uNoiseIntensity.value = 0.5 + smoothedScrollKick * 0.22;
      program.uniforms.uMouse.value[0] = mouseSmoothed.x;
      program.uniforms.uMouse.value[1] = mouseSmoothed.y;
      program.uniforms.uHover.value = smoothedHover;
      program.uniforms.uMouseKick.value = smoothedMouseKick;

      renderer.render({ scene: mesh });
      rafId = requestAnimationFrame(update);
    }
    rafId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      try { container!.removeChild(gl.canvas); } catch { /* already gone */ }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // velocityRef is a stable ref, so this effect only ever runs once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [velocityRef]);

  return <div ref={containerRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
