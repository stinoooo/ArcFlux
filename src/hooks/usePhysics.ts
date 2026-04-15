'use client'

import { useCallback, useEffect, useRef } from 'react'
import Matter from 'matter-js'
import { useFluxStore } from '@/store/useFluxStore'
import { randomRange } from '@/lib/utils'

interface DetectedBlock {
  x: number
  y: number
  width: number
  height: number
  area: number
}

interface UsePhysicsResult {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  initPhysics: (canvas: HTMLCanvasElement) => void
  cleanup: () => void
  updateDetectedBlocks: (blocks: DetectedBlock[]) => void
  spawnBall: () => void
  clearBalls: () => void
}

export function usePhysics(): UsePhysicsResult {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const renderRef = useRef<Matter.Render | null>(null)
  const runnerRef = useRef<Matter.Runner | null>(null)
  const blocksRef = useRef<Matter.Body[]>([])
  const ballsRef = useRef<Matter.Body[]>([])
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const {
    spawnMode,
    spawnInterval,
    spawnPositionX,
    bounciness,
    gravity,
    ballSize,
    boxOpacity,
    showDetection,
    isStreaming,
  } = useFluxStore()

  const initPhysics = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas

    // Clean up existing
    if (runnerRef.current) Matter.Runner.stop(runnerRef.current)
    if (renderRef.current) Matter.Render.stop(renderRef.current)
    if (engineRef.current) {
      Matter.World.clear(engineRef.current.world, false)
      Matter.Engine.clear(engineRef.current)
    }

    const engine = Matter.Engine.create({ gravity: { x: 0, y: gravity } })

    const render = Matter.Render.create({
      canvas,
      engine,
      options: {
        width: canvas.width,
        height: canvas.height,
        wireframes: false,
        background: 'transparent',
      },
    })

    // Walls
    const wallThickness = 50
    Matter.Composite.add(engine.world, [
      Matter.Bodies.rectangle(-wallThickness / 2, canvas.height / 2, wallThickness, canvas.height * 2, { isStatic: true, render: { visible: false } }),
      Matter.Bodies.rectangle(canvas.width + wallThickness / 2, canvas.height / 2, wallThickness, canvas.height * 2, { isStatic: true, render: { visible: false } }),
    ])

    const runner = Matter.Runner.create()
    Matter.Render.run(render)
    Matter.Runner.run(runner, engine)

    engineRef.current = engine
    renderRef.current = render
    runnerRef.current = runner
  }, [gravity])

  const cleanup = useCallback(() => {
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current)
    if (runnerRef.current) Matter.Runner.stop(runnerRef.current)
    if (renderRef.current) Matter.Render.stop(renderRef.current)
    if (engineRef.current) {
      Matter.World.clear(engineRef.current.world, false)
      Matter.Engine.clear(engineRef.current)
    }
  }, [])

  const updateDetectedBlocks = useCallback((blocks: DetectedBlock[]) => {
    if (!engineRef.current || !showDetection) return

    const world = engineRef.current.world

    // Remove old blocks
    blocksRef.current.forEach(body => Matter.Composite.remove(world, body))
    blocksRef.current = []

    // Create new blocks
    blocks.forEach(block => {
      const body = Matter.Bodies.rectangle(
        block.x + block.width / 2,
        block.y + block.height / 2,
        block.width,
        block.height,
        {
          isStatic: true,
          restitution: bounciness,
          render: {
            fillStyle: `rgba(20, 184, 166, ${boxOpacity / 100})`,
            strokeStyle: 'rgba(45, 212, 191, 0.8)',
            lineWidth: 2,
          },
        }
      )
      Matter.Composite.add(world, body)
      blocksRef.current.push(body)
    })
  }, [showDetection, bounciness, boxOpacity])

  const spawnBall = useCallback(() => {
    if (!engineRef.current || !canvasRef.current || spawnMode !== 'balls') return

    const x = (spawnPositionX / 100) * canvasRef.current.width + randomRange(-20, 20)

    const ball = Matter.Bodies.circle(x, -ballSize, ballSize, {
      restitution: bounciness,
      friction: 0.001,
      render: {
        fillStyle: `hsl(${randomRange(165, 185)}, 80%, 55%)`,
      },
    })

    Matter.Composite.add(engineRef.current.world, ball)
    ballsRef.current.push(ball)

    // Cleanup balls off screen
    const height = canvasRef.current.height
    ballsRef.current = ballsRef.current.filter(b => {
      if (b.position.y > height + 100) {
        Matter.Composite.remove(engineRef.current!.world, b)
        return false
      }
      return true
    })
  }, [spawnMode, spawnPositionX, ballSize, bounciness])

  const clearBalls = useCallback(() => {
    if (!engineRef.current) return
    ballsRef.current.forEach(ball => Matter.Composite.remove(engineRef.current!.world, ball))
    ballsRef.current = []
  }, [])

  // Update gravity
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.gravity.y = gravity
    }
  }, [gravity])

  // Auto-spawn
  useEffect(() => {
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current)

    if (isStreaming && spawnMode === 'balls') {
      spawnIntervalRef.current = setInterval(spawnBall, spawnInterval)
    }

    return () => {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current)
    }
  }, [isStreaming, spawnMode, spawnInterval, spawnBall])

  return {
    canvasRef,
    initPhysics,
    cleanup,
    updateDetectedBlocks,
    spawnBall,
    clearBalls,
  }
}
