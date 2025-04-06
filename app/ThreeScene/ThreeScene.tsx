'use client';

import { Suspense } from 'react';
import { PerspectiveCamera, PointerLockControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import Banana from "./Banana";
import Orange from "./Orange";
import Apple from "./Apple"; 
import Pizza from "./Pizza";
import Water from "./Water";
import Fridge from './Fridge';

import CameraTilt from "./CameraTilt";
import DynamicLights from "./DynamicLights";
import OutlineEffect from "./OutlineEffect";

const ThreeScene = () => {
  return (
    <Canvas style={{ width: '80vw', height: '80vh' }} orthographic={false}>
      <PerspectiveCamera 
        makeDefault 
        position={[-.06, -.1, -.05]} 
        rotation={[0, Math.PI / 2, 0]}>
        <CameraTilt />
      </PerspectiveCamera>
      
      <DynamicLights />
      
      <Suspense fallback={null}>
        <Fridge />
        <Apple />
        <Banana />
        <Orange />
        <Pizza />
        <Water />
        <OutlineEffect />
      </Suspense>


    </Canvas>
  );
};

export default ThreeScene;
