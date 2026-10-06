'use client'

// Inner viewer — must be imported via dynamic() with { ssr: false }
// three.js is not SSR-compatible

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface Model3DViewerInnerProps {
  /** Ready-to-fetch URL for the binary file (already proxied/authenticated). */
  fileUrl: string
  /** File format, e.g. ".stl" or ".3mf" (leading dot optional). */
  format: string
  className?: string
}

export function Model3DViewerInner({ fileUrl, format, className }: Model3DViewerInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 512
    const height = container.clientHeight || 512

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#F5F5F5')

    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100000)
    camera.position.set(0, 0, 5)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(5, 5, 5)
    dirLight.castShadow = true
    scene.add(dirLight)
    const backLight = new THREE.DirectionalLight(0xffffff, 0.2)
    backLight.position.set(-5, -5, -5)
    scene.add(backLight)

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    // Animation loop
    let animId = 0
    const animate = () => {
      animId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }

    // Center the object and frame it in the camera, for both STL meshes and 3MF groups.
    const centerAndFit = (object: THREE.Object3D) => {
      const box = new THREE.Box3().setFromObject(object)
      const center = new THREE.Vector3()
      box.getCenter(center)
      const size = new THREE.Vector3()
      box.getSize(size)

      // Re-center the object at the origin.
      object.position.sub(center)

      const diagonal = size.length() || 1
      const distance = diagonal * 1.2
      controls.target.set(0, 0, 0)
      camera.position.set(distance * 0.6, distance * 0.6, distance * 0.5)
      camera.near = Math.max(0.01, diagonal / 1000)
      camera.far = Math.max(10000, diagonal * 10)
      camera.updateProjectionMatrix()
      controls.update()
    }

    let disposed = false
    const normalizedFormat = format.startsWith('.')
      ? format.toLowerCase()
      : `.${format.toLowerCase()}`

    const onError = (err: unknown) => {
      console.error('3D model load error:', err)
    }

    if (normalizedFormat === '.stl') {
      const loader = new STLLoader()
      loader.load(
        fileUrl,
        (geometry) => {
          if (disposed) return
          geometry.computeVertexNormals()
          const material = new THREE.MeshPhongMaterial({
            color: 0x808080,
            specular: 0x404040,
            shininess: 32,
          })
          const mesh = new THREE.Mesh(geometry, material)
          mesh.castShadow = true
          mesh.receiveShadow = true
          scene.add(mesh)
          centerAndFit(mesh)
          animate()
        },
        undefined,
        onError
      )
    } else if (normalizedFormat === '.3mf') {
      const loader = new ThreeMFLoader()
      loader.load(
        fileUrl,
        (object) => {
          if (disposed) return
          object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true
              child.receiveShadow = true
            }
          })
          scene.add(object)
          centerAndFit(object)
          animate()
        },
        undefined,
        onError
      )
    } else {
      onError(new Error(`Formato não suportado: ${format}`))
      animate()
    }

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth
      const h = container.clientHeight
      if (w === 0 || h === 0) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    resizeObserver.observe(container)

    return () => {
      disposed = true
      cancelAnimationFrame(animId)
      resizeObserver.disconnect()
      controls.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [fileUrl, format])

  return <div ref={containerRef} className={className} style={{ background: '#F5F5F5' }} />
}
