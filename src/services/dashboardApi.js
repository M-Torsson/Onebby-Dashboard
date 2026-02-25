import { apiConfig } from '@/configs/apiConfig'
import { getAuthToken } from '@/utils/authTokenManager'
import { getAllPayments } from '@/services/paymentsApi'

const toNumber = value => {
  const num = Number(value)

  return Number.isFinite(num) ? num : 0
}

const getAuthHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': apiConfig.apiKey
  }

  const token = getAuthToken()

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

const fetchJson = async url => {
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders()
  })

  if (!response.ok) {
    throw new Error(`Failed request: ${response.status} (${url})`)
  }

  return response.json()
}

const fetchFirstAvailable = async (urls, { throwOnError = true } = {}) => {
  let lastError

  for (const url of urls) {
    try {
      return await fetchJson(url)
    } catch (error) {
      lastError = error
    }
  }

  if (throwOnError) {
    throw lastError || new Error('No endpoint candidates provided')
  }

  return null
}

const pickArray = payload => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.results)) return payload.results

  return []
}

const getMetricFromOverview = (overview, keys, fallback = 0) => {
  for (const key of keys) {
    if (overview?.[key] !== undefined && overview?.[key] !== null) {
      return overview[key]
    }
  }

  return fallback
}

export const getDashboardOverview = async () => {
  const overview = await fetchFirstAvailable([
    `${apiConfig.endpoints.v1}/admin/dashboard/overview`,
    `${apiConfig.endpoints.admin}/dashboard/overview`,
    `${apiConfig.endpoints.api}/dashboard/admin/overview`
  ])

  return {
    categories: toNumber(getMetricFromOverview(overview, ['categories', 'categories_count', 'total_categories'])),
    brands: toNumber(getMetricFromOverview(overview, ['brands', 'brands_count', 'total_brands'])),
    products: toNumber(getMetricFromOverview(overview, ['products', 'products_count', 'total_products'])),
    revenue: toNumber(getMetricFromOverview(overview, ['revenue', 'revenue_total', 'total_revenue'])),
    ordersLastWeek: toNumber(getMetricFromOverview(overview, ['orders_last_week', 'ordersLastWeek'])),
    ordersLastWeekChangePct: toNumber(
      getMetricFromOverview(overview, ['orders_last_week_change_pct', 'ordersLastWeekChangePct'])
    ),
    salesLastYear: toNumber(getMetricFromOverview(overview, ['sales_last_year', 'salesLastYear'])),
    salesLastYearChangePct: toNumber(
      getMetricFromOverview(overview, ['sales_last_year_change_pct', 'salesLastYearChangePct'])
    ),
    profitLastWeek: toNumber(getMetricFromOverview(overview, ['profit_last_week', 'profitLastWeek'])),
    profitLastWeekChangePct: toNumber(
      getMetricFromOverview(overview, ['profit_last_week_change_pct', 'profitLastWeekChangePct'])
    ),
    salesLastWeek: toNumber(getMetricFromOverview(overview, ['sales_last_week', 'salesLastWeek'])),
    salesLastWeekChangePct: toNumber(
      getMetricFromOverview(overview, ['sales_last_week_change_pct', 'salesLastWeekChangePct'])
    )
  }
}

export const getNewProducts = async (limit = 10, lang = 'en') => {
  const payload = await fetchFirstAvailable([
    `${apiConfig.endpoints.v1}/admin/dashboard/products/recent?limit=${limit}&lang=${lang}`,
    `${apiConfig.endpoints.admin}/dashboard/products/recent?limit=${limit}&lang=${lang}`,
    `${apiConfig.endpoints.v1}/products?active_only=false&skip=0&limit=${Math.max(limit, 10)}&lang=${lang}`
  ])
  const products = pickArray(payload)

  return products.map(product => ({
    id: product?.id,
    title: product?.title || product?.name || `Product #${product?.id || ''}`,
    sku: product?.sku || product?.code || product?.id,
    createdAt: product?.created_at || product?.createdAt,
    price: toNumber(product?.price || product?.sale_price || product?.final_price),
    currency: product?.currency || 'EUR',
    image:
      product?.thumbnail ||
      product?.image ||
      (Array.isArray(product?.images) && product.images[0]?.url) ||
      product.images?.[0]
  }))
}

