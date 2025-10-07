import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

function SpinningShape() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.6;
      ref.current.rotation.x += delta * 0.3;
    }
  });
  return (
    <mesh ref={ref} castShadow position={[0, 0, 0]}>      
      <icosahedronGeometry args={[1.1, 1]} />
      <meshStandardMaterial color={'#818CF8'} metalness={0.25} roughness={0.3} />
    </mesh>
  );
}

export default function Lesson3DHeader() {
  return (
    <View style={styles.wrap}>
      <Canvas shadows camera={{ position: [0, 0, 4], fov: 55 }}>
        <color attach="background" args={[ '#F5F7FF' ]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <SpinningShape />
      </Canvas>
      <View style={styles.overlayGradient} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 200, width: '100%', borderBottomWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F5F7FF' },
  overlayGradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
});
