# Iframe Support for Telegram Mini Webapps

Cap now supports being embedded in iframes, making it perfect for use in Telegram mini webapps and other iframe-based integrations.

## Configuration

To enable iframe support in your Cap standalone server, you need to configure environment variables:

### Environment Variables

Add these to your `.env` file or set them in your deployment environment:

```bash
# Enable iframe embedding
ALLOW_IFRAME=true

# Specify allowed frame ancestors (space-separated)
# For Telegram mini webapps:
FRAME_ANCESTORS=https://web.telegram.org https://telegram.org

# Configure CORS origins (comma-separated)
# Should match your frame ancestors
CORS_ORIGIN=https://web.telegram.org,https://telegram.org
```

### Configuration Options

#### `ALLOW_IFRAME`
- **Type:** Boolean (`true` or `false`)
- **Default:** `false`
- **Description:** Enables iframe embedding of the Cap standalone application

#### `FRAME_ANCESTORS`
- **Type:** String (space-separated URLs)
- **Description:** Specifies allowed origins that can embed Cap in an iframe
- **Special values:**
  - `'self'` - Only allow same-origin embedding
  - `*` - Allow any origin (not recommended for production)
  - Empty - When `ALLOW_IFRAME=true` but no ancestors specified, defaults to `frame-ancestors *`

#### `CORS_ORIGIN`
- **Type:** String (comma-separated URLs)
- **Description:** Specifies allowed origins for CORS requests
- **Default:** `true` (allows all origins)

## Security Considerations

### Content Security Policy

When `ALLOW_IFRAME=true` and `FRAME_ANCESTORS` is set, Cap automatically adds a Content-Security-Policy header with the `frame-ancestors` directive:

```
Content-Security-Policy: frame-ancestors https://web.telegram.org https://telegram.org
```

When `ALLOW_IFRAME=true` but `FRAME_ANCESTORS` is not set, Cap allows all origins:

```
Content-Security-Policy: frame-ancestors *
```

This is more secure and flexible than the older `X-Frame-Options` header as it provides fine-grained control over which origins can embed your application.

### X-Frame-Options

When iframe support is not enabled (`ALLOW_IFRAME=false`), Cap sets:
```
X-Frame-Options: DENY
```

This prevents all iframe embedding, which is the secure default.

## Telegram Mini Webapp Integration

### Setup for Telegram

1. **Configure your Cap server:**
   ```bash
   ALLOW_IFRAME=true
   FRAME_ANCESTORS=https://web.telegram.org
   CORS_ORIGIN=https://web.telegram.org
   ```

2. **Deploy your Cap standalone server** to a publicly accessible domain (e.g., `https://cap.example.com`)

3. **Create a site key** in your Cap standalone dashboard

4. **Add the widget to your mini webapp:**
   ```html
   <!DOCTYPE html>
   <html>
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>My Telegram Mini App</title>
   </head>
   <body>
       <h1>Telegram Mini App</h1>
       
       <!-- Cap Widget -->
       <cap-widget data-cap-api-endpoint="https://cap.example.com/YOUR-SITE-KEY/"></cap-widget>
       
       <script src="https://cap.example.com/assets/widget.js"></script>
       <script>
           const widget = document.querySelector('cap-widget');
           
           widget.addEventListener('solve', (event) => {
               console.log('Verification successful!');
               console.log('Token:', event.detail.token);
               
               // Use the token for your backend verification
               // via /siteverify endpoint
           });
       </script>
   </body>
   </html>
   ```

### Testing Locally

For local development and testing:

```bash
# Allow all origins (development only!)
ALLOW_IFRAME=true
FRAME_ANCESTORS=*
CORS_ORIGIN=*
```

Then access your app at `http://localhost:3000` and test embedding it in an iframe.

## Example: Parent Page Embedding Cap

If you want to embed a page containing Cap widget in an iframe:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Parent Page</title>
</head>
<body>
    <h1>Embedded Cap Widget</h1>
    <iframe 
        src="https://cap.example.com" 
        width="400" 
        height="300"
        sandbox="allow-scripts allow-same-origin allow-forms"
        allow="cross-origin-isolated">
    </iframe>
</body>
</html>
```

## Verifying Tokens

After the user completes the CAPTCHA, verify the token on your backend:

```javascript
const response = await fetch('https://cap.example.com/siteverify', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bot YOUR_API_KEY'
    },
    body: JSON.stringify({
        token: tokenFromWidget,
        secret: 'YOUR_SECRET_KEY'
    })
});

const result = await response.json();
if (result.success) {
    // Token is valid
    console.log('Verification successful!');
} else {
    // Token is invalid
    console.error('Verification failed');
}
```

## Troubleshooting

### Widget doesn't load in iframe

**Check:**
1. ✅ `ALLOW_IFRAME=true` is set
2. ✅ `FRAME_ANCESTORS` includes the parent page's origin
3. ✅ Browser console for CSP errors
4. ✅ Network tab for CORS errors

### CORS errors

**Solution:**
- Make sure `CORS_ORIGIN` includes the origin making the requests
- For Telegram: `CORS_ORIGIN=https://web.telegram.org`

### CSP frame-ancestors blocking

**Solution:**
- Verify `FRAME_ANCESTORS` matches the parent page's origin exactly
- Use browser DevTools to check the actual origin of the parent page

## Additional Resources

- [Cap Documentation](https://capjs.js.org)
- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [MDN: X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)
