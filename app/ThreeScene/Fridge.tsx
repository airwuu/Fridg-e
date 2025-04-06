'use client';

import React, { useEffect, useState } from 'react';
import { RoundedBox } from '@react-three/drei';

const easeInOutQuad = (t: number) => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

const Fridge = ({ isOpen }: { isOpen: boolean }) => {
  const thickness = 0.1;
  const width = 2;
  const depth = 2;
  const height = 4;
  const radius = 0.05;

  const [doorRotation, setDoorRotation] = useState(0); // radians

  const offset : [number, number, number]= [-0.8, -0.3, 0];
  const rotation : [number, number, number]= [0, 0, 0];

  useEffect(() => {
    const duration = 1000; // ms
    const startRotation = doorRotation;
    const endRotation = isOpen ? -Math.PI / 1.4 : 0;
    const rotationDelta = endRotation - startRotation;

    let startTime: number | null = null;

    const animate = (timestamp : number) => {
      if (!startTime) startTime = timestamp;

      const elapsed = timestamp - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeInOutQuad(t);

      setDoorRotation(startRotation + rotationDelta * eased);

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isOpen]);

  return (
    <group position={offset} rotation={rotation} scale={0.1}>
      {/* floor */}
      <RoundedBox
        args={[width, thickness, depth]}
        radius={radius}
        smoothness={4}
        position={[0, 0, 0]}>
        <meshStandardMaterial color="white" />
      </RoundedBox>

      {/* ceiling */}
      <RoundedBox
        args={[width, thickness, depth]}
        radius={radius}
        smoothness={4}
        position={[0, height, 0]}>
        <meshStandardMaterial color="white" />
      </RoundedBox>

      {/* shelves */}
      <RoundedBox
        args={[width, thickness, depth]}
        radius={radius}
        smoothness={4}
        position={[0, 1.25, 0]}>
        <meshStandardMaterial color="white" />
      </RoundedBox>
      <RoundedBox
        args={[width, thickness, depth]}
        radius={radius}
        smoothness={4}
        position={[0, 2.5, 0]}>
        <meshStandardMaterial color="white" />
      </RoundedBox>

      {/* back */}
      <RoundedBox
        args={[width, height, thickness]}
        radius={radius}
        smoothness={4}
        position={[0, height / 2, -depth / 2 + thickness / 2]}>
        <meshStandardMaterial color="white" />
      </RoundedBox>

      {/* left */}
      <RoundedBox
        args={[width, height, thickness]}
        radius={radius}
        smoothness={4}
        position={[0, height / 2, depth / 2 - thickness / 2]}>
        <meshStandardMaterial color="white" />
      </RoundedBox>

      {/* right */}
      <RoundedBox
        args={[thickness, height, depth]}
        radius={radius}
        smoothness={4}
        position={[-width / 2 + thickness / 2, height / 2, 0]}>
        <meshStandardMaterial color="white" />
      </RoundedBox>

      <group
        position={[width / 2 - thickness / 2, height / 2, 1]}
        rotation={[0, doorRotation, 0]}>
        {/* door */}
        <mesh position={[0, 0, -1]}>
          <boxGeometry args={[thickness, height, depth]} />
          <meshStandardMaterial color="white" />
        </mesh>

        {/* handle */}
        <mesh position={[thickness / 2 + 0.05, 0, -1.8]}>
          <boxGeometry args={[0.05, 1, 0.05]} />
          <meshStandardMaterial color="gray" />
        </mesh>
      </group>
    </group>
  );
};

export default Fridge;
