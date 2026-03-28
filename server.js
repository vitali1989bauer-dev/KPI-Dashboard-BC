import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

// ---------------------------------------------------------------------------
// HTTP Basic Auth — set DASHBOARD_USER and DASHBOARD_PASS in Railway env vars
// ---------------------------------------------------------------------------
const AUTH_USER = process.env.DASHBOARD_USER || 'voith'
const AUTH_PASS = process.env.DASHBOARD_PASS

if (!AUTH_PASS) {
  console.error('⚠  DASHBOARD_PASS environment variable is not set. Server will not start without it.')
  console.error('   Set it in Railway: Settings → Variables → DASHBOARD_PASS = <your-password>')
  process.exit(1)
}

app.use((req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Voith Pricing Intelligence"')
    return res.status(401).send('Authentication required')
  }

  const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString()
  const [user, pass] = credentials.split(':')

  // Constant-time comparison to prevent timing attacks
  const userMatch = user.length === AUTH_USER.length &&
    Buffer.from(user).every((byte, i) => byte === AUTH_USER.charCodeAt(i))
  const passMatch = pass.length === AUTH_PASS.length &&
    Buffer.from(pass).every((byte, i) => byte === AUTH_PASS.charCodeAt(i))

  if (userMatch && passMatch) {
    return next()
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Voith Pricing Intelligence"')
  return res.status(401).send('Invalid credentials')
})

// ---------------------------------------------------------------------------
// Serve static files from dist/
// ---------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'dist')))

// SPA fallback — serve index.html for all non-file routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Dashboard running on port ${PORT} (auth enabled, user: ${AUTH_USER})`)
})
