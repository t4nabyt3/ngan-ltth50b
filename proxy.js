import { next } from '@vercel/functions'
import { isSuspiciousRequest } from './src/security/request-guard.js'

// Duong dan decoy danh cho request co dau hieu bat thuong.
const TRAP_PATH = '/you-got-a-trap?from=guard'

export default function proxy(request) {
  const url = new URL(request.url)

  // Khong kiem tra lai trang trap, tranh tao vong lap redirect.
  if (url.pathname === '/you-got-a-trap') {
    return next()
  }

  // Chuyen request co mau dang nghi sang trang decoy.
  if (isSuspiciousRequest(url, request.method)) {
    return Response.redirect(new URL(TRAP_PATH, url.origin), 303)
  }

  return next()
}
