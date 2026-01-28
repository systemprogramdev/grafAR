import { create } from 'zustand'
import { BrushStroke, BrushType, SprayPoint } from './types'

interface AppState {
  // AR State
  isARSupported: boolean
  isARActive: boolean
  hasHitTest: boolean

  // Painting state
  isDrawing: boolean
  selectedColor: string
  selectedBrush: BrushType
  brushSize: number
  strokes: BrushStroke[]
  currentStroke: BrushStroke | null

  // Actions
  setARSupported: (supported: boolean) => void
  setARActive: (active: boolean) => void
  setHasHitTest: (has: boolean) => void
  setDrawing: (drawing: boolean) => void
  setSelectedColor: (color: string) => void
  setSelectedBrush: (brush: BrushType) => void
  setBrushSize: (size: number) => void
  startStroke: (color: string, brush: BrushType) => void
  addPoint: (point: SprayPoint) => void
  endStroke: () => void
  clearStrokes: () => void
  undo: () => void
}

export const useStore = create<AppState>((set, get) => ({
  isARSupported: false,
  isARActive: false,
  hasHitTest: false,
  isDrawing: false,
  selectedColor: '#000000',
  selectedBrush: 'spray',
  brushSize: 0.005,
  strokes: [],
  currentStroke: null,

  setARSupported: (supported) => set({ isARSupported: supported }),
  setARActive: (active) => set({ isARActive: active }),
  setHasHitTest: (has) => set({ hasHitTest: has }),
  setDrawing: (drawing: boolean) => set({ isDrawing: drawing }),
  setSelectedColor: (color) => set({ selectedColor: color }),
  setSelectedBrush: (brush) => set({ selectedBrush: brush }),
  setBrushSize: (size) => set({ brushSize: size }),

  startStroke: (color, brush) => {
    const stroke: BrushStroke = {
      id: crypto.randomUUID(),
      points: [],
      color,
      brushType: brush,
    }
    set({ currentStroke: stroke, isDrawing: true })
  },

  addPoint: (point) => {
    const { currentStroke } = get()
    if (!currentStroke) return

    set({
      currentStroke: {
        ...currentStroke,
        points: [...currentStroke.points, point],
      },
    })
  },

  endStroke: () => {
    const { currentStroke, strokes } = get()
    if (currentStroke && currentStroke.points.length > 0) {
      set({
        strokes: [...strokes, currentStroke],
        currentStroke: null,
        isDrawing: false,
      })
    } else {
      set({ currentStroke: null, isDrawing: false })
    }
  },

  clearStrokes: () => set({ strokes: [], currentStroke: null }),

  undo: () => {
    const { strokes } = get()
    if (strokes.length > 0) {
      set({ strokes: strokes.slice(0, -1) })
    }
  },
}))
