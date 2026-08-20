# Tom's Hair Journey

Personal post-op companion for the Aug 18–19 2026 FUE (~6,200 grafts · Dr. Sean). Metrics home, med ramp schedule, progress photos, and recovery care.

Open `index.html`. No build step.

**Password:** `8127` (same gate as before — remember-on-this-device is optional).

**Live:** [trivituso81.github.io/health](https://trivituso81.github.io/health/) — GitHub Pages, redeploys on every push to `main`.

## Add to Home Screen (iPhone / iPad)

Open the site in **Safari** → Share → **Add to Home Screen**. It installs as **Hair Journey** with the before → after icon and launches full screen.

> **This repository is public.** The `8127` gate is client-side only. If that matters, make the repo private and deploy via `DEPLOY-CLOUDFLARE.md`.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home — brand + four surgery metrics (no copy) |
| `schedule.html` | Clinic post-op meds/spray + personal stack ramp |
| `progress.html` | Photo timeline: days 1–7, weeks 2–3, months 1–12 |
| `care.html` | Dr. Sean post-op protocol (charts, wash, activity, growth) |
| `dr-sean-post-op-instructions.pdf` | Official clinic packet (source for Care / Schedule) |
| `progress/photos/` | Drop `day-01.jpg`, `week-02.jpg`, `month-01.jpg`, … here |
| `health.html` | Previous Tom's Health App landing (labs, longevity hub) |
| `transplant.html` | Full FUE peri-op playbook (linked from Care) |
| `stack.html` / `profile.html` / … | Legacy health pages still available by URL |

## Icons

Before → after home-screen mark: `python3 tools/make-journey-icons.py` (needs Pillow).

Legacy teal Health App mark: `python3 tools/make-icons.py`.

## Deploy

Merging to `main` ships to production — GitHub Pages serves the branch root. `.nojekyll` stops Jekyll from filtering static files.
