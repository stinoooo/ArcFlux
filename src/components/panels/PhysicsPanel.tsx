'use client'

import { useFluxStore, SpawnMode } from '@/store/useFluxStore'
import { Slider, SegmentedControl, Button } from '@/components/ui'
import { Sparkles, Zap, Trash2 } from 'lucide-react'

interface PhysicsPanelProps {
  onClearBalls: () => void
}

export function PhysicsPanel({ onClearBalls }: PhysicsPanelProps) {
  const {
    spawnMode,
    spawnInterval,
    spawnPositionX,
    bounciness,
    gravity,
    ballSize,
    setSpawnMode,
    setSpawnInterval,
    setSpawnPositionX,
    setBounciness,
    setGravity,
    setBallSize,
  } = useFluxStore()

  return (
    <div className="panel-section">
      <div className="section-rule">
        <span className="section-rule-num">02</span>
        <Sparkles className="w-3 h-3 text-signal" />
        <span>Dynamics</span>
        <span className="section-rule-line" />
      </div>

      <SegmentedControl<SpawnMode>
        value={spawnMode}
        onChange={setSpawnMode}
        options={[
          { value: 'balls', label: 'Balls', icon: <Sparkles className="w-3.5 h-3.5" /> },
          { value: 'laser', label: 'Laser', icon: <Zap className="w-3.5 h-3.5" /> },
        ]}
        label="Spawn Mode"
      />

      <Slider
        value={spawnInterval}
        onChange={setSpawnInterval}
        min={100}
        max={2000}
        step={50}
        label="Spawn Interval"
        formatValue={(v) => `${v}ms`}
      />

      <Slider
        value={spawnPositionX}
        onChange={setSpawnPositionX}
        min={0}
        max={100}
        label="Spawn Position X"
        formatValue={(v) => `${v}%`}
      />

      <Slider
        value={ballSize}
        onChange={setBallSize}
        min={5}
        max={50}
        label="Ball Size"
        formatValue={(v) => `${v}px`}
      />

      <Slider
        value={bounciness}
        onChange={setBounciness}
        min={0}
        max={1}
        step={0.05}
        label="Bounciness"
        formatValue={(v) => `${Math.round(v * 100)}%`}
      />

      <Slider
        value={gravity}
        onChange={setGravity}
        min={0}
        max={3}
        step={0.1}
        label="Gravity"
        formatValue={(v) => v.toFixed(1)}
      />

      <Button
        variant="danger"
        size="sm"
        onClick={onClearBalls}
        leftIcon={<Trash2 className="w-4 h-4" />}
        className="w-full mt-2"
      >
        Clear All Balls
      </Button>
    </div>
  )
}
