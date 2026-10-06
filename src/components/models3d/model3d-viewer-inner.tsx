'use client'

// Inner viewer — must be imported via dynamic() with { ssr: false }
// three.js is not SSR-compatible

import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { AlertCircle, Loader2 } from 'lucide-react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { model3dService } from '@/services/model3d-service'

interface Model3DViewerInnerProps {
  /** ID of the model whose binary file should be fetched (authenticated via axios). */
  modelId: string
  /** File format, e.g. ".stl" or ".3mf" (leading dot optional). */
  format: string
  className?: string
}

type LoadState =
  | { status: 'loading'; progress: number | null }
  | { status: 'ready' }
  | { status: 'error'; message: string }

/** Recursively dispose every geometry and material (arrays included) under an object. */
function disposeObject(object: THREE.Object3D): void {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh
    if (mesh.geometry) {
      mesh.geometry.dispose()
    }
    if (mesh.material) {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const material of materials) {
        material.dispose()
      }
    }
  })
}

export function Model3DViewerInner({ modelId, format, className }: Model3DViewerInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<LoadState>({ status: 'loading', progress: null })

  const normalizedFormat = useMemo(
    () => (format.startsWith('.') ? format.toLowerCase() : `.${format.toLowerCase()}`),
    [format]
  )
  const isSupported = normalizedFormat === '.stl' || normalizedFormat === '.3mf'

  useEffect(() => {
    // Unsupported formats are handled at render time (no three.js setup needed).
    if (!isSupported) return

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
    const controller = new AbortController()

    const parseGeometry = (buffer: ArrayBuffer): THREE.Object3D => {
      if (normalizedFormat === '.stl') {
        const geometry = new STLLoader().parse(buffer)
        geometry.computeVertexNormals()
        const material = new THREE.MeshPhongMaterial({
          color: 0x808080,
          specular: 0x404040,
          shininess: 32,
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.castShadow = true
        mesh.receiveShadow = true
        return mesh
      }
      // normalizedFormat === '.3mf' (guaranteed by isSupported)
      const object = new ThreeMFLoader().parse(buffer)
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      return object
    }

    model3dService
      .getFileBuffer(modelId, {
        signal: controller.signal,
        onDownloadProgress: (event) => {
          if (disposed) return
          const progress = event.total ? event.loaded / event.total : null
          setState({ status: 'loading', progress })
        },
      })
      .then((buffer) => {
        if (disposed) return
        const object = parseGeometry(buffer)
        scene.add(object)
        centerAndFit(object)
        setState({ status: 'ready' })
        animate()
      })
      .catch((err: unknown) => {
        if (disposed || axios.isCancel(err) || controller.signal.aborted) return
        console.error('3D model load error:', err)
        setState({
          status: 'error',
          message: 'Não foi possível carregar o modelo 3D. Tente novamente.',
        })
      })

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
      controller.abort()
      cancelAnimationFrame(animId)
      resizeObserver.disconnect()
      controls.dispose()

      // Dispose every geometry/material in the scene, then the renderer itself.
      disposeObject(scene)
      scene.clear()
      renderer.dispose()
      renderer.forceContextLoss()
      const canvas = renderer.domElement
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas)
      }
    }
  }, [modelId, normalizedFormat, isSupported])

  return (
    <div className={className} style={{ position: 'relative', background: '#F5F5F5' }}>
      <div ref={containerRef} className="h-full w-full" />

      {!isSupported ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#F5F5F5] px-4 text-center text-red-600">
          <AlertCircle className="h-8 w-8" />
          <p className="text-sm">
            {`Formato não suportado: ${format.replace('.', '').toUpperCase()}`}
          </p>
        </div>
      ) : state.status === 'loading' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#F5F5F5] text-neutral-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">
            {state.progress !== null
              ? `Carregando modelo... ${Math.round(state.progress * 100)}%`
              : 'Carregando modelo...'}
          </p>
        </div>
      ) : state.status === 'error' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#F5F5F5] px-4 text-center text-red-600">
          <AlertCircle className="h-8 w-8" />
          <p className="text-sm">{state.message}</p>
        </div>
      ) : null}
    </div>
  )
}
