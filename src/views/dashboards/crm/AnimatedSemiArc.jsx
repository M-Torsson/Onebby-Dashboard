'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

const clampPercent = value => {
  const num = Number(value || 0)

  if (!Number.isFinite(num)) return 0

  return Math.max(0, Math.min(100, num))
}

const AnimatedSemiArc = ({ value = 0, color = 'primary', duration = 4200, size = 152, strokeWidth = 12 }) => {
  const theme = useTheme()
  const [progress, setProgress] = useState(0)
  const frameRef = useRef(null)

  const target = clampPercent(value)
  const radius = (size - strokeWidth) / 2
  const center = size / 2
  const arcLength = Math.PI * radius
  const trackStrokeWidth = Math.max(4, strokeWidth - 4)

  const paletteColor = useMemo(() => {
    const byKey = theme.palette?.[color]?.main

    return byKey || theme.palette.primary.main
  }, [color, theme.palette])

  useEffect(() => {
    const animationStart = performance.now()

    const tick = now => {
      const elapsed = now - animationStart
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)

      setProgress(target * eased)

      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [target, duration])

  return (
    <Box className='relative' sx={{ inlineSize: size, blockSize: Math.round(size * 0.9) }}>
      <svg width={size} height={Math.round(size * 0.68)} viewBox={`0 0 ${size} ${Math.round(size * 0.68)}`}>
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill='none'
          stroke={theme.palette.action.selected}
          strokeWidth={trackStrokeWidth}
          strokeLinecap='round'
        />
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill='none'
          stroke={paletteColor}
          strokeWidth={strokeWidth}
          strokeLinecap='round'
          strokeDasharray={arcLength}
          strokeDashoffset={arcLength * (1 - progress / 100)}
          style={{ transition: 'stroke-dashoffset 90ms linear' }}
        />
      </svg>

      <Typography
        variant='h6'
        className='absolute left-1/2 -translate-x-1/2'
        sx={{ bottom: 0, fontWeight: 700, color: 'text.primary', lineHeight: 8 }}
      >
        {`${Math.round(progress)}%`}
      </Typography>
    </Box>
  )
}

export default AnimatedSemiArc
