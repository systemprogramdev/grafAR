import { useMemo } from 'react'
import * as THREE from 'three'
import { useStore } from '../store'
import { BrushStroke } from '../types'

export function GraffitiRenderer() {
  const strokes = useStore((s) => s.strokes)
  const currentStroke = useStore((s) => s.currentStroke)

  const allStrokes = useMemo(() => {
    return currentStroke ? [...strokes, currentStroke] : strokes
  }, [strokes, currentStroke])

  return (
    <group>
      {allStrokes.map((stroke) => (
        <StrokeRenderer key={stroke.id} stroke={stroke} />
      ))}
    </group>
  )
}

function StrokeRenderer({ stroke }: { stroke: BrushStroke }) {
  const geometry = useMemo(() => {
    if (stroke.points.length === 0) return null

    const positions: number[] = []
    const colors: number[] = []
    const sizes: number[] = []

    const color = new THREE.Color(stroke.color)

    for (const point of stroke.points) {
      positions.push(point.position.x, point.position.y, point.position.z)
      colors.push(color.r, color.g, color.b)
      sizes.push(point.size * 100) // Scale for point size
    }

    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geom.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))

    return geom
  }, [stroke.points, stroke.color])

  if (!geometry) return null

  return (
    <points geometry={geometry}>
      <shaderMaterial
        transparent
        depthWrite={false}
        vertexColors
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </points>
  )
}

const vertexShader = `
  attribute float size;
  varying vec3 vColor;

  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  varying vec3 vColor;

  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;

    // Soft spray falloff
    float alpha = 1.0 - smoothstep(0.0, 0.5, r);
    alpha *= 0.7; // Overall transparency for spray look

    gl_FragColor = vec4(vColor, alpha);
  }
`
