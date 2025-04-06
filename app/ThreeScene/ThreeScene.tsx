'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { PerspectiveCamera, PointerLockControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from "three";

import Banana from "./Banana";
import Orange from "./Orange";
import Apple from "./Apple"; 
import Pizza from "./Pizza";
import Water from "./Water";
import Fridge from './Fridge';

import CameraTilt from "./CameraTilt";

const ThreeScene = () => {
  return (
    <Canvas style={{ width: '80vw', height: '80vh' }} orthographic={false}>
      <PerspectiveCamera 
        makeDefault 
        position={[-.06, -.1, -.05]} 
        rotation={[0, Math.PI / 2, 0]}>
        <CameraTilt />
      </PerspectiveCamera>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      <Suspense fallback={null}>
        <Fridge />
        <Apple />
        <Banana />
        <Orange />
        <Pizza />
        <Water />
      </Suspense>

    </Canvas>
  );
};

export default ThreeScene;
