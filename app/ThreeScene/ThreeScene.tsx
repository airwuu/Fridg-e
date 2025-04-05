'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';

import Banana from "./Banana";
import Fridge from './Fridge';

const ThreeScene = () => {
  return (
    <Canvas style={{ width: '50vw', height: '50vh' }} orthographic>
      
      <PerspectiveCamera/>

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      <Suspense fallback={null}>
        <Fridge />

        <Banana />
      </Suspense>

    </Canvas>
  );
};

export default ThreeScene;
