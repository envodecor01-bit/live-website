import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useLiving } from "@/store/living";

function Particles({ count = 2500 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const glow = useLiving((s) => s.glow);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = Math.random() * 8 + 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    mouse.current.x += (state.mouse.x - mouse.current.x) * 0.05;
    mouse.current.y += (state.mouse.y - mouse.current.y) * 0.05;
    ref.current.rotation.y += delta * 0.04;
    ref.current.rotation.x = mouse.current.y * 0.3;
    ref.current.rotation.z = mouse.current.x * 0.2;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        sizeAttenuation
        transparent
        opacity={0.65 * glow}
        color="#9ec5ff"
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function ParticleField({ className = "" }: { className?: string }) {
  const particles = useLiving((s) => s.particles);
  const count = Math.round(2500 * particles);
  if (particles === 0) return null;
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }} dpr={[1, 1.5]}>
        <Particles count={count} />
      </Canvas>
    </div>
  );
}
