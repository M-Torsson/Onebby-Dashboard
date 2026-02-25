'use client'

import { useEffect, useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'

import CustomAvatar from '@core/components/mui/Avatar'
import StatisticsOverviewCard from '@views/dashboards/crm/StatisticsOverviewCard'
import LatestProductsList from '@views/dashboards/crm/LatestProductsList'
import PaymentsTrendCard from '@views/dashboards/crm/PaymentsTrendCard'
import RecentPaymentsTable from '@views/dashboards/crm/RecentPaymentsTable'
import { getDashboardCRMLive } from '@/services/dashboardApi'
import useAuthToken from '@/hooks/useAuthToken'
import AnimatedStatNumber from '@views/dashboards/crm/AnimatedStatNumber'
import AnimatedSemiArc from '@views/dashboards/crm/AnimatedSemiArc'

const formatCompact = value => {
  const number = Number(value || 0)

  if (!Number.isFinite(number)) return '0'

  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(number)
}

const formatChange = value => {
  const number = Number(value || 0)

  if (!Number.isFinite(number) || number === 0) return '0%'

  return `${number > 0 ? '+' : ''}${number.toFixed(1)}%`
}

const changeColor = value => {
  const number = Number(value || 0)

  if (!Number.isFinite(number) || number === 0) return 'secondary'

  return number > 0 ? 'success' : 'error'
}

const normalizeGaugePercent = value => {
  const number = Math.abs(Number(value || 0))

  if (!Number.isFinite(number)) return 0

  return Math.max(0, Math.min(100, number))
}

const defaultOverview = {
  categories: 0,
  brands: 0,
  products: 0,
  revenue: 0,
  ordersLastWeek: 0,
  ordersLastWeekChangePct: 0,
  salesLastYear: 0,
  salesLastYearChangePct: 0,
  profitLastWeek: 0,
  profitLastWeekChangePct: 0,
  salesLastWeek: 0,
  salesLastWeekChangePct: 0
}

const LiveDashboardCRM = ({ lang = 'ar' }) => {
  const { token, isAuthenticated, isLoading: authLoading } = useAuthToken()
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState(defaultOverview)
  const [products, setProducts] = useState([])
  const [payments, setPayments] = useState([])

  useEffect(() => {
    let isMounted = true

    if (authLoading) {
      return () => {
        isMounted = false
      }
    }

    if (!isAuthenticated || !token) {
      setLoading(false)

      return () => {
        isMounted = false
      }
    }

    const loadDashboard = async () => {
      setLoading(true)

      try {
        const data = await getDashboardCRMLive({ lang: 'en', limitProducts: 10, limitPayments: 10 })

        if (!isMounted) return

        setOverview({ ...defaultOverview, ...data.overview })
        setProducts(data.products)
        setPayments(data.payments)
      } catch (error) {
        if (!isMounted) return

        console.error('Failed to load CRM dashboard live data:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [token, isAuthenticated, authLoading])

  const summaryCards = useMemo(() => {
    const baseCards = [
      {
        title: 'Orders',
        subtitle: 'Last Week',
        value: overview.ordersLastWeek,
        changePct: overview.ordersLastWeekChangePct,
        icon: 'tabler-shopping-bag',
        color: 'primary',
        chipText: formatChange(overview.ordersLastWeekChangePct),
        chipColor: changeColor(overview.ordersLastWeekChangePct)
      },
      {
        title: 'Sales',
        subtitle: 'Last Year',
        value: overview.salesLastYear,
        changePct: overview.salesLastYearChangePct,
        icon: 'tabler-chart-line',
        color: 'info',
        chipText: formatChange(overview.salesLastYearChangePct),
        chipColor: changeColor(overview.salesLastYearChangePct)
      },
      {
        title: 'Total Profit',
        subtitle: 'Last Week',
        value: overview.profitLastWeek,
        changePct: overview.profitLastWeekChangePct,
        icon: 'tabler-credit-card',
        color: 'error',
        chipText: formatChange(overview.profitLastWeekChangePct),
        chipColor: changeColor(overview.profitLastWeekChangePct)
      },
      {
        title: 'Total Sales',
        subtitle: 'Last Week',
        value: overview.salesLastWeek,
        changePct: overview.salesLastWeekChangePct,
        icon: 'tabler-currency-dollar',
        color: 'success',
        chipText: formatChange(overview.salesLastWeekChangePct),
        chipColor: changeColor(overview.salesLastWeekChangePct)
      }
    ]

    return baseCards.map(card => ({
      ...card,
      gaugePercent: normalizeGaugePercent(card.changePct)
    }))
  }, [overview])

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <StatisticsOverviewCard loading={loading} stats={overview} />
      </Grid>

      {summaryCards.map(card => (
        <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent className='flex flex-col gap-y-3 items-start'>
              <div className='flex flex-col gap-y-1'>
                <Typography variant='h5'>{card.title}</Typography>
                <Typography color='text.disabled'>{card.subtitle}</Typography>
              </div>

              <div className='flex items-center justify-between is-full'>
                <CustomAvatar variant='rounded' skin='light' size={48} color={card.color}>
                  <i className={`${card.icon} text-[24px]`} />
                </CustomAvatar>

                {loading ? (
                  <Skeleton variant='rounded' width={122} height={84} />
                ) : (
                  <AnimatedSemiArc value={card.gaugePercent} color={card.color} />
                )}
              </div>

              {loading ? (
                <Skeleton variant='text' width={86} height={38} />
              ) : (
                <Typography variant='h4' className='font-semibold leading-tight'>
                  <AnimatedStatNumber value={card.value} formatValue={formatCompact} />
                </Typography>
              )}

              {loading ? (
                <Skeleton variant='rounded' width={76} height={24} />
              ) : (
                <Chip label={card.chipText} color={card.chipColor} variant='tonal' size='small' />
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}

      <Grid size={{ xs: 12, lg: 6 }} className='flex'>
        <div className='is-full h-full'>
          <LatestProductsList loading={loading} products={products} />
        </div>
      </Grid>

      <Grid size={{ xs: 12, lg: 6 }} className='flex'>
        <div className='flex flex-col gap-6 is-full h-full'>
          <PaymentsTrendCard loading={loading} payments={payments} />
          <div className='flex-1 min-h-0'>
            <RecentPaymentsTable loading={loading} payments={payments} />
          </div>
        </div>
      </Grid>
    </Grid>
  )
}

export default LiveDashboardCRM
