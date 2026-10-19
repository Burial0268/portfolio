import { useRef, useEffect, useCallback } from 'react';

interface FFTVisualizerProps {
  analyser: AnalyserNode | null;
  playing: boolean;
}

const BAR_COUNT = 5;
const WIDTH = 16;
const HEIGHT = 16;
const GAP = 1;
const BAR_WIDTH = (WIDTH - GAP * (BAR_COUNT - 1)) / BAR_COUNT;
const MIN_HEIGHT = HEIGHT * 0.15;
const COLOR = '#6CE5E8';
const DECAY = 0.92;

export default function FFTVisualizer({ analyser, playing }: FFTVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const heightsRef = useRef<number[]>(new Array(BAR_COUNT).fill(MIN_HEIGHT));
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = WIDTH * dpr;
    const h = HEIGHT * dpr;

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.clearRect(0, 0, w, h);

    const heights = heightsRef.current;

    if (analyser && playing) {
      const data = (dataRef.current ??= new Uint8Array(analyser.frequencyBinCount));
      analyser.getByteFrequencyData(data);

      // Pick bins spread across the lower-mid range (most musical content)
      const binCount = data.length; // 32 bins with fftSize=64
      for (let i = 0; i < BAR_COUNT; i++) {
        const binIndex = Math.min(Math.floor((i + 1) * (binCount * 0.6) / BAR_COUNT), binCount - 1);
        const normalized = data[binIndex] / 255;
        const targetHeight = MIN_HEIGHT + normalized * (HEIGHT - MIN_HEIGHT);
        // Smooth rise and fall
        heights[i] = heights[i] < targetHeight
          ? heights[i] + (targetHeight - heights[i]) * 0.4
          : heights[i] * DECAY + targetHeight * (1 - DECAY);
      }
    } else {
      // Decay to resting height
      for (let i = 0; i < BAR_COUNT; i++) {
        heights[i] = heights[i] * 0.93 + MIN_HEIGHT * 0.07;
      }
    }

    // Draw bars
    for (let i = 0; i < BAR_COUNT; i++) {
      const x = (BAR_WIDTH + GAP) * i * dpr;
      const barH = heights[i] * dpr;
      ctx.fillStyle = COLOR;
      ctx.fillRect(x, h - barH, BAR_WIDTH * dpr, barH);
    }

    // Continue loop if playing, or if bars haven't settled yet
    const settled = !playing && heights.every(h => Math.abs(h - MIN_HEIGHT) < 0.5);
    if (!settled) {
      rafRef.current = requestAnimationFrame(draw);
    }
  }, [analyser, playing]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: WIDTH, height: HEIGHT, display: 'block' }}
    />
  );
}