export const getRecentPayments = async (limit = 10) => {
  const payload = await fetchFirstAvailable(
    [
      `${apiConfig.endpoints.v1}/admin/dashboard/payments/recent?skip=0&limit=${limit}`,
      `${apiConfig.endpoints.admin}/dashboard/payments/recent?skip=0&limit=${limit}`,
      `${apiConfig.endpoints.api}/payments/admin/payments?skip=0&limit=${limit}`
    ],
    { throwOnError: false }
  )

  if (!payload) return []

  const payments = pickArray(payload?.payments ? payload.payments : payload)

  return payments.map(payment => ({
    id: payment?.id,
    amount: toNumber(payment?.amount),
    currency: payment?.currency || 'EUR',
    status: String(payment?.payment_status || payment?.status || 'pending').toLowerCase(),
    provider: payment?.customer_name || payment?.provider || '-',
    customerEmail: payment?.customer_email || '-',
    method: payment?.payment_method || payment?.method || '-',
    shippingStatus: String(payment?.shipping_status || '').toLowerCase(),
    orderId: payment?.order_id || payment?.orderId,
    createdAt: payment?.created_at || payment?.createdAt
  }))
}

export const getDashboardCRMLive = async ({ lang = 'ar', limitProducts = 10, limitPayments = 10 } = {}) => {
  const payload = await fetchFirstAvailable(
    [
      `${apiConfig.endpoints.v1}/admin/dashboard/crm-live?lang=${lang}&limit_products=${limitProducts}&limit_payments=${limitPayments}`,
      `${apiConfig.endpoints.admin}/dashboard/crm-live?lang=${lang}&limit_products=${limitProducts}&limit_payments=${limitPayments}`,
      `${apiConfig.endpoints.api}/dashboard/admin/crm-live?lang=${lang}&limit_products=${limitProducts}&limit_payments=${limitPayments}`
    ],
    { throwOnError: false }
  )

  if (!payload) {
    const [overviewResult, productsResult, paymentsResult] = await Promise.allSettled([
      getDashboardOverview(),
      getNewProducts(limitProducts, lang),
      getRecentPayments(limitPayments)
    ])

    const overview = overviewResult.status === 'fulfilled' ? overviewResult.value : {}
    const products = productsResult.status === 'fulfilled' ? productsResult.value : []
    const payments = paymentsResult.status === 'fulfilled' ? paymentsResult.value : []

    return {
      overview,
      products,
      payments
    }
  }

  const overview = payload?.overview || {}
  const latestProducts = pickArray(payload?.latest_products || payload?.products || [])
  const latestPayments = pickArray(payload?.latest_payments || payload?.payments || [])

  return {
    overview: {
      categories: toNumber(getMetricFromOverview(overview, ['categories', 'categories_count', 'total_categories'])),
      brands: toNumber(getMetricFromOverview(overview, ['brands', 'brands_count', 'total_brands'])),
      products: toNumber(getMetricFromOverview(overview, ['products', 'products_count', 'total_products'])),
      revenue: toNumber(getMetricFromOverview(overview, ['revenue', 'revenue_total', 'total_revenue'])),
      ordersLastWeek: toNumber(getMetricFromOverview(overview, ['orders_last_week', 'ordersLastWeek'])),
      ordersLastWeekChangePct: toNumber(
        getMetricFromOverview(overview, ['orders_last_week_change_pct', 'ordersLastWeekChangePct'])
      ),
      salesLastYear: toNumber(getMetricFromOverview(overview, ['sales_last_year', 'salesLastYear'])),
      salesLastYearChangePct: toNumber(
        getMetricFromOverview(overview, ['sales_last_year_change_pct', 'salesLastYearChangePct'])
      ),
      profitLastWeek: toNumber(getMetricFromOverview(overview, ['profit_last_week', 'profitLastWeek'])),
      profitLastWeekChangePct: toNumber(
        getMetricFromOverview(overview, ['profit_last_week_change_pct', 'profitLastWeekChangePct'])
      ),
      salesLastWeek: toNumber(getMetricFromOverview(overview, ['sales_last_week', 'salesLastWeek'])),
      salesLastWeekChangePct: toNumber(
        getMetricFromOverview(overview, ['sales_last_week_change_pct', 'salesLastWeekChangePct'])
      )
    },
    products: latestProducts.map(product => ({
      id: product?.id,
      title: product?.title || product?.name || `Product #${product?.id || ''}`,
      sku: product?.sku || product?.code || product?.id,
      createdAt: product?.created_at || product?.createdAt,
      price: toNumber(product?.price || product?.sale_price || product?.final_price),
      currency: product?.currency || 'EUR',
      image:
        product?.thumbnail ||
        product?.image ||
        (Array.isArray(product?.images) && product.images[0]?.url) ||
        product.images?.[0]
    })),
    payments: latestPayments.map(payment => ({
      id: payment?.id,
      amount: toNumber(payment?.amount),
      currency: payment?.currency || 'EUR',
      status: String(payment?.payment_status || payment?.status || 'pending').toLowerCase(),
      provider: payment?.customer_name || payment?.provider || '-',
      customerEmail: payment?.customer_email || '-',
      method: payment?.payment_method || payment?.method || '-',
      shippingStatus: String(payment?.shipping_status || '').toLowerCase(),
      orderId: payment?.order_id || payment?.orderId,
      createdAt: payment?.created_at || payment?.createdAt
    }))
  }
}

