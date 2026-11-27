import { blackFridayPrice, convertCents, formatVnd } from '../data/commerce'

export default function OfferPrice({ cents, offer, quantity = 1 }) {
  const original = formatVnd(convertCents(cents) * quantity)
  if (!offer) return <strong>{original}</strong>

  const sale = formatVnd(convertCents(blackFridayPrice(cents)) * quantity)
  return (
    <span className="offer-price">
      <del aria-label={`Giá gốc ${original}`}>{original}</del>
      <strong aria-label={`Giá ưu đãi ${sale}`}>{sale}</strong>
    </span>
  )
}
