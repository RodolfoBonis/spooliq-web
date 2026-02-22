'use client'

// Inner viewer component — must be imported via dynamic() with { ssr: false }
// three.js / @react-three/fiber are not SSR-compatible

import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Center, Environment } from '@react-three/drei'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { getModelFileUrl } from '@/lib/utils/cdn-model'

interface STLModelProps {
  url: string
}

function STLModel({ url }: STLModelProps) {
  const geometry = useLoader(STLLoader, url)
  const meshRef = useRef<THREE.Mesh>(null)

  return (
    <Center>
      <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
        <meshPhongMaterial color="#808080" specular="#404040" shininess={32} />
      </mesh>
    </Center>
  )
}

interface Model3DViewerInnerProps {
  fileUrl: string
  format: string
  className?: string
}

export function Model3DViewerInner({ fileUrl, format, className }: Model3DViewerInnerProps) {
  const proxiedUrl = getModelFileUrl(fileUrl) || fileUrl

  return (
    <div className={className} style={{ background: '#F5F5F5' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 30 }}
        style={{ background: '#F5F5F5' }}
        shadows
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
        <directionalLight position={[-5, -5, -5]} intensity={0.2} />
        <Suspense fallback={null}>
          {format === '.stl' || format === 'stl' ? (
            <STLModel url={proxiedUrl} />
          ) : (
            // 3MF: placeholder until full support is added
            <Center>
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshPhongMaterial color="#808080" wireframe />
              </mesh>
            </Center>
          )}
        </Suspense>
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  )
}
