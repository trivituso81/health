# Deploy Tom's Health App — Cloudflare Pages + Access (private)

Your site stays on the internet, but **only you** (or emails you allow) can open it after login.

Estimated time: **30–45 minutes** first time.

---

## What you need

- Email address (for Cloudflare account + login PIN)
- Mac with the site folder:
  `/Users/tom_rivituso/Projects/cursor/TR workspace/hair-transplant-longevity-review`
- Node.js installed (for one-time deploy command). Check: `node -v`
  - If missing: install from https://nodejs.org (LTS)

---

## Part 1 — Create Cloudflare account (5 min)

1. Open **https://dash.cloudflare.com/sign-up**
2. Sign up with your email and a strong password.
3. Verify your email if prompted.
4. You do **not** need to add a custom domain for this setup. Skip “Add a site” if asked.

---

## Part 2 — Turn on Zero Trust (free) (5 min)

1. Open **https://one.dash.cloudflare.com/**
2. First visit: pick a **team name** (internal label only), e.g. `tom-health-private`
3. Choose the **Free** Zero Trust plan.
4. Go to **Settings → Authentication → Login methods**.
5. Enable **One-time PIN** (email code). Save.

Optional: add **Google** or **Apple** login under Login methods if you prefer that over PIN.

---

## Part 3 — Deploy the site to Cloudflare Pages (10 min)

Use an **obscure project name** (not `health-protocol`). Example: `hp-m7k2-private`

### 3a. Log in Wrangler (Cloudflare CLI)

In Terminal:

```bash
cd "/Users/tom_rivituso/Projects/cursor/TR workspace/hair-transplant-longevity-review"
npx wrangler login
```

A browser window opens → allow access to Cloudflare.

### 3b. Create the Pages project (once)

```bash
npx wrangler pages project create hp-m7k2-private --production-branch main
```

Use your own random name instead of `hp-m7k2-private`.

### 3c. Upload the site

```bash
npx wrangler pages deploy . --project-name=hp-m7k2-private
```

When it finishes, note your URL:

**https://hp-m7k2-private.pages.dev**

Open it in a browser — you should see the dashboard (currently **public** until Part 4).

### Updating later

After you change files locally, run the same deploy command again:

```bash
cd "/Users/tom_rivituso/Projects/cursor/TR workspace/hair-transplant-longevity-review"
npx wrangler pages deploy . --project-name=hp-m7k2-private
```

---

## Part 4 — Lock it with Cloudflare Access (10 min)

This is what keeps strangers off your data.

1. Go to **https://one.dash.cloudflare.com/**
2. **Access → Applications → Add an application**
3. Choose **Self-hosted**
4. Fill in:
   - **Application name:** Tom's Health App (private)
   - **Session duration:** 24 hours (or 7 days if you want fewer logins on phone)
   - **Subdomain:** `hp-m7k2-private` (must match your Pages project name)
   - **Domain:** `pages.dev`
   - Full hostname should read: **`hp-m7k2-private.pages.dev`**
5. Click **Next** → **Add a policy**:
   - **Policy name:** Only me
   - **Action:** Allow
   - **Include:** Selector **Emails** → Value **your-email@gmail.com** (exact address you’ll use)
   - Remove any “Everyone” / default allow rules if present
6. Save the application.

### Test

1. Open a **private/incognito** window.
2. Visit `https://hp-m7k2-private.pages.dev`
3. You should see a **Cloudflare Access login** (email PIN), not your dashboard.
4. Enter your allowlisted email → get PIN → land on the dashboard.
5. On your phone: same URL → Add to Home Screen.

---

## Part 5 — Phone bookmark

1. Safari → open your `*.pages.dev` URL (after Access login).
2. **Share → Add to Home Screen**
3. Name it **Tom's Health App**

Access session cookies usually persist for your chosen duration; you won’t need the PIN every hour.

---

## Security checklist

- [ ] Access policy allows **only your email** (not “everyone”)
- [ ] Project name is **random**, not guessable
- [ ] Tested in incognito — login wall appears before any content
- [ ] Don’t post the URL on social media or public GitHub
- [ ] Optional: remove income/net-worth lines from `profile.html` before deploy

`noindex` in the HTML helps search engines; **Access** is what actually protects you.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `wrangler: command not found` | Use `npx wrangler` (with `npx` prefix) as in this doc |
| Site loads with no login | Access app hostname must exactly match `projectname.pages.dev`; wait 1–2 min and retry |
| PIN never arrives | Check spam; try a different email you added to the policy |
| CSS/JS broken | Deploy the **folder root** (where `index.html` lives), not a parent directory |
| 404 on subpages | Redeploy full folder; all `.html` files must upload together |

---

## Optional — custom domain later

If you own a domain (e.g. `yourdomain.com`):

1. Add domain to Cloudflare DNS.
2. Pages → your project → **Custom domains** → add e.g. `health.yourdomain.com`
3. Edit the Access application to protect **that** hostname too (or replace `pages.dev` entry).

---

## Support links

- Cloudflare Pages: https://developers.cloudflare.com/pages/
- Cloudflare Access: https://developers.cloudflare.com/cloudflare-one/policies/access/
- Wrangler: https://developers.cloudflare.com/workers/wrangler/
