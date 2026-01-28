import * as THREE from 'three'

export interface SprayPoint {
  position: THREE.Vector3
  normal: THREE.Vector3
  uv: THREE.Vector2
  color: string
  size: number
  opacity: number
  timestamp: number
}

export interface BrushStroke {
  id: string
  points: SprayPoint[]
  color: string
  brushType: BrushType
}

export type BrushType = 'spray' | 'marker' | 'drip'

export interface PlaneHit {
  position: THREE.Vector3
  normal: THREE.Vector3
  point: THREE.Vector3
}
