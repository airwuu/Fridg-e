'use client';

import React from 'react';

const Fridge = () => {
  const thickness = 0.1;
  const width = 2;
  const depth = 2;
  const height = 4;

  // Group offset (world position of the fridge)
  const offset: [number, number, number] = [-0.8, -0.3, 0];
  const rotation: [number, number, number] = [0, 0, 0];

  return (
    <group position={offset} rotation={rotation} scale={.1}>
      {/* Floor */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width, thickness, depth]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, height, 0]}>
        <boxGeometry args={[width, thickness, depth]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Shelf */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[width, thickness, depth]} />
        <meshStandardMaterial color="white" />
      </mesh>

      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[width, thickness, depth]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, height / 2, -depth / 2 + thickness / 2]}>
        <boxGeometry args={[width, height, thickness]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Front Wall */}
      <mesh position={[0, height / 2, depth / 2 - thickness / 2]}>
        <boxGeometry args={[width, height, thickness]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-width / 2 + thickness / 2, height / 2, 0]}>
        <boxGeometry args={[thickness, height, depth]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </group>
  );
};

export default Fridge;
