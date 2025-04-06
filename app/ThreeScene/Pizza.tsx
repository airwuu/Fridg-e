import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

const Apple = () => {
  const { scene } = useGLTF('/assets/pizza/pizza.glb');
  const groupRef = useRef<THREE.Group>(null!);
  const [cubeSize, setCubeSize] = useState(1); // default size

  useEffect(() => {
    scene.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).layers.set(1);
      }
    });
  }, [scene]);
  
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
    <group ref={groupRef} scale={0.074} position={[-0.8, -0.12, -0.04]}>

      <mesh>
        <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
        <meshBasicMaterial wireframe color="red" visible={false}/>
      </mesh>

      <primitive object={scene} rotation={[Math.PI / 3.3, Math.PI / 0.58, 0]} />
    </group>
  );
};

export default Apple;
