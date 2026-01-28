import { useRef, useEffect, useCallback } from 'react'

// Generate spray sound using Web Audio API (no external file needed)
export function useSpraySound() {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const isPlayingRef = useRef(false)

  useEffect(() => {
    return () => {
      stopSound()
    }
  }, [])

  const stopSound = () => {
    if (noiseNodeRef.current) {
      try {
        noiseNodeRef.current.stop()
      } catch {}
      noiseNodeRef.current = null
    }
    isPlayingRef.current = false
  }

  const startSpray = useCallback(() => {
    if (isPlayingRef.current) return

    try {
      // Create or resume audio context
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      // Create noise buffer (white noise for spray sound)
      const bufferSize = ctx.sampleRate * 2 // 2 seconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)

      // Fill with filtered noise (sounds more like spray)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3
      }

      // Create nodes
      const noiseNode = ctx.createBufferSource()
      noiseNode.buffer = buffer
      noiseNode.loop = true

      // Filter to make it sound more like spray
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 3000
      filter.Q.value = 0.5

      // Gain for volume control
      const gainNode = ctx.createGain()
      gainNode.gain.value = 0.15
      gainNodeRef.current = gainNode

      // Connect: noise -> filter -> gain -> output
      noiseNode.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(ctx.destination)

      noiseNode.start()
      noiseNodeRef.current = noiseNode
      isPlayingRef.current = true
    } catch (err) {
      console.warn('Audio failed:', err)
    }
  }, [])

  const stopSpray = useCallback(() => {
    stopSound()
  }, [])

  const setVolume = useCallback((vol: number) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = Math.max(0, Math.min(0.3, vol * 0.3))
    }
  }, [])

  return { startSpray, stopSpray, setVolume }
}
