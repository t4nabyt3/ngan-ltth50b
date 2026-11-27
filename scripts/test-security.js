import assert from 'node:assert/strict'
import { isSuspiciousRequest } from '../src/security/request-guard.js'
import { sanitizeCart, validateCheckoutForm } from '../src/security/validation.js'

console.log('Bắt đầu kiểm tra bảo mật cơ bản...')

// 1. Request bình thường cần được đi tiếp.
assert.equal(isSuspiciousRequest('https://demo.example.com/'), false)
assert.equal(isSuspiciousRequest('https://demo.example.com/product/usb-rubber-ducky'), false)

// 2. Một số payload phổ biến cần bị chuyển sang trang decoy.
assert.equal(
  isSuspiciousRequest('https://demo.example.com/?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E'),
  true,
)
assert.equal(isSuspiciousRequest("https://demo.example.com/?q=%27%20OR%201%3D1"), true)
assert.equal(isSuspiciousRequest('https://demo.example.com/.env'), true)
assert.equal(isSuspiciousRequest('https://demo.example.com/', 'POST'), true)

// 3. Form hợp lệ được chấp nhận.
const validForm = validateCheckoutForm({
  fullName: 'Nguyễn Kim Ngân',
  phone: '0901234567',
  address: '12 Đường ABC, Đà Lạt',
  note: '',
  payment: 'cod',
})
assert.equal(validForm.valid, true)

// 4. Nội dung script trong form bị từ chối.
const xssForm = validateCheckoutForm({
  fullName: '<script>alert(1)</script>',
  phone: '0901234567',
  address: '12 Đường ABC, Đà Lạt',
  note: '',
  payment: 'cod',
})
assert.equal(xssForm.suspicious, true)

// 5. Giỏ hàng chỉ giữ mã sản phẩm hợp lệ và giới hạn số lượng.
const safeCart = sanitizeCart(
  [
    { id: 'wifi-pineapple-mk7', quantity: 25 },
    { id: 'unknown-product', quantity: 2 },
  ],
  new Set(['wifi-pineapple-mk7']),
)
assert.deepEqual(safeCart, [{ id: 'wifi-pineapple-mk7', quantity: 10 }])

console.log('Hoàn tất: tất cả kiểm tra đều đạt.')
