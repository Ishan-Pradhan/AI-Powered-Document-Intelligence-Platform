# Chat Widget Integration

Embed an AI-powered floating chat assistant on any website in seconds.

## Quick Start

Add this `<script>` tag before the closing `</body>` of your page:

```html
<script
  src="https://your-domain.com/widget.js"
  data-document-id="YOUR_DOCUMENT_ID"
  data-theme-color="#3b82f6"
  async>
</script>
```

Replace `YOUR_DOCUMENT_ID` with the document ID from your Knowledge Base, and swap the `src` domain for your actual hosted URL.

---

## Configuration

| Attribute | Required | Description | Default |
| :--- | :---: | :--- | :--- |
| `data-document-id` | ✅ | Document ID to chat against | — |
| `data-theme-color` | — | Brand hex color for the button & UI | `#3b82f6` |
| `data-sso-token` | — | JWT to auto-login a known user | — |

---

## Brand Color Examples

Pick any hex to match your brand — the widget button and chat bubbles adapt automatically:

```html
data-theme-color="#6366f1"   <!-- Indigo  -->
data-theme-color="#10b981"   <!-- Emerald -->
data-theme-color="#f59e0b"   <!-- Amber   -->
data-theme-color="#ef4444"   <!-- Red     -->
data-theme-color="#8b5cf6"   <!-- Violet  -->
```

---

## SSO Integration (optional)

If you want recognized members to be auto-logged in inside the widget, sign a JWT on your server with the shared secret and pass it as `data-sso-token`:

```js
// Server-side (Node.js example)
const jwt = require('jsonwebtoken');
const ssoToken = jwt.sign(
  { email: user.email, name: user.name },
  process.env.SSO_SHARED_SECRET,
  { expiresIn: '1h' }
);
```

```html
<script
  src="https://your-domain.com/widget.js"
  data-document-id="YOUR_DOCUMENT_ID"
  data-theme-color="#6366f1"
  data-sso-token="<ssoToken>"
  async>
</script>
```
