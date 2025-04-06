'use client';

import { useRef,  } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DynamicLights = () => {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (dirLightRef.current) {
      dirLightRef.current.position.set(
        Math.sin(t) * 10,
        10,
        Math.cos(t) * 10
      );
    }


  });

  return (
    <>
      <ambientLight intensity={0.2} />
      
      <directionalLight
        ref={dirLightRef}
        intensity={1}
        color={0xffeedd}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <pointLight
        ref={pointLightRef}
        position={[0, 2, 0]}
        intensity={1.2}
        color={0x99ccff}
        distance={5}
      />

      <spotLight
        position={[0, 5, 5]}
        angle={0.3}
        penumbra={0.5}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </>
  );
};

export default DynamicLights;