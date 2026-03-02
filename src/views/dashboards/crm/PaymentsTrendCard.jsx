'use client'

import { useEffect, useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

import AnimatedStatNumber from '@views/dashboards/crm/AnimatedStatNumber'

const toNumber = value => {
  const num = Number(value || 0)

  return Number.isFinite(num) ? num : 0
}

const clamp01 = value => Math.min(1, Math.max(0, value))
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const formatCurrency = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(toNumber(amount))
}

const formatCompactCurrency = (amount, currency = 'EUR') => {
  const num = toNumber(amount)
  if (num === 0) return ''

  if (num >= 1000000) {
    return `€${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `€${(num / 1000).toFixed(1)}K`
  } else {
    return `€${num.toFixed(0)}`
  }
}

const PaymentsTrendCard = ({ loading, payments = [] }) => {
  const theme = useTheme()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [drawProgress, setDrawProgress] = useState(0)

  const availableYears = useMemo(() => {
    const extracted = payments
      .map(payment => new Date(payment?.createdAt || payment?.created_at || 0).getFullYear())
      .filter(year => Number.isFinite(year) && year > 1970)

    const baseYears = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2]

    return [...new Set([...extracted, ...baseYears])].sort((a, b) => b - a)
  }, [payments])

  useEffect(() => {
    if (!availableYears.length) return
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0])
    }
  }, [availableYears, selectedYear])

  const summary = useMemo(() => {
    const monthlyTotals = Array.from({ length: 12 }, () => 0)
    const now = new Date()
    const isCurrentYear = selectedYear === now.getFullYear()
    const currentMonthIndex = now.getMonth()

    payments.forEach(payment => {
      const date = new Date(payment?.createdAt || payment?.created_at || 0)
      const amount = toNumber(payment?.amount)

      if (Number.isNaN(date.getTime()) || amount <= 0) return
      if (date.getFullYear() !== selectedYear) return

      const monthIndex = date.getMonth()
      if (monthIndex < 0 || monthIndex > 11) return

      monthlyTotals[monthIndex] += amount
    })

    if (isCurrentYear) {
      const currentMonth = now.getMonth()
      for (let month = currentMonth + 1; month < 12; month += 1) {
        monthlyTotals[month] = 0
      }
    }

    const total = monthlyTotals.reduce((sum, amount) => sum + amount, 0)
    return {
      points: monthlyTotals,
      total,
      currency: payments[0]?.currency || 'EUR',
      currentMonthIndex: isCurrentYear ? currentMonthIndex : -1
    }
  }, [payments, selectedYear])

  const bars = useMemo(() => {
    const values = summary.points
    const nonZero = values.filter(value => value > 0)
    const max = Math.max(...values, 0)
    const hasData = nonZero.length > 0
    const minHeight = hasData ? 30 : 14
    const maxHeight = hasData ? 118 : 28
    const emptyHeight = 8

    return values.map((value, index) => {
      const normalized = max > 0 ? value / max : 0
      const height = value > 0 ? minHeight + normalized * (maxHeight - minHeight) : emptyHeight
      const isCurrentMonth = index === summary.currentMonthIndex

      return {
        key: `${index}-${value}`,
        height,
        active: value > 0,
        isCurrentMonth
      }
    })
  }, [summary.points, summary.currentMonthIndex])

  const pointsSignature = useMemo(() => summary.points.join('|'), [summary.points])

  useEffect(() => {
    let frame = null
    const startTime = performance.now()
    const drawDuration = 2800

    setDrawProgress(0)

    const animate = now => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / drawDuration, 1)

      setDrawProgress(progress)
      frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)

    return () => {
      if (frame) cancelAnimationFrame(frame)
    }
  }, [selectedYear, pointsSignature])

  return (
    <Card>
      <CardContent className='flex flex-col items-start gap-4 p-6'>
        <FormControl size='small' sx={{ minInlineSize: 132 }}>
          <Select
            value={selectedYear}
            onChange={event => setSelectedYear(Number(event.target.value))}
            IconComponent={() => <i className='tabler-chevron-down text-[20px]' />}
            sx={{
              bgcolor: 'primary.lighterOpacity',
              color: 'primary.main',
              borderRadius: 1.5,
              fontSize: theme => theme.typography.h6.fontSize,
              fontWeight: 600,
              '& fieldset': { border: 0 }
            }}
          >
            {availableYears.map(year => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {loading ? (
          <Skeleton variant='text' width={180} height={56} />
        ) : (
          <Typography variant='h2' sx={{ fontWeight: 600, lineHeight: 1.1 }}>
            <AnimatedStatNumber
              value={summary.total}
              duration={2400}
              formatValue={value => formatCurrency(value, summary.currency)}
            />
          </Typography>
        )}

        <Box sx={{ inlineSize: '100%', pt: 1 }}>
          {loading ? (
            <Skeleton variant='rounded' width='100%' height={130} />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              <Box
                sx={{
                  minBlockSize: 180,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  gap: 0.25,
                  px: { xs: 0.5, sm: 1 },
                  pb: 0.2,
                  pt: 2
                }}
              >
                {bars.map((bar, index) => {
                  const reveal = clamp01((drawProgress - index * 0.03) / 0.9)
                  const monthValue = summary.points[index]
                  const showAmount = monthValue >= 0.01

                  return (
                    <Box
                      key={bar.key}
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <Box sx={{ minHeight: '1.5em', display: 'flex', alignItems: 'center' }}>
                        {showAmount && (
                          <Typography
                            variant='caption'
                            sx={{
                              fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                              fontWeight: bar.isCurrentMonth ? 700 : 600,
                              color: bar.isCurrentMonth ? 'primary.main' : 'text.secondary',
                              opacity: reveal,
                              transition: 'opacity 220ms ease',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {formatCompactCurrency(monthValue, summary.currency)}
                          </Typography>
                        )}
                      </Box>
                      <Box
                        sx={{
                          inlineSize: { xs: 24, sm: 28, md: 60 },
                          blockSize: 118,
                          borderRadius: 3,
                          bgcolor: 'action.hover',
                          p: '2px',
                          display: 'flex',
                          alignItems: 'flex-end'
                        }}
                      >
                        <Box
                          sx={{
                            inlineSize: '100%',
                            blockSize: `${bar.height}px`,
                            borderRadius: 2,
                            background: bar.isCurrentMonth
                              ? `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                              : `linear-gradient(180deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                            opacity: bar.isCurrentMonth ? 1 : bar.active ? 0.28 + reveal * 0.72 : 0.08,
                            transform: `scaleY(${reveal})`,
                            transformOrigin: 'bottom',
                            boxShadow:
                              bar.isCurrentMonth && reveal > 0.7
                                ? `0 2px 16px ${theme.palette.primary.main}88`
                                : reveal > 0.7 && bar.active
                                  ? `0 0 10px ${theme.palette.primary.main}55`
                                  : 'none',
                            transition: 'opacity 220ms ease, box-shadow 220ms ease'
                          }}
                        />
                      </Box>
                    </Box>
                  )
                })}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 0.5, sm: 1 } }}>
                {MONTH_LABELS.map(month => (
                  <Typography key={month} variant='caption' color='text.disabled' sx={{ flex: 1, textAlign: 'center' }}>
                    {month}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default PaymentsTrendCard
