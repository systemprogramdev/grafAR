import { Canvas } from '@react-three/fiber'
import { XR, ARButton } from '@react-three/xr'
import { ARScene } from './ARScene'
import { useStore } from '../store'
import { useState, useCallback } from 'react'

const COLORS = [
  '#000000', '#FFFFFF', '#FF003C', '#FF6B00', '#FFE600',
  '#00FF87', '#00D4FF', '#0055FF', '#A855F7', '#FF2D92',
]

export function ARCanvas() {
  const [isInAR, setIsInAR] = useState(false)
  const setARActive = useStore((s) => s.setARActive)

  const {
    selectedColor,
    setSelectedColor,
    brushSize,
    setBrushSize,
    strokes,
    clearStrokes,
  } = useStore()

  const handleSessionStart = useCallback(() => {
    setIsInAR(true)
    setARActive(true)
  }, [setARActive])

  const handleSessionEnd = useCallback(() => {
    setIsInAR(false)
    setARActive(false)
  }, [setARActive])

  return (
    <>
      {!isInAR && (
        <div className="app">
          <div className="card">
            <header>
              <div className="logo">
                <span className="logo-main">GRAFF</span>
                <span className="logo-accent">X</span>
              </div>
              <div className="version">v2.0</div>
            </header>

            <div className="controls">
              <div className="control-group">
                <div className="control-label">
                  <span className="label-icon">◈</span>
                  <span>COLOR</span>
                </div>
                <div className="color-row">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      className={`color-dot ${selectedColor === c ? 'on' : ''}`}
                      style={{ '--c': c } as React.CSSProperties}
                      onClick={() => setSelectedColor(c)}
                    />
                  ))}
                </div>
              </div>

              <div className="control-group">
                <div className="control-label">
                  <span className="label-icon">◎</span>
                  <span>SIZE</span>
                  <span className="size-val">{Math.round(brushSize * 1000)}</span>
                </div>
                <div className="slider-wrap">
                  <input
                    type="range"
                    min="0.005"
                    max="0.06"
                    step="0.005"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseFloat(e.target.value))}
                  />
                  <div
                    className="size-dot"
                    style={{
                      '--size': `${Math.max(6, brushSize * 300)}px`,
                      '--color': selectedColor,
                    } as React.CSSProperties}
                  />
                </div>
              </div>
            </div>

            <div className="actions">
              <ARButton
                sessionInit={{
                  requiredFeatures: ['hit-test'],
                  optionalFeatures: ['dom-overlay', 'local-floor'],
                }}
                className="launch"
              />
              {strokes.length > 0 && (
                <button className="clear" onClick={clearStrokes}>
                  ✕ CLEAR ({strokes.length})
                </button>
              )}
            </div>

            <footer>
              <span>◉ POINT</span>
              <span className="sep">›</span>
              <span>TAP</span>
              <span className="sep">›</span>
              <span>TAG ◉</span>
            </footer>
          </div>
        </div>
      )}

      <Canvas
        style={{ position: 'fixed', inset: 0 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      >
        <XR onSessionStart={handleSessionStart} onSessionEnd={handleSessionEnd}>
          <ARScene />
        </XR>
      </Canvas>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&display=swap');

        .app {
          position: fixed;
          inset: 0;
          display: grid;
          place-items: center;
          background: #000;
          padding: 20px;
          z-index: 1000;
        }

        .card {
          width: 100%;
          max-width: 340px;
          background: #0a0a0a;
          border: 1px solid #0ff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 0 40px rgba(0,255,255,0.15);
        }

        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .logo {
          font-family: 'Orbitron', monospace;
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .logo-main {
          color: #fff;
        }

        .logo-accent {
          color: #0ff;
          text-shadow: 0 0 20px #0ff, 0 0 40px #0ff;
        }

        .version {
          font-family: 'Orbitron', monospace;
          font-size: 10px;
          color: #444;
          padding: 4px 8px;
          border: 1px solid #333;
          border-radius: 4px;
        }

        .controls {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: 28px;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .control-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Orbitron', monospace;
          font-size: 10px;
          font-weight: 500;
          color: #666;
          letter-spacing: 2px;
        }

        .label-icon {
          color: #0ff;
          font-size: 12px;
        }

        .size-val {
          margin-left: auto;
          color: #0ff;
          font-size: 11px;
        }

        .color-row {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
        }

        .color-dot {
          aspect-ratio: 1;
          border-radius: 50%;
          background: var(--c);
          border: 2px solid #222;
          cursor: pointer;
          transition: all 0.15s;
          position: relative;
        }

        .color-dot:hover {
          transform: scale(1.1);
          border-color: #444;
        }

        .color-dot.on {
          border-color: #fff;
          transform: scale(1.1);
          box-shadow: 0 0 20px var(--c);
        }

        .slider-wrap {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .slider-wrap input {
          flex: 1;
          height: 4px;
          -webkit-appearance: none;
          background: #222;
          border-radius: 2px;
          outline: none;
        }

        .slider-wrap input::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: #0ff;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 12px #0ff;
        }

        .size-dot {
          width: var(--size);
          height: var(--size);
          min-width: 6px;
          min-height: 6px;
          max-width: 24px;
          max-height: 24px;
          background: var(--color);
          border-radius: 50%;
          box-shadow: 0 0 12px var(--color);
          transition: all 0.1s;
        }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .launch {
          display: block;
          width: 100%;
          padding: 16px;
          font-family: 'Orbitron', monospace;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 4px;
          color: #000;
          background: linear-gradient(90deg, #0ff 0%, #0af 50%, #0ff 100%);
          background-size: 200% 100%;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          text-transform: uppercase;
          box-shadow: 0 0 30px rgba(0,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.3);
          transition: all 0.3s;
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .launch:hover {
          box-shadow: 0 0 50px rgba(0,255,255,0.5), inset 0 1px 0 rgba(255,255,255,0.5);
          transform: translateY(-2px);
        }

        .launch:active {
          transform: translateY(0);
        }

        .clear {
          width: 100%;
          padding: 12px;
          font-family: 'Orbitron', monospace;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2px;
          color: #f55;
          background: transparent;
          border: 1px solid #f55;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear:hover {
          background: rgba(255,85,85,0.1);
          box-shadow: 0 0 20px rgba(255,85,85,0.3);
        }

        footer {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 16px;
          font-family: 'Orbitron', monospace;
          font-size: 9px;
          color: #333;
          letter-spacing: 1px;
        }

        .sep {
          color: #0ff;
          opacity: 0.5;
        }
      `}</style>
    </>
  )
}
