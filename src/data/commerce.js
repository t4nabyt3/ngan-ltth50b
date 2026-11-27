const blackFridayProducts = new Set([
  'pager',
  'usb-rubber-ducky',
  'wifi-pineapple-mk7',
  'shark-jack-display',
  'bash-bunny-mk2',
  'packet-squirrel-mark-ii',
])

export const blackFridayRate = 15
export const usdToVnd = 26030
export const freeShippingAt = 5200000
export const codFeeVnd = 35000
export const importCostRate = 10

export const deliveryZones = {
  hanoi: { name: 'Hà Nội', shippingVnd: 39000, businessDays: [12, 18] },
  hcm: { name: 'TP. Hồ Chí Minh', shippingVnd: 39000, businessDays: [12, 18] },
  other: { name: 'Tỉnh / thành khác', shippingVnd: 59000, businessDays: [14, 22] },
}

export const promotions = {
  STUDENT10: { label: 'Giảm 10% hàng giá thường', rate: 10 },
  FREESHIP: { label: 'Miễn phí giao nội địa', shipping: true },
}

const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
export const formatVnd = (vnd) => currency.format(vnd)
export const convertCents = (cents) => Math.round(cents * usdToVnd / 100)
export const formatCents = (cents) => formatVnd(convertCents(cents))

export function isBlackFridayOffer(product, available = product.available) {
  return available && blackFridayProducts.has(product.id)
}

export function blackFridayPrice(cents) {
  return cents - Math.round(cents * blackFridayRate / 100)
}

export function quoteCart(items, code = '', { zone = '', payment = '' } = {}) {
  const promo = Object.hasOwn(promotions, code) ? promotions[code] : null
  const delivery = Object.hasOwn(deliveryZones, zone) ? deliveryZones[zone] : null
  let subtotalVnd = 0
  let merchandiseVnd = 0
  let discountVnd = 0
  let importedItemsVnd = 0
  let ships = false

  for (const { product, option, quantity } of items) {
    const original = convertCents(option.cents) * quantity
    const onSale = isBlackFridayOffer(product, option.available)
    const price = onSale ? convertCents(blackFridayPrice(option.cents)) * quantity : original
    const discount = onSale ? 0 : Math.round(price * (promo?.rate ?? 0) / 100)
    subtotalVnd += original
    merchandiseVnd += price
    discountVnd += discount
    if (!product.digital) {
      ships = true
      importedItemsVnd += price - discount
    }
  }

  const freeShipping = !ships || promo?.shipping || subtotalVnd >= freeShippingAt
  const shippingVnd = freeShipping ? 0 : delivery?.shippingVnd ?? null
  const importVnd = Math.round(importedItemsVnd * importCostRate / 100)
  const codVnd = ships && payment === 'cod' ? codFeeVnd : 0

  return {
    subtotalVnd,
    merchandiseVnd,
    saleDiscountVnd: subtotalVnd - merchandiseVnd,
    discountVnd,
    shippingVnd,
    importVnd,
    codVnd,
    totalVnd: merchandiseVnd - discountVnd + (shippingVnd ?? 0) + importVnd + codVnd,
    ships,
    delivery: ships ? delivery : null,
  }
}

const dateFormat = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })

export function deliveryDates([earliest, latest], now = new Date()) {
  const vietnamToday = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  const date = new Date(Date.UTC(vietnamToday.getUTCFullYear(), vietnamToday.getUTCMonth(), vietnamToday.getUTCDate()))
  let from = ''
  let count = 0
  while (count < latest) {
    date.setUTCDate(date.getUTCDate() + 1)
    if (date.getUTCDay() === 0 || date.getUTCDay() === 6) continue
    count++
    if (count === earliest) from = dateFormat.format(date)
  }
  return `${from} – ${dateFormat.format(date)}`
}
