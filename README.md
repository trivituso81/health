# Tom's Health App

Personal health hub — transplant playbook, labs, meds, supplements, skincare, hair, and longevity. One landing page; every section is reachable from home.

Open `index.html`. No build step.

**Password:** `8127` (same gate as the Italy itinerary — remember-on-this-device is optional).

**Open it now:** [Tom's Health App](https://raw.githack.com/trivituso81/health/main/index.html) — serves the current `main` from a CDN, works on phones.

## Add to Home Screen (iPhone / iPad)

Open the site in **Safari** → Share → **Add to Home Screen**. It installs as **Tom's Health** with the teal T icon and launches full screen with no Safari chrome. Chrome on iOS can save a bookmark but cannot install a web app, so it has to be Safari.

The home-screen app keeps its own storage, so the `8127` gate asks once more on first launch there.

Icons are generated, not hand-drawn — run `python3 tools/make-icons.py` (needs Pillow) after editing `tools/make-icons.py` to re-render every size in `icons/`.

> **This repository is public.** The `8127` gate is client-side only — anyone can read every page, lab value, and dose straight from the repo or by viewing source. If that matters, make the repo private and deploy via `DEPLOY-CLOUDFLARE.md` (Cloudflare Pages + Access), which puts real authentication in front of the site.

## Permanent github.io address

Deployment is automated — `.github/workflows/pages.yml` publishes every push to `main` — but GitHub Pages has to be switched on once by the repo owner before any workflow run can succeed:

1. Repo **Settings → Pages**
2. **Build and deployment → Source → GitHub Actions**
3. **Actions** tab → *Deploy site* → **Run workflow** (or push anything to `main`)

The site then lands at `https://trivituso81.github.io/health/`. Until that switch is flipped, every run fails at `configure-pages` with `Resource not accessible by integration` — the workflow token cannot create a Pages site that has never existed.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home / landing — countdown, status, and links to everything |
| `transplant.html` | FUE peri-op playbook (Dr. Sean, 18–19 Aug 2026) |
| `profile.html` | Demographics, labs, interpretation |
| `medications.html` | Prescriptions and peri-op hold/continue rules |
| `supplements.html` | Oral stack — Ideal / Pre-op / Post-op / Clinic OK / Full |
| `skincare.html` | Face routines |
| `haircare.html` | Scalp, Problend, shampoo |
| `longevity.html` | Experimental tier, peptides &amp; TRT on mechanism, 2026–2031 horizon |
| `dr-sean-fue-preop-agreement.txt` | Official clinic sheet (source of truth) |

## Deploy

See `DEPLOY-CLOUDFLARE.md` for Cloudflare Pages + Access (keep it private).
