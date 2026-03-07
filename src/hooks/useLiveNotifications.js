'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'

import { getAllOrders } from '@/services/ordersApi'
import { getAllPayments } from '@/services/paymentsApi'
import { getAuthToken } from '@/utils/authTokenManager'
import { i18n } from '@/configs/i18n'

const STORAGE_KEY = 'onebby_live_notifications_state_v1'
const POLL_INTERVAL_MS = 60000
const MAX_NOTIFICATIONS = 8

const paidStatuses = new Set(['completed', 'paid', 'success', 'successful', 'approved'])
const pendingStatuses = new Set(['pending', 'processing', 'authorized'])
const failedStatuses = new Set(['failed', 'error', 'declined', 'cancelled', 'canceled'])
const refundedStatuses = new Set(['refunded', 'refund'])

const normalizeCollection = payload => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.orders)) return payload.orders
  if (Array.isArray(payload?.payments)) return payload.payments
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.orders)) return payload.data.orders
  if (Array.isArray(payload?.data?.payments)) return payload.data.payments

  return []
}

const normalizeStatus = value =>
  String(value || '')
    .trim()
    .toLowerCase()

const getLocaleCode = lang => {
  switch (lang) {
    case 'it':
      return 'it-IT'
    case 'fr':
      return 'fr-FR'
    default:
      return 'en-US'
  }
}

const getRelativeTime = (dateValue, locale) => {
  if (!dateValue) return ''

  const timestamp = new Date(dateValue).getTime()

  if (Number.isNaN(timestamp)) return ''

  const diffInSeconds = Math.round((timestamp - Date.now()) / 1000)
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const divisions = [
    { amount: 60, unit: 'second' },
    { amount: 60, unit: 'minute' },
    { amount: 24, unit: 'hour' },
    { amount: 7, unit: 'day' },
    { amount: 4.34524, unit: 'week' },
    { amount: 12, unit: 'month' },
    { amount: Number.POSITIVE_INFINITY, unit: 'year' }
  ]

  let duration = diffInSeconds

  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit)
    }

    duration /= division.amount
  }

  return ''
}

const getNotificationState = () => {
  if (typeof window === 'undefined') {
    return { readIds: [], dismissedIds: [] }
  }

  try {
    const rawValue = localStorage.getItem(STORAGE_KEY)

    if (!rawValue) {
      return { readIds: [], dismissedIds: [] }
    }

    const parsedValue = JSON.parse(rawValue)

    return {
      readIds: Array.isArray(parsedValue?.readIds) ? parsedValue.readIds : [],
      dismissedIds: Array.isArray(parsedValue?.dismissedIds) ? parsedValue.dismissedIds : []
    }
  } catch {
    return { readIds: [], dismissedIds: [] }
  }
}

const saveNotificationState = nextState => {
  if (typeof window === 'undefined') return

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      readIds: Array.from(new Set(nextState.readIds || [])),
      dismissedIds: Array.from(new Set(nextState.dismissedIds || []))
    })
  )
}

const resolveCustomerName = (order, fallbackLabel) => {
  if (!order) return fallbackLabel

  const fullName = String(order.customer_name || '').trim()

  if (fullName) return fullName

  const email = String(order.customer_email || '').trim()

  if (email) {
    return email.split('@')[0]
  }

  return fallbackLabel
}

const formatLabel = value => {
  const text = String(value || '').trim()

  if (!text) return 'N/A'
  if (text.toLowerCase() === 'paypal') return 'PayPal'
  if (text.toLowerCase() === 'payplug') return 'PayPlug'
  if (text.toLowerCase() === 'floa') return 'Floa'

  return text.charAt(0).toUpperCase() + text.slice(1)
}

