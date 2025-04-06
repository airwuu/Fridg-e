'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { PerspectiveCamera, PointerLockControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from "three";

const CameraTilt = () => {
  const { camera } = useThree();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      setMouse({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    const maxRotation = 0.05; // maximum tilt angle in radians

    const targetRotY = mouse.x * maxRotation;
    const targetRotX = mouse.y * maxRotation;

    camera.rotation.y = Math.PI / 2 + targetRotY;
    camera.rotation.x = targetRotX;
  });

  return null;
};

export default CameraTilt;
