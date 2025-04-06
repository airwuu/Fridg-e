'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { PerspectiveCamera, PointerLockControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from "three";

import Banana from "./Banana";
import Fridge from './Fridge';

const ThreeScene = () => {
  return (
    <Canvas style={{ width: '50vw', height: '50vh' }} orthographic={false}>
      <PerspectiveCamera 
        makeDefault 
        position={[-.18, -.1, -.05]} 
        rotation={[0, Math.PI /2, 0]}
      >
        <PointerLockControls />
      </PerspectiveCamera>

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
