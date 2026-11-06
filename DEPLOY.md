# Deploying the Core5 website + contact-form mailer

The site is a Node.js app (`server.js`) that:
- serves all the static pages, and
- handles the **Contact** form at `POST /send`, emailing leads to **enquiry@core5.co.in** via Gmail SMTP.

The **Careers** form uses FormSubmit separately and needs no server.

The app password is **never** committed — it's read from **environment variables** on the host
(`mail-config.json` is only for local testing and is gitignored).

---

## Recommended host: Render (free tier)

### 1. Put the code on GitHub
Push this project to a GitHub repo you can connect (code only — `mail-config.json` and
`node_modules` are gitignored and will not be uploaded).

### 2. Create the web service on Render
1. Sign up at https://render.com and click **New → Web Service**.
2. Connect your GitHub repo.
3. Settings (Render auto-detects most from `render.yaml`):
   - **Runtime:** Node
   - **Build command:** `npm install`
   - **Start command:** `node server.js`
   - **Plan:** Free (or a paid plan for always-on — see note below)

### 3. Add the secret environment variables
In the service's **Environment** tab, add:

| Key         | Value                                   |
|-------------|-----------------------------------------|
| `SMTP_USER` | `enquiry@core5.co.in` (the sending account) |
| `SMTP_PASS` | your 16-char Google App Password         |
| `CONTACT_TO`| `enquiry@core5.co.in`                    |
| `SMTP_PORT` | `465`                                    |
| `SMTP_SECURE` | `true`                                 |

(If port 465 is blocked on the host, use `SMTP_PORT=587` and `SMTP_SECURE=false`.)

### 4. Deploy
Click **Create Web Service**. Render runs `npm install` then `node server.js` and gives you
a URL like `https://core5-website.onrender.com`. Open `/contact.html` there and test — the
lead email should arrive at enquiry@core5.co.in.

### 5. Point your domain
In Render → **Settings → Custom Domains**, add `www.core5.co.in` (or your domain) and update
the DNS records Render shows at your domain registrar.

---

## Notes
- **Free tier sleeps** after ~15 min of no traffic and cold-starts on the next request
  (first hit can take ~30–50s). For truly always-on, use a paid Render plan or a host like
  Railway / a small VPS.
- Other Node hosts (Railway, Fly.io, a VPS with PM2) work the same way: run `npm install`,
  set the same environment variables, and run `node server.js`.
- **Security:** the Google App Password used during setup was shared in chat — revoke it at
  https://myaccount.google.com/apppasswords and generate a fresh one, then update `SMTP_PASS`
  in the host's environment variables.

---

## Local testing (optional)
```
npm install
node server.js
```
Then open http://localhost:3000/contact.html — uses `mail-config.json` for credentials.
