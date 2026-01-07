# Iframe Support Testing

This directory contains test files for verifying iframe support functionality in Cap Standalone.

## Test Files

### `test-iframe-config.js`
Unit tests for the iframe configuration logic. Verifies that security headers are set correctly based on environment variables.

**Run tests:**
```bash
node test-iframe-config.js
```

**Test cases:**
- Default configuration (iframe blocked)
- Allow iframe with specific ancestors (e.g., Telegram)
- Allow iframe with wildcard
- Allow iframe without specific ancestors
- Allow iframe with 'self' only

### `test-iframe.html`
Interactive test page for manually verifying that the Cap widget works correctly when embedded in an iframe-like context.

**Usage:**
1. Start the Cap standalone server with iframe support enabled:
   ```bash
   ALLOW_IFRAME=true FRAME_ANCESTORS="*" bun run dev
   ```

2. Open `test-iframe.html` in a browser

3. Click the widget to verify it works correctly

## Environment Configuration for Testing

### Local Development
```bash
ALLOW_IFRAME=true
FRAME_ANCESTORS=*
CORS_ORIGIN=*
```

### Production (Telegram Mini Webapp)
```bash
ALLOW_IFRAME=true
FRAME_ANCESTORS=https://web.telegram.org https://telegram.org
CORS_ORIGIN=https://web.telegram.org,https://telegram.org
```

## Verifying Iframe Support

After deploying with iframe support enabled, you can verify it works by:

1. **Check headers**: Use browser DevTools Network tab to verify the response headers
   - Should see `Content-Security-Policy: frame-ancestors ...` header
   - Should NOT see `X-Frame-Options: DENY` header

2. **Test embedding**: Create a simple HTML page that embeds your Cap server in an iframe
   ```html
   <iframe src="https://your-cap-server.com" width="400" height="300"></iframe>
   ```

3. **Console check**: Look for CSP or X-Frame-Options errors in the browser console

## Common Issues

### Widget doesn't load in iframe
- Verify `ALLOW_IFRAME=true` is set
- Check `FRAME_ANCESTORS` includes the parent page's origin
- Look for CSP errors in browser console

### CORS errors
- Ensure `CORS_ORIGIN` includes the requesting origin
- For development, use `CORS_ORIGIN=*`

### CSP frame-ancestors blocking
- Verify exact origin match (including protocol and port)
- Use browser DevTools to check actual parent origin
