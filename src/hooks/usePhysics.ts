'use client'

import { useCallback, useEffect, useRef } from 'react'
import Matter from 'matter-js'
import { useFluxStore } from '@/store/useFluxStore'
import { randomRange } from '@/lib/utils'

interface PhysicsBody {
  id: string
  body: Matter.Body
}

interface DetectedBlock {
  x: number
  y: number
  width: number
  height: number
  area: number
}

interface UsePhysicsResult {
  engineRef: React.RefObject<Matter.Engine | null>
  renderRef: React.RefObject<Matter.Render | null>
  initPhysics: (canvas: HTMLCanvasElement) => void
  cleanup: () => void
  updateDetectedBlocks: (blocks: DetectedBlock[]) => void
  spawnBall: () => void
  clearBalls: () => void
  renderLaser: (ctx: CanvasRenderingContext2D) => void
}

export function usePhysics(): UsePhysicsResult {
  const engineRef = useRef<Matter.Engine | null>(null)
  const renderRef = useRef<Matter.Render | null>(null)
  const runnerRef = useRef<Matter.Runner | null>(null)
  const blocksRef = useRef<PhysicsBody[]>([])
  const ballsRef = useRef<Matter.Body[]>([])
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const canvasSizeRef = useRef({ width: 0, height: 0 })

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
    // Clean up existing engine
    if (engineRef.current) {
      Matter.Engine.clear(engineRef.current)
      Matter.World.clear(engineRef.current.world, false)
    }
    if (runnerRef.current) {
      Matter.Runner.stop(runnerRef.current)
    }
    if (renderRef.current) {
      Matter.Render.stop(renderRef.current)
    }

    // Create engine
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: gravity },
    })

    // Create renderer
    const render = Matter.Render.create({
      canvas,
      engine,
      options: {
        width: canvas.width,
        height: canvas.height,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio || 1,
      },
    })

    // Create walls
    const wallThickness = 50
    const walls = [
      // Left wall
      Matter.Bodies.rectangle(
        -wallThickness / 2,
        canvas.height / 2,
        wallThickness,
        canvas.height * 2,
        { isStatic: true, render: { visible: false } }
      ),
      // Right wall
      Matter.Bodies.rectangle(
        canvas.width + wallThickness / 2,
        canvas.height / 2,
        wallThickness,
        canvas.height * 2,
        { isStatic: true, render: { visible: false } }
      ),
    ]

    Matter.Composite.add(engine.world, walls)

    // Create runner
    const runner = Matter.Runner.create()

    // Start physics
    Matter.Render.run(render)
    Matter.Runner.run(runner, engine)

    // Store refs
    engineRef.current = engine
    renderRef.current = render
    runnerRef.current = runner
    canvasSizeRef.current = { width: canvas.width, height: canvas.height }

    // Handle resize
    const handleResize = () => {
      if (!renderRef.current) return
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      canvasSizeRef.current = { width: rect.width, height: rect.height }
      renderRef.current.bounds.max.x = rect.width
      renderRef.current.bounds.max.y = rect.height
      renderRef.current.options.width = rect.width
      renderRef.current.options.height = rect.height
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [gravity])

  const cleanup = useCallback(() => {
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current)
    }
    if (runnerRef.current) {
      Matter.Runner.stop(runnerRef.current)
    }
    if (renderRef.current) {
      Matter.Render.stop(renderRef.current)
    }
    if (engineRef.current) {
      Matter.Engine.clear(engineRef.current)
      Matter.World.clear(engineRef.current.world, false)
    }
  }, [])

  const updateDetectedBlocks = useCallback(
    (blocks: DetectedBlock[]) => {
      if (!engineRef.current || !showDetection) return

      const world = engineRef.current.world

      // Remove old blocks
      blocksRef.current.forEach(({ body }) => {
        Matter.Composite.remove(world, body)
      })

      // Create new blocks
      const newBlocks: PhysicsBody[] = blocks.map((block, index) => {
        const body = Matter.Bodies.rectangle(
          block.x + block.width / 2,
          block.y + block.height / 2,
          block.width,
          block.height,
          {
            isStatic: true,
            friction: 0.8,
            restitution: bounciness,
            render: {
              fillStyle: `rgba(99, 102, 241, ${boxOpacity / 100})`,
              strokeStyle: 'rgba(139, 92, 246, 0.8)',
              lineWidth: 2,
            },
          }
        )

        Matter.Composite.add(world, body)

        return {
          id: `block-${index}`,
          body,
        }
      })

      blocksRef.current = newBlocks
    },
    [showDetection, bounciness, boxOpacity]
  )

  const spawnBall = useCallback(() => {
    if (!engineRef.current || spawnMode !== 'balls') return

    const { width } = canvasSizeRef.current
    const x = (spawnPositionX / 100) * width + randomRange(-20, 20)

    const ball = Matter.Bodies.circle(x, -ballSize, ballSize, {
      restitution: bounciness,
      friction: 0.001,
      frictionAir: 0.001,
      render: {
        fillStyle: `hsl(${randomRange(250, 290)}, 80%, 65%)`,
        strokeStyle: 'rgba(255, 255, 255, 0.3)',
        lineWidth: 1,
      },
    })

    Matter.Composite.add(engineRef.current.world, ball)
    ballsRef.current.push(ball)

    // Clean up balls that fall off screen
    const { height } = canvasSizeRef.current
    ballsRef.current = ballsRef.current.filter((b) => {
      if (b.position.y > height + 100) {
        Matter.Composite.remove(engineRef.current!.world, b)
        return false
      }
      return true
    })
  }, [spawnMode, spawnPositionX, ballSize, bounciness])

  const clearBalls = useCallback(() => {
    if (!engineRef.current) return

    ballsRef.current.forEach((ball) => {
      Matter.Composite.remove(engineRef.current!.world, ball)
    })
    ballsRef.current = []
  }, [])

  const renderLaser = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (spawnMode !== 'laser') return

      const { width, height } = canvasSizeRef.current
      const startX = (spawnPositionX / 100) * width
      const startY = 0

      // Raycast through the scene
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(startX, startY)

      let currentX = startX
      let currentY = startY
      let angle = Math.PI / 2 // Start pointing down
      let bounces = 0
      const maxBounces = 10
      const maxLength = 2000

      while (bounces < maxBounces && currentY < height) {
        const endX = currentX + Math.cos(angle) * maxLength
        const endY = currentY + Math.sin(angle) * maxLength

        // Check for collision with blocks
        let closestIntersection: { x: number; y: number; normal: number } | null = null
        let closestDist = Infinity

        blocksRef.current.forEach(({ body }) => {
          const bounds = body.bounds
          // Simple AABB ray intersection
          const intersection = rayAABBIntersect(
            currentX,
            currentY,
            endX,
            endY,
            bounds.min.x,
            bounds.min.y,
            bounds.max.x,
            bounds.max.y
          )

          if (intersection) {
            const dist = Math.hypot(intersection.x - currentX, intersection.y - currentY)
            if (dist > 1 && dist < closestDist) {
              closestDist = dist
              closestIntersection = intersection
            }
          }
        })

        if (closestIntersection !== null) {
          const hit = closestIntersection as { x: number; y: number; normal: number }
          ctx.lineTo(hit.x, hit.y)
          // Reflect angle
          if (hit.normal === 0 || hit.normal === 2) {
            // Horizontal surface
            angle = -angle
          } else {
            // Vertical surface
            angle = Math.PI - angle
          }
          currentX = hit.x
          currentY = hit.y
          bounces++
        } else {
          ctx.lineTo(endX, endY)
          break
        }
      }

      // Style the laser
      ctx.strokeStyle = '#a855f7'
      ctx.lineWidth = 3
      ctx.shadowColor = '#c084fc'
      ctx.shadowBlur = 15
      ctx.stroke()

      // Add glow effect
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)'
      ctx.lineWidth = 8
      ctx.stroke()

      ctx.restore()
    },
    [spawnMode, spawnPositionX]
  )

  // Update gravity when it changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.gravity.y = gravity
    }
  }, [gravity])

  // Auto-spawn balls
  useEffect(() => {
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current)
    }

    if (isStreaming && spawnMode === 'balls') {
      spawnIntervalRef.current = setInterval(spawnBall, spawnInterval)
    }

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current)
      }
    }
  }, [isStreaming, spawnMode, spawnInterval, spawnBall])

  return {
    engineRef,
    renderRef,
    initPhysics,
    cleanup,
    updateDetectedBlocks,
    spawnBall,
    clearBalls,
    renderLaser,
  }
}

