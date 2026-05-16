import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useLiving } from "@/store/living";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Animated aurora / nebula. Cheap-ish: two layered fbm + radial vignette.
const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2  uMouse;
  uniform vec2  uRes;
  uniform float uGlow;
  uniform float uIntensity;
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform vec3  uColorBg;

  // hash + value noise
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0,0.0));
    float c = hash(i + vec2(0.0,1.0));
    float d = hash(i + vec2(1.0,1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
  }
  float fbm(vec2 p){
    float v = 0.0; float a = 0.5;
    for(int i=0;i<5;i++){ v += a*noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }

  void main(){
    vec2 uv = vUv;
    vec2 p = (uv - 0.5);
    p.x *= uRes.x / uRes.y;

    float t = uTime * 0.045;
    vec2 m = (uMouse - 0.5) * 0.5;

    // Two layered swirling fbm fields — slow, premium aurora
    vec2 q1 = p * 1.4 + vec2(t * 0.7, -t * 0.5);
    vec2 q2 = p * 0.7 + vec2(-t * 0.3, t * 0.9);
    float n1 = fbm(q1 + fbm(q1 + t) * 0.6);
    float n2 = fbm(q2 - fbm(q2 - t * 0.4) * 0.5);

    // Soft halo following the cursor
    float md = length(p - m);
    float halo = exp(-md * 1.8) * 0.35;

    // Distance-based brightness curve (vignetted aurora)
    float band1 = smoothstep(0.0, 0.7, n1) * smoothstep(1.2, 0.2, length(p));
    float band2 = smoothstep(0.1, 0.85, n2) * smoothstep(1.3, 0.1, length(p * 1.1));

    vec3 col = uColorBg;
    col += uColorA * band1 * 0.22 * uIntensity;
    col += uColorB * band2 * 0.18 * uIntensity;
    col += uColorA * halo * uGlow * 0.9;

    // Subtle scanline shimmer
    col += uColorA * 0.015 * sin(uv.y * 1400.0 + uTime * 0.6) * uIntensity;

    // Strong vignette
    float vig = smoothstep(1.5, 0.05, length(p));
    col *= 0.5 + 0.5 * vig;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function cssVarToVec3(varName: string, fallback: [number, number, number]): [number, number, number] {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  if (!raw) return fallback;
  // Parse via a temp element
  const probe = document.createElement("div");
  probe.style.color = raw;
  document.body.appendChild(probe);
  const cs = getComputedStyle(probe).color; // rgb(r, g, b)
  document.body.removeChild(probe);
  const m = cs.match(/\d+(\.\d+)?/g);
  if (!m || m.length < 3) return fallback;
  return [parseFloat(m[0]) / 255, parseFloat(m[1]) / 255, parseFloat(m[2]) / 255];
}

function ShaderPlane() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const { size } = useThree();
  const glow = useLiving((s) => s.glow);
  const shaderIntensity = useLiving((s) => s.shaderIntensity);
  const theme = useLiving((s) => s.theme);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uRes: { value: new THREE.Vector2(1, 1) },
      uGlow: { value: 1 },
      uIntensity: { value: 1 },
      uColorA: { value: new THREE.Color(0.48, 0.66, 1.0) },
      uColorB: { value: new THREE.Color(1.0, 0.55, 0.86) },
      uColorBg: { value: new THREE.Color(0.02, 0.03, 0.08) },
    }),
    [],
  );

  // Update colors from CSS tokens whenever theme/customPalette change
  useFrame((state, delta) => {
    if (!matRef.current) return;
    const u = matRef.current.uniforms;
    u.uTime.value += delta;
    // Smooth mouse follow
    mouse.current.x += (state.mouse.x * 0.5 + 0.5 - mouse.current.x) * 0.04;
    mouse.current.y += (state.mouse.y * 0.5 + 0.5 - mouse.current.y) * 0.04;
    u.uMouse.value.copy(mouse.current);
    u.uRes.value.set(size.width, size.height);
    u.uGlow.value = glow;
    u.uIntensity.value = shaderIntensity;
  });

  // Re-read colors on theme change
  useMemo(() => {
    const a = cssVarToVec3("--glow", [0.48, 0.66, 1.0]);
    const b = cssVarToVec3("--glow-secondary", [1.0, 0.55, 0.86]);
    const bg = cssVarToVec3("--background", [0.02, 0.03, 0.08]);
    uniforms.uColorA.value.setRGB(a[0], a[1], a[2]);
    uniforms.uColorB.value.setRGB(b[0], b[1], b[2]);
    uniforms.uColorBg.value.setRGB(bg[0], bg[1], bg[2]);
  }, [theme, uniforms]);

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  );
}

export function ShaderBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        gl={{ antialias: false, powerPreference: "high-performance", alpha: false }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 1] }}
      >
        <ShaderPlane />
      </Canvas>
    </div>
  );
}
