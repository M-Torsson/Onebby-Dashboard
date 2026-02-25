'use client'

import { useEffect, useRef, useState } from 'react'

const identityFormatter = value => String(value)

const AnimatedStatNumber = ({ value, duration = 2200, formatValue = identityFormatter }) => {
  const [currentValue, setCurrentValue] = useState(0)
  const frameRef = useRef(null)

  useEffect(() => {
    const target = Number(value || 0)

    if (!Number.isFinite(target) || target === 0) {
      setCurrentValue(0)

      return () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current)
      }
    }

    const startValue = 0
    const animationStart = performance.now()

    const tick = now => {
      const elapsed = now - animationStart
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const nextValue = startValue + (target - startValue) * eased

      setCurrentValue(nextValue)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [value, duration])

  return formatValue(currentValue)
}

export default AnimatedStatNumber