const buildNotifications = (orders, payments, dictionary, lang) => {
  const locale = getLocaleCode(lang)
  const common = dictionary?.common || {}
  const ordersDictionary = dictionary?.orders || {}
  const customerFallback = common.customer || 'Customer'
  const notifications = []
  const notificationIds = new Set()
  const paymentsByOrderId = new Set()
  const ordersById = new Map(orders.map(order => [String(order.id), order]))

  const pushNotification = notification => {
    if (!notification?.id || notificationIds.has(notification.id)) return

    const timestamp = new Date(notification.timestamp).getTime()

    if (Number.isNaN(timestamp)) return

    notificationIds.add(notification.id)
    notifications.push({
      ...notification,
      sortTime: timestamp,
      time: getRelativeTime(notification.timestamp, locale)
    })
  }

  payments.forEach(payment => {
    const orderId = payment.order_id ?? payment.orderId ?? payment.order?.id
    const order = ordersById.get(String(orderId))
    const status = normalizeStatus(payment.payment_status || payment.status)
    const timestamp = payment.paid_at || payment.updated_at || payment.created_at || order?.created_at

    if (!orderId || !timestamp) return

    paymentsByOrderId.add(String(orderId))

    if (paidStatuses.has(status)) {
      pushNotification({
        id: `payment:${payment.id || orderId}:paid`,
        avatarIcon: 'tabler-credit-card-pay',
        avatarColor: 'success',
        title: common.paymentCompleted || 'Payment completed',
        subtitle: `Order #${orderId} · ${ordersDictionary.paymentReceived || 'Payment received via'} ${formatLabel(
          payment.provider || payment.payment_method || order?.payment_method
        )}`,
        timestamp
      })
      return
    }

    if (failedStatuses.has(status) || refundedStatuses.has(status)) {
      pushNotification({
        id: `payment:${payment.id || orderId}:issue`,
        avatarIcon: 'tabler-alert-circle',
        avatarColor: refundedStatuses.has(status) ? 'info' : 'error',
        title: refundedStatuses.has(status)
          ? common.paymentRefunded || 'Payment refunded'
          : common.paymentFailed || 'Payment failed',
        subtitle: `Order #${orderId} · ${ordersDictionary.paymentStatusLabel || 'Payment Status'}: ${
          refundedStatuses.has(status) ? ordersDictionary.refunded || 'Refunded' : ordersDictionary.failed || 'Failed'
        }`,
        timestamp
      })
      return
    }

    if (pendingStatuses.has(status)) {
      pushNotification({
        id: `payment:${payment.id || orderId}:pending`,
        avatarIcon: 'tabler-hourglass',
        avatarColor: 'warning',
        title: common.paymentPending || 'Payment pending',
        subtitle: `Order #${orderId} · ${ordersDictionary.paymentStatusLabel || 'Payment Status'}: ${
          ordersDictionary.pending || 'Pending'
        }`,
        timestamp
      })
    }
  })

  orders.forEach(order => {
    const orderId = order.id
    const customerName = resolveCustomerName(order, customerFallback)
    const createdAt = order.created_at || order.createdAt
    const shippedAt = order.shipped_at || order.updated_at || createdAt
    const deliveredAt = order.delivered_at || order.updated_at || createdAt
    const shippingStatus = normalizeStatus(order.shipping_status)
    const paymentStatus = normalizeStatus(order.payment_status)

    if (createdAt) {
      pushNotification({
        id: `order:${orderId}:created`,
        avatarIcon: 'tabler-shopping-cart-plus',
        avatarColor: 'primary',
        title: common.newOrder || 'New order received',
        subtitle: `Order #${orderId} · ${customerName}`,
        timestamp: createdAt
      })
    }

    if (shippingStatus === 'delivered') {
      pushNotification({
        id: `order:${orderId}:delivered`,
        avatarIcon: 'tabler-package',
        avatarColor: 'success',
        title: common.orderDelivered || 'Order delivered',
        subtitle: `Order #${orderId} · ${customerName}`,
        timestamp: deliveredAt
      })
    } else if (shippingStatus === 'shipped') {
      pushNotification({
        id: `order:${orderId}:shipped`,
        avatarIcon: 'tabler-truck-delivery',
        avatarColor: 'info',
        title: common.orderShipped || 'Order shipped',
        subtitle: `Order #${orderId} · ${formatLabel(order.shipping_method || 'standard')}`,
        timestamp: shippedAt
      })
    }

    if (!paymentsByOrderId.has(String(orderId))) {
      if (paidStatuses.has(paymentStatus)) {
        pushNotification({
          id: `order:${orderId}:paid`,
          avatarIcon: 'tabler-credit-card-pay',
          avatarColor: 'success',
          title: common.paymentCompleted || 'Payment completed',
          subtitle: `Order #${orderId} · ${ordersDictionary.paymentReceived || 'Payment received via'} ${formatLabel(
            order.payment_method
          )}`,
          timestamp: order.paid_at || order.updated_at || createdAt
        })
      } else if (failedStatuses.has(paymentStatus)) {
        pushNotification({
          id: `order:${orderId}:payment-issue`,
          avatarIcon: 'tabler-alert-circle',
          avatarColor: 'error',
          title: common.paymentFailed || 'Payment failed',
          subtitle: `Order #${orderId} · ${ordersDictionary.paymentStatusLabel || 'Payment Status'}: ${
            ordersDictionary.failed || 'Failed'
          }`,
          timestamp: order.updated_at || createdAt
        })
      }
    }
  })

  return notifications.sort((left, right) => right.sortTime - left.sortTime).slice(0, MAX_NOTIFICATIONS)
}