// Helper function for ray-AABB intersection
function rayAABBIntersect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number
): { x: number; y: number; normal: number } | null {
  const dx = x2 - x1
  const dy = y2 - y1

  let tmin = 0
  let tmax = 1
  let normal = 0

  // X slab
  if (dx !== 0) {
    const tx1 = (minX - x1) / dx
    const tx2 = (maxX - x1) / dx
    const txmin = Math.min(tx1, tx2)
    const txmax = Math.max(tx1, tx2)

    if (txmin > tmin) {
      tmin = txmin
      normal = tx1 < tx2 ? 3 : 1 // Left or right
    }
    tmax = Math.min(tmax, txmax)
  }

  // Y slab
  if (dy !== 0) {
    const ty1 = (minY - y1) / dy
    const ty2 = (maxY - y1) / dy
    const tymin = Math.min(ty1, ty2)
    const tymax = Math.max(ty1, ty2)

    if (tymin > tmin) {
      tmin = tymin
      normal = ty1 < ty2 ? 0 : 2 // Top or bottom
    }
    tmax = Math.min(tmax, tymax)
  }

  if (tmax >= tmin && tmin >= 0 && tmin <= 1) {
    return {
      x: x1 + dx * tmin,
      y: y1 + dy * tmin,
      normal,
    }
  }

  return null
}
