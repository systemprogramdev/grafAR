import { useStore } from '../store'
import { useState, useRef } from 'react'
import { BrushType } from '../types'

const COLORS = [
  '#FF0000', '#FF6600', '#FFFF00', '#00FF00', '#00FFFF',
  '#0066FF', '#CC00FF', '#FF69B4', '#FFFFFF', '#000000',
  '#666666', '#ff0040', '#33ff33', '#3333ff', '#ffff33',
]

const BRUSHES: { type: BrushType; icon: string; label: string }[] = [
  { type: 'spray', icon: '◉', label: 'SPRAY' },
  { type: 'marker', icon: '▮', label: 'MARKER' },
  { type: 'drip', icon: '◢', label: 'DRIP' },
]

interface UIProps {
  onExitAR?: () => void
  isInAR?: boolean
}

export function UI({ onExitAR, isInAR }: UIProps) {
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [showPanel, setShowPanel] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    selectedColor,
    setSelectedColor,
    selectedBrush,
    setSelectedBrush,
    brushSize,
    setBrushSize,
    clearStrokes,
    undo,
    strokes,
    hasHitTest,
    isDrawing,
  } = useStore()

  const showMessage = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(null), 2000)
  }

  const takePhoto = async () => {
    try {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png', 1.0)
        const link = document.createElement('a')
        link.download = `graffiti-${Date.now()}.png`
        link.href = dataUrl
        link.click()
        showMessage('[ CAPTURED ]')
      }
    } catch {
      showMessage('[ ERROR ]')
    }
  }

  const saveGraffiti = async () => {
    if (strokes.length === 0) {
      showMessage('[ NO DATA ]')
      return
    }
    setSaving(true)
    try {
      let location = null
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 5000 })
        )
        location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          alt: pos.coords.altitude,
        }
      } catch {}

      const data = {
        id: crypto.randomUUID(),
        ts: Date.now(),
        location,
        strokes: strokes.map(s => ({
          id: s.id,
          color: s.color,
          brush: s.brushType,
          pts: s.points.map(p => [
            Math.round(p.position.x * 1e4) / 1e4,
            Math.round(p.position.y * 1e4) / 1e4,
            Math.round(p.position.z * 1e4) / 1e4,
            Math.round(p.size * 1e4) / 1e4,
          ]),
        })),
      }

      const saved = JSON.parse(localStorage.getItem('graffiti') || '[]')
      saved.push(data)
      localStorage.setItem('graffiti', JSON.stringify(saved))

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const link = document.createElement('a')
      link.download = `tag-${data.id.slice(0, 8)}.json`
      link.href = URL.createObjectURL(blob)
      link.click()

      showMessage('[ SAVED ]')
    } catch {
      showMessage('[ ERROR ]')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="ar-overlay">
      <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} />

      {/* Toast */}
      {message && (
        <div className="toast panel panel-glow">
          <span className="text-glow">{message}</span>
        </div>
      )}

      {/* Top Bar */}
      <div className="top-bar">
        <div className={`status-chip panel ${hasHitTest ? 'panel-success' : 'panel-warning'}`}>
          <span className={hasHitTest ? 'text-success' : 'text-warning'}>
            {hasHitTest ? '◉ LOCKED' : '◎ SCANNING'}
          </span>
        </div>

        <div className="top-actions">
          {isInAR && (
            <button className="btn btn-danger btn-glow" onClick={onExitAR}>
              ✕ EXIT AR
            </button>
          )}
          <button
            className="btn btn-secondary"
            onClick={() => setShowPanel(!showPanel)}
          >
            {showPanel ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {/* Drawing Indicator */}
      {isDrawing && (
        <div className="drawing-indicator panel panel-glow">
          <span className="text-glow blink">● REC</span>
        </div>
      )}

      {/* Main Control Panel */}
      {showPanel && (
        <div className="control-panel panel panel-terminal">
          <div className="panel-header">
            <span className="text-primary">SYS://GRAFFITI.AR</span>
            <span className="text-muted">{strokes.length} STROKES</span>
          </div>

          {/* Brush Selection */}
          <div className="brush-row">
            {BRUSHES.map((b) => (
              <button
                key={b.type}
                className={`btn ${selectedBrush === b.type ? 'btn-primary btn-glow' : 'btn-secondary'}`}
                onClick={() => setSelectedBrush(b.type)}
              >
                <span style={{ fontSize: 18 }}>{b.icon}</span>
                <small>{b.label}</small>
              </button>
            ))}
          </div>

          {/* Color Grid */}
          <div className="color-grid">
            {COLORS.map((c) => (
              <button
                key={c}
                className={`color-btn ${selectedColor === c ? 'selected' : ''}`}
                style={{
                  backgroundColor: c,
                  boxShadow: selectedColor === c ? `0 0 12px ${c}` : 'none'
                }}
                onClick={() => setSelectedColor(c)}
              />
            ))}
          </div>

          {/* Size Slider */}
          <div className="size-row">
            <span className="text-muted">SIZE</span>
            <input
              type="range"
              className="slider"
              min="0.005"
              max="0.06"
              step="0.005"
              value={brushSize}
              onChange={(e) => setBrushSize(parseFloat(e.target.value))}
            />
            <div
              className="size-preview"
              style={{
                width: brushSize * 400,
                height: brushSize * 400,
                backgroundColor: selectedColor,
                boxShadow: `0 0 8px ${selectedColor}`
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="action-grid">
            <button className="btn btn-secondary" onClick={undo} disabled={strokes.length === 0}>
              ↩ UNDO
            </button>
            <button className="btn btn-danger" onClick={clearStrokes} disabled={strokes.length === 0}>
              ✕ CLEAR
            </button>
            <button className="btn btn-primary btn-glow" onClick={takePhoto}>
              ◉ CAPTURE
            </button>
            <button className="btn btn-success btn-glow" onClick={saveGraffiti} disabled={saving || strokes.length === 0}>
              {saving ? '...' : '↓ SAVE'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .ar-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 12px;
          z-index: 100;
        }

        .ar-overlay > * {
          pointer-events: auto;
        }

        .toast {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          padding: 12px 24px;
          z-index: 1000;
          font-family: monospace;
        }

        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }

        .status-chip {
          padding: 8px 16px;
          font-family: monospace;
          font-size: 12px;
        }

        .top-actions {
          display: flex;
          gap: 8px;
        }

        .drawing-indicator {
          align-self: center;
          padding: 8px 20px;
          font-family: monospace;
        }

        .blink {
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .control-panel {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          max-height: 60vh;
          overflow-y: auto;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          font-family: monospace;
          font-size: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border-color, #333);
        }

        .brush-row {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .brush-row .btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px;
        }

        .color-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 6px;
        }

        .color-btn {
          width: 100%;
          aspect-ratio: 1;
          border: 2px solid transparent;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .color-btn.selected {
          border-color: #fff;
          transform: scale(1.1);
        }

        .size-row {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: monospace;
          font-size: 11px;
        }

        .slider {
          flex: 1;
          height: 6px;
          -webkit-appearance: none;
          background: #333;
          border-radius: 3px;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: var(--primary, #0ff);
          border-radius: 50%;
          cursor: pointer;
        }

        .size-preview {
          min-width: 8px;
          min-height: 8px;
          max-width: 24px;
          max-height: 24px;
          border-radius: 50%;
        }

        .action-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .action-grid .btn {
          font-family: monospace;
          font-size: 11px;
          padding: 10px 8px;
        }

        .text-success { color: #0f0; }
        .text-warning { color: #ff0; }
        .text-primary { color: var(--primary, #0ff); }
        .text-muted { color: #666; }
        .text-glow { text-shadow: 0 0 10px currentColor; }

        .panel-success { border-color: #0f0; }
        .panel-warning { border-color: #ff0; }
      `}</style>
    </div>
  )
}
