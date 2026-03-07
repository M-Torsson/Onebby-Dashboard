'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { useDictionary } from '@/hooks/useDictionary'

const formatDate = value => {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatPrice = (amount, currency) => {
  const value = Number(amount || 0)

  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: currency || 'EUR',
    maximumFractionDigits: 2
  }).format(Number.isFinite(value) ? value : 0)
}

const shortenTitle = (title, maxLength = 52) => {
  const text = String(title || '').trim()

  if (text.length <= maxLength) return text

  return `${text.slice(0, maxLength - 1)}…`
}

const LatestProductsList = ({ loading, products = [] }) => {
  const dictionary = useDictionary()

  return (
    <Card
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CardHeader
        title={dictionary?.dashboard?.latestProducts || 'Latest Products'}
        subheader={`${dictionary?.dashboard?.items || 'Items'}: ${products.length}`}
      />
      <CardContent
        className='flex flex-col gap-3'
        sx={{
          '@keyframes productRowEnter': {
            from: { opacity: 0, transform: 'translateY(10px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
          }
        }}
      >
        {loading
          ? Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} variant='rounded' height={56} />)
          : products.map((product, index) => (
              <Box
                key={product.id}
                className='flex items-center gap-4 rounded-lg p-2'
                sx={{
                  opacity: 0,
                  animation: 'productRowEnter .9s ease forwards',
                  animationDelay: `${index * 150}ms`,
                  transition: theme =>
                    theme.transitions.create(['transform', 'background-color'], {
                      duration: theme.transitions.duration.shorter
                    }),
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'translateX(2px)'
                  }
                }}
              >
                {product.image ? (
                  <Box
                    className='is-[44px] bs-[44px] rounded-md overflow-hidden border border-divider flex items-center justify-center'
                    sx={{ bgcolor: 'action.hover' }}
                  >
                    <Box
                      component='img'
                      src={product.image}
                      alt={product.title}
                      sx={{
                        inlineSize: '100%',
                        blockSize: '100%',
                        objectFit: 'contain',
                        p: 0.5
                      }}
                    />
                  </Box>
                ) : (
                  <Avatar variant='rounded' className='is-[44px] bs-[44px] bg-actionHover text-textPrimary'>
                    <i className='tabler-package text-[20px]' />
                  </Avatar>
                )}

                <div className='flex flex-wrap justify-between items-center gap-x-4 gap-y-1 is-full'>
                  <div className='flex flex-col min-is-0 flex-1'>
                    <Typography
                      className='font-medium'
                      color='text.primary'
                      sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxInlineSize: '100%'
                      }}
                    >
                      {shortenTitle(product.title)}
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {`#${product.sku || product.id} • ${formatDate(product.createdAt)}`}
                    </Typography>
                  </div>
                  <Typography className='font-medium' sx={{ whiteSpace: 'nowrap' }}>
                    {formatPrice(product.price, product.currency)}
                  </Typography>
                </div>
              </Box>
            ))}

        {!loading && products.length === 0 ? (
          <Typography variant='body2' color='text.disabled'>
            No products found.
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default LatestProductsList
