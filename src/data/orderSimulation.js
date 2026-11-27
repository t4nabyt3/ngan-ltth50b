export const paymentDuration = 7600
const fulfillmentInterval = 2800

export function orderSteps(order) {
  if (!order.quote.ships) return ['Chờ thanh toán', 'Đã xác nhận thanh toán', 'Hoàn tất mô phỏng giao sản phẩm số']
  const first = order.method === 'cod' ? ['Chờ xác nhận đơn COD', 'Đã xác nhận đơn COD'] : ['Chờ thanh toán', 'Đã xác nhận thanh toán']
  return [...first, 'Đang nhập hàng và thông quan', 'Đang giao nội địa', order.method === 'cod' ? 'Đã giao và thu tiền COD' : 'Đã giao hàng']
}

export function hasPendingPayment(order) {
  return order.method !== 'cod' && order.stage === 0
}

export function nextOrderUpdate(order, now) {
  const pending = hasPendingPayment(order)
  if (pending && order.paymentRun.fail) return null

  const paidAt = order.paymentRun.startedAt + (order.method === 'cod' ? 0 : paymentDuration)
  const lastStage = orderSteps(order).length - 1
  if (order.stage >= lastStage) return null

  const firstStage = order.method === 'cod' ? 0 : 1
  const nextAt = paidAt + (order.stage + 1 - firstStage) * fulfillmentInterval
  if (now < nextAt) return { delay: nextAt - now }
  const stage = Math.min(lastStage, firstStage + Math.floor((now - paidAt) / fulfillmentInterval))
  return { stage }
}
