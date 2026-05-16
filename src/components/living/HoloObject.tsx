import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useLiving } from "@/store/living";

// Convert ANY CSS color (oklch, hsl, var(), etc) → rgb via a 1x1 canvas.
// THREE.Color cannot parse oklch directly, so we rasterize first.
function cssVarColor(name: string, fallback: string): THREE.Color {
  if (typeof window === "undefined") return new THREE.Color(fallback);
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw) return new THREE.Color(fallback);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.Color(fallback);
    ctx.fillStyle = "#000";
    ctx.fillStyle = raw; // browser parses oklch/hsl/var here
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return new THREE.Color(r / 255, g / 255, b / 255);
  } catch {
    return new THREE.Color(fallback);
  }
}

/**
 * Particle constellation — points distributed on a sphere (Fibonacci),
 * with subtle breathing, cursor-reactive rotation, and per-particle glow.
 * Pure points + a soft additive halo. No heavy 3D mesh.
 */
function Constellation() {
  const theme = useLiving((s) => s.theme);
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const { mouse } = useThree();

  const COUNT = 1400;

  const colors = useMemo(
    () => ({
      primary: cssVarColor("--glow", "#6f8cff"),
      accent: cssVarColor("--glow-secondary", "#a78bfa"),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );

  const { positions, colorsAttr, sizes } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const siz = new Float32Array(COUNT);
    const radius = 1.9;
    for (let i = 0; i < COUNT; i++) {
      // Fibonacci sphere
      const t = i / (COUNT - 1);
      const phi = Math.acos(1 - 2 * t);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = radius * (0.85 + Math.random() * 0.25);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const mix = Math.random();
      const c = colors.primary.clone().lerp(colors.accent, mix);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      siz[i] = 0.6 + Math.random() * 1.6;
    }
    return { positions: pos, colorsAttr: col, sizes: siz };
  }, [colors.primary, colors.accent]);

  // Update colors when theme changes (positions stay)
  useMemo(() => {
    if (!pointsRef.current) return;
    const attr = pointsRef.current.geometry.getAttribute("color") as THREE.BufferAttribute | undefined;
    if (!attr) return;
    for (let i = 0; i < COUNT; i++) {
      const c = colors.primary.clone().lerp(colors.accent, (i % 100) / 100);
      attr.setXYZ(i, c.r, c.g, c.b);
    }
    attr.needsUpdate = true;
  }, [colors.primary, colors.accent]);

  // Round soft particle texture
  const particleTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.4, "rgba(255,255,255,0.45)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      // Idle rotation + cursor-reactive sway
      const tx = mouse.x * 0.5;
      const ty = -mouse.y * 0.4;
      groupRef.current.rotation.y += (t * 0.0 + tx - groupRef.current.rotation.y) * 0.02 + 0.0015;
      groupRef.current.rotation.x += (ty - groupRef.current.rotation.x) * 0.02;
      const breathe = 1 + Math.sin(t * 0.6) * 0.04;
      groupRef.current.scale.setScalar(breathe);
    }
    if (haloRef.current) {
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.06 + Math.sin(t * 0.9) * 0.025;
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colorsAttr, 3]} />
          <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          map={particleTexture ?? undefined}
        />
      </points>

      {/* Soft halo plane behind */}
      <mesh ref={haloRef} position={[0, 0, -0.6]}>
        <planeGeometry args={[4.8, 4.8]} />
        <meshBasicMaterial
          color={colors.primary}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          map={particleTexture ?? undefined}
        />
      </mesh>
    </group>
  );
}

export function HoloObject({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5.4], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Constellation />
      </Canvas>
    </div>
  );
}
