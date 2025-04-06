'use client';

import { useState, useEffect, Suspense } from 'react';

import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
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
  const [doorIsOpen, setDoorIsOpen] = useState(false);

  // firestore door 
  useEffect(() => {
    const db = getFirestore();
    const fridgeDocRef = doc(db, 'fridges', 'main_fridge');

    const unsubscribe = onSnapshot(
      fridgeDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setDoorIsOpen(data.door_is_open === true);
        }
      },
      (error) => {
        console.error("Error fetching fridge door status:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

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
        <Fridge isOpen={doorIsOpen} />
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
