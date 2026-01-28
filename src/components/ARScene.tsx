import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useXR } from '@react-three/xr'
import * as THREE from 'three'
import { useStore } from '../store'
import { SprayPoint } from '../types'
import { GraffitiRenderer } from './GraffitiRenderer'
import { useSpraySound } from '../hooks/useSpraySound'

export function ARScene() {
  const reticleRef = useRef<THREE.Mesh>(null)
  const viewerHitTestRef = useRef<XRHitTestSource | null>(null)
  const lastPointTime = useRef(0)
  const isSelectingRef = useRef(false)
  const currentHitPosRef = useRef<THREE.Vector3 | null>(null)

  const { gl } = useThree()
  const { session } = useXR()
  const { startSpray, stopSpray } = useSpraySound()

  const {
    selectedColor,
    selectedBrush,
    brushSize,
    startStroke,
    addPoint,
    endStroke,
    setHasHitTest,
    setDrawing,
  } = useStore()

  // Setup viewer-based hit test (detects surfaces from camera center)
  useEffect(() => {
    if (!session) return

    let hitTestSource: XRHitTestSource | null = null

    const setup = async () => {
      try {
        const refSpace = await session.requestReferenceSpace('viewer')
        hitTestSource = await (session as any).requestHitTestSource({ space: refSpace })
        viewerHitTestRef.current = hitTestSource
        console.log('✓ Hit test ready')
      } catch (err) {
        console.error('Hit test setup failed:', err)
      }
    }

    setup()

    // Touch/select handlers
    const onSelectStart = () => {
      console.log('→ Touch start')
      isSelectingRef.current = true
      setDrawing(true)
      startStroke(selectedColor, selectedBrush)
      startSpray()
    }

    const onSelectEnd = () => {
      console.log('→ Touch end')
      isSelectingRef.current = false
      setDrawing(false)
      endStroke()
      stopSpray()
    }

    session.addEventListener('selectstart', onSelectStart)
    session.addEventListener('selectend', onSelectEnd)

    return () => {
      session.removeEventListener('selectstart', onSelectStart)
      session.removeEventListener('selectend', onSelectEnd)
      stopSpray()
      hitTestSource?.cancel()
    }
  }, [session, selectedColor, selectedBrush, startStroke, endStroke, setDrawing, startSpray, stopSpray])

  // Each frame: check for surface hits and draw if touching
  useFrame((_s, _d, frame: XRFrame | undefined) => {
    if (!frame || !session) return

    const refSpace = gl.xr.getReferenceSpace()
    if (!refSpace) return

    // Get hit test results from viewer (center of screen)
    if (viewerHitTestRef.current) {
      const results = frame.getHitTestResults(viewerHitTestRef.current)

      if (results.length > 0) {
        const hit = results[0]
        const pose = hit.getPose(refSpace)

        if (pose) {
          const p = pose.transform.position
          currentHitPosRef.current = new THREE.Vector3(p.x, p.y, p.z)

          // Update reticle
          if (reticleRef.current) {
            reticleRef.current.visible = true
            reticleRef.current.position.set(p.x, p.y, p.z)

            const q = pose.transform.orientation
            reticleRef.current.quaternion.set(q.x, q.y, q.z, q.w)
            reticleRef.current.rotateX(-Math.PI / 2)
          }

          setHasHitTest(true)

          // Add paint point if selecting
          if (isSelectingRef.current) {
            const now = performance.now()
            if (now - lastPointTime.current > 20) {
              const point: SprayPoint = {
                position: new THREE.Vector3(p.x, p.y, p.z),
                normal: new THREE.Vector3(0, 0, 1),
                uv: new THREE.Vector2(0.5, 0.5),
                color: selectedColor,
                size: brushSize * (0.8 + Math.random() * 0.4),
                opacity: 0.5 + Math.random() * 0.5,
                timestamp: now,
              }
              addPoint(point)
              lastPointTime.current = now
            }
          }
        }
      } else {
        if (reticleRef.current) {
          reticleRef.current.visible = false
        }
        setHasHitTest(false)
      }
    }
  })

  return (
    <>
      <ambientLight intensity={1.5} />

      {/* Reticle showing detected surface */}
      <mesh ref={reticleRef} visible={false}>
        <ringGeometry args={[0.03, 0.04, 32]} />
        <meshBasicMaterial
          color={selectedColor}
          side={THREE.DoubleSide}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* All the spray paint */}
      <GraffitiRenderer />
    </>
  )
}
