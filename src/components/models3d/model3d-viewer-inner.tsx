'use client'

// Inner viewer — must be imported via dynamic() with { ssr: false }
// three.js is not SSR-compatible

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { getModelFileUrl } from '@/lib/utils/cdn-model'

interface Model3DViewerInnerProps {
  fileUrl: string
  format: string
  className?: string
}

export function Model3DViewerInner({ fileUrl, format, className }: Model3DViewerInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const proxiedUrl = getModelFileUrl(fileUrl) || fileUrl

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 512
    const height = container.clientHeight || 512

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#F5F5F5')

    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 10000)
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
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }

    // Load STL
    const loadSTL = () => {
      const loader = new STLLoader()
      loader.load(
        proxiedUrl,
        (geometry) => {
          geometry.computeBoundingBox()
          const box = geometry.boundingBox!
          const center = new THREE.Vector3()
          box.getCenter(center)
          geometry.translate(-center.x, -center.y, -center.z)

          const size = new THREE.Vector3()
          box.getSize(size)
          const diagonal = size.length()
          const distance = diagonal * 1.5

          camera.position.set(distance * 0.6, distance * 0.6, distance * 0.5)
          camera.far = Math.max(10000, diagonal * 5)
          camera.updateProjectionMatrix()
          controls.update()

          const material = new THREE.MeshPhongMaterial({
            color: 0x808080,
            specular: 0x404040,
            shininess: 32,
          })
          const mesh = new THREE.Mesh(geometry, material)
          mesh.castShadow = true
          mesh.receiveShadow = true
          scene.add(mesh)

          animate()
        },
        undefined,
        (err) => console.error('STL load error:', err)
      )
    }

    if (format === '.stl' || format === 'stl') {
      loadSTL()
    } else {
      // 3MF: show a wireframe placeholder until full support is added
      const geo = new THREE.BoxGeometry(1, 1, 1)
      const mat = new THREE.MeshPhongMaterial({ color: 0x808080, wireframe: true })
      scene.add(new THREE.Mesh(geo, mat))
      animate()
    }

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(animId)
      resizeObserver.disconnect()
      controls.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [proxiedUrl, format])

  return <div ref={containerRef} className={className} style={{ background: '#F5F5F5' }} />
}
