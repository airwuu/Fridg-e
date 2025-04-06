import { useThree } from '@react-three/fiber';
import { useState, useEffect } from 'react';
import { EffectComposer, Outline } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

const OutlineEffect = () => {
  const { scene, size } = useThree();
  const [selectedObjects, setSelectedObjects] = useState([]);

  useEffect(() => {
    const meshes = [];
    // Create a temporary Layers instance set to layer 1 for testing
    const layerOne = new THREE.Layers();
    layerOne.set(1);

    scene.traverse((obj) => {
      if (obj.isMesh && obj.layers.test(layerOne)) {
        meshes.push(obj);
      }
    });
    setSelectedObjects(meshes);
    console.log("Objects selected for outline:", meshes);
  }, [scene]);

  return (
    <EffectComposer autoClear={false}>
      <Outline
        selection={selectedObjects}
        blendFunction={BlendFunction.SCREEN}
        edgeStrength={5}
        pulseSpeed={0}
        visibleEdgeColor={0xffffff}
        hiddenEdgeColor={0x000000}
        width={size.width}
        height={size.height}
        kernelSize={5}
      />
    </EffectComposer>
  );
};

export default OutlineEffect;
