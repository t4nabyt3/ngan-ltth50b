// Bo loc request co dau hieu do tham hoac payload tan cong pho bien.
// Day chi la lop loc co ban, khong the thay the WAF cua Vercel.

const BLOCKED_PATHS = /(?:^|\/)(?:\.env(?:\.[^/]*)?|\.git|wp-admin|wp-login\.php|xmlrpc\.php|phpmyadmin|server-status|actuator|cgi-bin|vendor\/phpunit)(?:\/|$)/i

const ATTACK_PATTERNS = [
  /<\s*\/?\s*(script|iframe|object|embed)\b/i,
  /javascript\s*:/i,
  /data\s*:\s*text\/html/i,
  /\bon[a-z0-9_-]+\s*=/i,
  /document\s*\.\s*cookie/i,
  /\bunion\b.{0,40}\bselect\b/i,
  /\bselect\b.{0,40}\bfrom\b/i,
  /\b(or|and)\b\s+['"]?\d+['"]?\s*=\s*['"]?\d+/i,
  /sleep\s*\(|benchmark\s*\(|information_schema|xp_cmdshell/i,
  /(?:;|&&|\|\|)\s*(?:cat|curl|wget|whoami|id)\s+(?:\/etc\/|\/proc\/|https?:\/\/)/i,
  /(?:\.\.\/|\.\.\\)/i,
  /\$\{[^}]{1,120}\}|\{\{[^}]{1,120}\}\}/,
]

// Giai ma URL toi da 3 lan de phat hien cac chuoi da duoc ma hoa.
function decodeValue(value) {
  let result = String(value || '')

  for (let count = 0; count < 3; count += 1) {
    try {
      const decoded = decodeURIComponent(result.replace(/\+/g, '%20'))

      if (decoded === result) break
      result = decoded
    } catch {
      return null
    }
  }

  return result.toLowerCase()
}

export function isSuspiciousRequest(requestUrl, method = 'GET') {
  let url

  try {
    url = requestUrl instanceof URL ? requestUrl : new URL(requestUrl)
  } catch {
    return true
  }

  // Website demo chi co cac trang doc, khong co API ghi du lieu.
  const requestMethod = String(method).toUpperCase()
  if (requestMethod !== 'GET' && requestMethod !== 'HEAD') return true

  // URL dai bat thuong khong can thiet voi mot cua hang tinh.
  if (url.pathname.length + url.search.length > 4096) return true

  const path = decodeValue(url.pathname)
  const query = decodeValue(url.search)

  if (path === null || query === null) return true
  if (BLOCKED_PATHS.test(path)) return true
  if (/\/(etc\/passwd|proc\/self\/environ)(\/|$)/i.test(path)) return true

  const requestText = `${path}\n${query}`
  return ATTACK_PATTERNS.some((pattern) => pattern.test(requestText))
}
