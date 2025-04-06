import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

const Banana = () => {
  const { scene } = useGLTF('/assets/banana/scene.gltf');
  const groupRef = useRef<THREE.Group>(null!);
  const [cubeSize, setCubeSize] = useState(1); // default size

  useEffect(() => {
    if (scene) {
      // center model
      const box = new THREE.Box3().setFromObject(scene);
      const center = new THREE.Vector3();
      box.getCenter(center);
      scene.position.sub(center);

      // bounding box
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDimension = Math.max(size.x, size.y, size.z);
      setCubeSize(maxDimension * 1.2); 
    }
  }, [scene]);

  // rotata da ba na na
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });
  
  return (
    <group ref={groupRef} scale={0.00058} position={[-0.8, 0.02, 0.05]}>

      <mesh>
        <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
        <meshBasicMaterial wireframe color="red" />
      </mesh>

      <primitive object={scene} rotation={[Math.PI / 2, Math.PI / 0.58, 0]} />
    </group>
  );
};

export default Banana;