export const useLiveNotifications = (dictionary = { common: {}, orders: {} }) => {
  const { lang } = useParams()
  const normalizedLang = i18n.locales.includes(lang) ? lang : i18n.defaultLocale
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const refreshNotifications = useMemo(
    () =>
      async ({ silent = false } = {}) => {
        const token = getAuthToken()

        if (!token) {
          setNotifications([])
          setLoading(false)

          return
        }

        if (!silent) {
          setLoading(true)
        }

        const [ordersResult, paymentsResult] = await Promise.allSettled([
          getAllOrders({ skip: 0, limit: 25 }),
          getAllPayments({ skip: 0, limit: 25 })
        ])

        const orders = ordersResult.status === 'fulfilled' ? normalizeCollection(ordersResult.value) : []
        const payments = paymentsResult.status === 'fulfilled' ? normalizeCollection(paymentsResult.value) : []
        const state = getNotificationState()
        const nextNotifications = buildNotifications(orders, payments, dictionary, normalizedLang)
          .filter(notification => !state.dismissedIds.includes(notification.id))
          .map(notification => ({
            ...notification,
            read: state.readIds.includes(notification.id)
          }))

        setNotifications(nextNotifications)
        setLoading(false)
      },
    [dictionary, normalizedLang]
  )

  useEffect(() => {
    refreshNotifications().catch(error => {
      console.error('[useLiveNotifications] Failed to fetch notifications:', error)
      setNotifications([])
      setLoading(false)
    })

    const intervalId = window.setInterval(() => {
      refreshNotifications({ silent: true }).catch(error => {
        console.error('[useLiveNotifications] Failed to refresh notifications:', error)
      })
    }, POLL_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [refreshNotifications])

  const updateStoredState = updater => {
    const currentState = getNotificationState()
    const nextState = updater(currentState)

    saveNotificationState(nextState)
  }

  const markNotificationRead = (notificationId, isRead) => {
    setNotifications(currentNotifications =>
      currentNotifications.map(notification =>
        notification.id === notificationId ? { ...notification, read: isRead } : notification
      )
    )

    updateStoredState(currentState => ({
      ...currentState,
      readIds: isRead
        ? [...currentState.readIds, notificationId]
        : currentState.readIds.filter(readId => readId !== notificationId)
    }))
  }

  const removeNotification = notificationId => {
    setNotifications(currentNotifications =>
      currentNotifications.filter(notification => notification.id !== notificationId)
    )

    updateStoredState(currentState => ({
      ...currentState,
      dismissedIds: [...currentState.dismissedIds, notificationId],
      readIds: currentState.readIds.filter(readId => readId !== notificationId)
    }))
  }

  const markAllNotifications = (notificationIds, isRead) => {
    setNotifications(currentNotifications =>
      currentNotifications.map(notification => ({ ...notification, read: isRead }))
    )

    updateStoredState(currentState => ({
      ...currentState,
      readIds: isRead
        ? [...currentState.readIds, ...notificationIds]
        : currentState.readIds.filter(readId => !notificationIds.includes(readId))
    }))
  }

  return {
    notifications,
    loading,
    markNotificationRead,
    removeNotification,
    markAllNotifications,
    refreshNotifications
  }
}

export default useLiveNotifications
