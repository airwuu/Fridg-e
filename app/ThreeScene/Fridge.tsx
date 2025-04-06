'use client';

import React, { useEffect, useState } from 'react';

const Fridge = () => {
  const thickness = 0.1;
  const width = 2;
  const depth = 2;
  const height = 4;
  
  // Door rotation in radians (0: closed, -Math.PI/2: open)
  const [doorRotation, setDoorRotation] = useState(0);

  // Group offset (world position of the fridge)
  const offset = [-0.8, -0.3, 0];
  const rotation = [0, 0, 0];

  // Easing function: easeInOutQuad
  const easeInOutQuad = (t) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };

  useEffect(() => {
    const duration = 2000; // Animation duration in milliseconds
    let start = null;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutQuad(progress);
      setDoorRotation(-Math.PI / 2 * easedProgress);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  return (
    <group position={offset} rotation={rotation} scale={0.1}>
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

      {/* Shelves */}
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

      {/* Left Wall */}
      <mesh position={[0, height / 2, depth / 2 - thickness / 2]}>
        <boxGeometry args={[width, height, thickness]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Right Wall */}
      <mesh position={[-width / 2 + thickness / 2, height / 2, 0]}>
        <boxGeometry args={[thickness, height, depth]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Front Door (hinged on the right side) */}
      <group
        position={[width / 2 - thickness / 2, height / 2, 1]}
        rotation={[0, doorRotation, 0]}
      >
        <mesh position={[0, 0, -1]}>
          <boxGeometry args={[thickness, height, depth]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </group>
    </group>
  );
};

export default Fridge;