export const getWeeklyRevenue = async () => {
  const endpointCandidates = [
    `${apiConfig.endpoints.admin}/dashboard/revenue-growth?period=week`,
    `${apiConfig.endpoints.api}/dashboard/admin/revenue-growth?period=week`
  ]

  for (const endpoint of endpointCandidates) {
    try {
      const payload = await fetchJson(endpoint)

      return {
        labels: payload?.labels || ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
        values: payload?.values || payload?.series || [0, 0, 0, 0, 0, 0, 0],
        total: toNumber(payload?.total),
        changePct: toNumber(payload?.change_pct || payload?.changePct)
      }
    } catch {
      // Try next candidate endpoint
    }
  }

  const payload = await getAllPayments({ skip: 0, limit: 300 }).catch(() => ({ payments: [] }))
  const payments = pickArray(payload?.payments ? payload.payments : payload)

  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const currentDays = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))
    date.setHours(0, 0, 0, 0)
    return date
  })

  const previousStart = new Date(currentDays[0])
  previousStart.setDate(previousStart.getDate() - 7)
  const previousEnd = new Date(currentDays[0])

  const currentValues = currentDays.map(day => {
    const start = new Date(day)
    const end = new Date(day)
    end.setHours(23, 59, 59, 999)

    return payments.reduce((sum, payment) => {
      const createdAt = new Date(payment?.created_at || payment?.createdAt || 0)
      const status = String(payment?.status || '').toLowerCase()

      if (createdAt < start || createdAt > end) return sum
      if (status !== 'completed' && status !== 'paid') return sum

      return sum + toNumber(payment?.amount)
    }, 0)
  })

  const previousTotal = payments.reduce((sum, payment) => {
    const createdAt = new Date(payment?.created_at || payment?.createdAt || 0)
    const status = String(payment?.status || '').toLowerCase()

    if (createdAt < previousStart || createdAt >= previousEnd) return sum
    if (status !== 'completed' && status !== 'paid') return sum

    return sum + toNumber(payment?.amount)
  }, 0)

  const currentTotal = currentValues.reduce((sum, value) => sum + value, 0)
  const changePct = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0

  return {
    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    values: currentValues,
    total: currentTotal,
    changePct
  }
}
