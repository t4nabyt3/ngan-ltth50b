// Kiem tra du lieu truoc khi tao don hang demo.
// Day la validate o trinh duyet, khong thay the validate o backend.

const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s.'’\-]{1,79}$/u
const PHONE_PATTERN = /^(0|\+84)[0-9]{8,10}$/
const ADDRESS_PATTERN = /^[\p{L}\p{M}0-9\s#.,:/()'’\-]{8,240}$/u

// Cac ky tu dieu khien va ky tu an khong can thiet trong noi dung form.
const HIDDEN_CHARACTERS = /[\u0000-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2060-\u206F]/g

// Chi danh dau cac mau script pho bien. React van tu dong escape text khi hien thi.
const SUSPICIOUS_TEXT = /<\s*\/?\s*(script|iframe|object|embed)\b|javascript\s*:|data\s*:\s*text\/html|\bon[a-z0-9_-]+\s*=|document\s*\.\s*cookie/i

const ALLOWED_PAYMENTS = ['cod', 'bank', 'wallet']

export function cleanText(value, maxLength = 300) {
  return String(value ?? '')
    .normalize('NFC')
    .replace(HIDDEN_CHARACTERS, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

export function containsSuspiciousText(form) {
  const allText = [
    form.fullName,
    form.phone,
    form.address,
    form.note,
  ].join(' ')

  return SUSPICIOUS_TEXT.test(allText)
}

export function validateCheckoutForm(form) {
  const fullName = cleanText(form.fullName, 80)
  const phone = String(form.phone ?? '').replace(/[\s().-]/g, '')
  const address = cleanText(form.address, 240)
  const note = cleanText(form.note, 300)
  const payment = String(form.payment ?? '')

  const errors = {}
  const suspicious = containsSuspiciousText(form)

  if (suspicious) {
    return {
      valid: false,
      suspicious: true,
      errors: { form: 'Dữ liệu chứa nội dung không được chấp nhận.' },
      data: { fullName, phone, address, note, payment: 'cod' },
    }
  }

  if (!NAME_PATTERN.test(fullName)) {
    errors.fullName = 'Nhập họ tên hợp lệ, từ 2 đến 80 ký tự.'
  }

  if (!PHONE_PATTERN.test(phone)) {
    errors.phone = 'Số điện thoại chưa đúng. Ví dụ: 0901234567.'
  }

  if (!ADDRESS_PATTERN.test(address)) {
    errors.address = 'Địa chỉ cần từ 8 đến 240 ký tự.'
  }

  if (!ALLOWED_PAYMENTS.includes(payment)) {
    errors.payment = 'Hãy chọn một phương thức thanh toán.'
  }

  if (note.length > 300) {
    errors.note = 'Ghi chú không được vượt quá 300 ký tự.'
  }

  return {
    valid: Object.keys(errors).length === 0,
    suspicious: false,
    errors,
    data: {
      fullName,
      phone,
      address,
      note,
      payment: ALLOWED_PAYMENTS.includes(payment) ? payment : 'cod',
    },
  }
}

// Chi chap nhan san pham co trong danh sach va so luong tu 1 den 10.
export function sanitizeCart(rawCart, validProductIds) {
  if (!Array.isArray(rawCart)) return []

  const cleanCart = []

  rawCart.forEach((item) => {
    if (!item || typeof item !== 'object') return
    if (!validProductIds.has(item.id)) return

    const quantity = Number(item.quantity)
    if (!Number.isInteger(quantity) || quantity < 1) return

    const existingItem = cleanCart.find((product) => product.id === item.id)

    if (existingItem) {
      existingItem.quantity = Math.min(10, existingItem.quantity + quantity)
      return
    }

    cleanCart.push({
      id: item.id,
      quantity: Math.min(10, quantity),
    })
  })

  return cleanCart
}
