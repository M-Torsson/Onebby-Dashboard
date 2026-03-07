'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'

import tableStyles from '@core/styles/table.module.css'
import { useDictionary } from '@/hooks/useDictionary'

const statusMap = {
  completed: { label: 'Completed', color: 'success' },
  paid: { label: 'Paid', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  failed: { label: 'Failed', color: 'error' },
  refunded: { label: 'Refunded', color: 'secondary' },
  rejected: { label: 'Rejected', color: 'error' }
}

// تكوين طرق الدفع مع الأيقونات
const paymentMethodConfig = {
  Payplug: {
    icon: 'tabler-credit-card',
    color: 'primary',
    label: 'PayPlug'
  },
  payplug: {
    icon: 'tabler-credit-card',
    color: 'primary',
    label: 'PayPlug'
  },
  floa: {
    icon: 'tabler-wallet',
    color: 'warning',
    label: 'Floa'
  },
  Floa: {
    icon: 'tabler-wallet',
    color: 'warning',
    label: 'Floa'
  },
  paypal: {
    icon: 'tabler-brand-paypal',
    color: 'info',
    label: 'PayPal'
  },
  PayPal: {
    icon: 'tabler-brand-paypal',
    color: 'info',
    label: 'PayPal'
  },
  mastercard: {
    icon: 'tabler-credit-card',
    color: 'secondary',
    label: 'Mastercard'
  },
  Mastercard: {
    icon: 'tabler-credit-card',
    color: 'secondary',
    label: 'Mastercard'
  }
}

const formatDate = value => {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatAmount = (amount, currency) => {
  const value = Number(amount || 0)

  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: currency || 'EUR',
    maximumFractionDigits: 2
  }).format(Number.isFinite(value) ? value : 0)
}

const resolveStatus = rawStatus => {
  const key = String(rawStatus || 'pending').toLowerCase()

  return statusMap[key] || { label: key || 'Pending', color: 'secondary' }
}

const truncate = (value, max = 26) => {
  const text = String(value || '').trim()

  if (!text) return '-'
  if (text.length <= max) return text

  return `${text.slice(0, max - 1)}…`
}

const RecentPaymentsTable = ({ loading, payments = [] }) => {
  const theme = useTheme()
  const dictionary = useDictionary()

  return (
    <Card
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[2],
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CardHeader
        title={dictionary?.dashboard?.recentPayments || 'Recent Payments'}
        subheader={`${dictionary?.dashboard?.items || 'Items'}: ${payments.length}`}
        action={
          loading ? null : (
            <Chip
              size='small'
              variant='tonal'
              color='primary'
              label={`${payments.length} ${dictionary?.dashboard?.items || 'Items'}`}
              sx={{ mt: 1.5, mr: 1.5, fontWeight: 600 }}
            />
          )
        }
        sx={{
          '& .MuiCardHeader-title': { fontWeight: 700 },
          '& .MuiCardHeader-subheader': { color: 'text.secondary' },
          flexShrink: 0
        }}
      />
      <Box
        sx={{
          minHeight: 0,
          maxHeight: '400px',
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'action.hover'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'action.selected',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'action.disabled'
            }
          }
        }}
      >
        <table className={tableStyles.table} style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead className='uppercase bg-action-hover/40'>
            <tr className='border-be'>
              <th className='leading-6 plb-4 pis-6 pli-2' style={{ width: '34%' }}>
                Payment
              </th>
              <th className='leading-6 plb-4 pli-2' style={{ width: '30%' }}>
                Date
              </th>
              <th className='leading-6 plb-4 pli-2' style={{ width: '18%' }}>
                Status
              </th>
              <th className='leading-6 plb-4 pie-6 pli-2 text-right' style={{ width: '18%' }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className='border-0'>
                    <td className='pis-6 pli-2 plb-3'>
                      <Skeleton variant='text' width={140} />
                    </td>
                    <td className='pli-2 plb-3'>
                      <Skeleton variant='text' width={100} />
                    </td>
                    <td className='pli-2 plb-3'>
                      <Skeleton variant='rounded' width={72} height={24} />
                    </td>
                    <td className='pli-2 plb-3 pie-6 text-right'>
                      <Skeleton variant='text' width={90} sx={{ marginInlineStart: 'auto' }} />
                    </td>
                  </tr>
                ))
              : payments.map((payment, index) => {
                  const status = resolveStatus(payment.status)

                  return (
                    <tr
                      key={payment.id}
                      className='border-0 payment-row'
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <td className='pis-6 pli-2 plb-3'>
                        <div className='flex items-center gap-2 min-is-0'>
                          {(() => {
                            const methodInfo = paymentMethodConfig[payment.method]
                            if (methodInfo) {
                              return (
                                <div className='flex items-center gap-2'>
                                  <div
                                    className='flex justify-center items-center rounded p-1'
                                    style={{ backgroundColor: `var(--mui-palette-${methodInfo.color}-lighterOpacity)` }}
                                  >
                                    <i className={`${methodInfo.icon} text-${methodInfo.color} text-sm`} />
                                  </div>
                                  <div className='flex flex-col min-is-0'>
                                    <Typography
                                      color='text.primary'
                                      sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                    >
                                      {methodInfo.label} • {truncate(payment.provider, 16)}
                                    </Typography>
                                    <Typography
                                      variant='body2'
                                      color='text.disabled'
                                      sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                    >
                                      {`#${payment.id}`}
                                    </Typography>
                                  </div>
                                </div>
                              )
                            }
                            return (
                              <div className='flex flex-col min-is-0'>
                                <Typography
                                  color='text.primary'
                                  sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                >
                                  {`${truncate(payment.provider, 24)} • ${truncate(payment.method, 14)}`}
                                </Typography>
                                <Typography
                                  variant='body2'
                                  color='text.disabled'
                                  sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                >
                                  {`#${payment.id}`}
                                </Typography>
                              </div>
                            )
                          })()}
                        </div>
                      </td>
                      <td className='pli-2 plb-3'>
                        <div className='flex flex-col min-is-0'>
                          <Typography
                            color='text.primary'
                            sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            {truncate(payment.customerEmail, 30)}
                          </Typography>
                          <Typography
                            variant='body2'
                            color='text.disabled'
                            sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          >
                            {formatDate(payment.createdAt)}
                          </Typography>
                        </div>
                      </td>
                      <td className='pli-2 plb-3'>
                        <Chip variant='tonal' size='small' label={status.label} color={status.color} />
                      </td>
                      <td className='pli-2 plb-3 pie-6 text-right'>
                        <Typography color='text.primary' className='font-medium'>
                          {formatAmount(payment.amount, payment.currency)}
                        </Typography>
                      </td>
                    </tr>
                  )
                })}
          </tbody>
        </table>
      </Box>
      {!loading && payments.length === 0 ? (
        <Typography variant='body2' color='text.disabled' className='pis-6 pbe-4'>
          No payments found.
        </Typography>
      ) : null}

      <Box
        component='style'
        sx={{
          '@keyframes paymentRowIn': {
            from: { opacity: 0, transform: 'translateY(-12px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
          }
        }}
      >{`
        .payment-row {
          opacity: 0;
          animation: paymentRowIn .9s ease forwards;
          transition: background-color .24s ease, transform .24s ease;
        }

        .payment-row:hover {
          background-color: var(--mui-palette-action-hover);
          transform: translateX(2px);
        }
      `}</Box>
    </Card>
  )
}

export default RecentPaymentsTable
