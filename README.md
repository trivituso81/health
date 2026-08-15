# Tom's Health App

Personal health hub — transplant playbook, labs, meds, supplements, skincare, hair, and longevity. One landing page; every section is reachable from home.

Open `index.html`. No build step.

**Password:** `8127` (same gate as the Italy itinerary — remember-on-this-device is optional).

**Live:** [trivituso81.github.io/health](https://trivituso81.github.io/health/) — GitHub Pages, redeploys on every push to `main`.

## Add to Home Screen (iPhone / iPad)

Open the site in **Safari** → Share → **Add to Home Screen**. It installs as **Tom's Health** with the teal T icon and launches full screen with no Safari chrome. Chrome on iOS can save a bookmark but cannot install a web app, so it has to be Safari.

The home-screen app keeps its own storage, so the `8127` gate asks once more on first launch there.

Icons are generated, not hand-drawn — run `python3 tools/make-icons.py` (needs Pillow) after editing `tools/make-icons.py` to re-render every size in `icons/`.

> **This repository is public.** The `8127` gate is client-side only — anyone can read every page, lab value, and dose straight from the repo or by viewing source. If that matters, make the repo private and deploy via `DEPLOY-CLOUDFLARE.md` (Cloudflare Pages + Access), which puts real authentication in front of the site.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home / landing — countdown, status, and links to everything |
| `transplant.html` | FUE peri-op playbook (Dr. Sean, 18–19 Aug 2026) |
| `profile.html` | Demographics, labs, interpretation |
| `stack.html` | Meds & supplements — one daily stack, Rx badges, phase toggle, tap-for-detail sheets |
| `medications.html` / `supplements.html` | Redirects to `stack.html` |
| `skincare.html` | Face routines |
| `haircare.html` | Scalp, Problend, shampoo |
| `longevity.html` | Experimental tier, peptides &amp; TRT on mechanism, 2026–2031 horizon |
| `dr-sean-fue-preop-agreement.txt` | Official clinic sheet (source of truth) |

## Deploy

Merging to `main` ships to production — GitHub Pages serves the branch root, and `.nojekyll` stops Jekyll from filtering the static files. `.github/workflows/pages.yml` runs an Actions deploy of the same content on each push.

For a genuinely private version, see `DEPLOY-CLOUDFLARE.md` (Cloudflare Pages + Access).
