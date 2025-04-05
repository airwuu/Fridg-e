import { useState, useEffect, forwardRef } from 'react';
import { useGLTF } from '@react-three/drei';


const Banana = () => {
  const { scene } = useGLTF('/assets/banana/scene.gltf');

  return (
    <group scale={0.005} position={[1, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
};

export default Banana;
