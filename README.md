# VCBN site

Static landing for Vibe Code Builders Network (`index.html` + `style.css`).

## Deploy on Vercel

1. Push this repo to GitHub.
2. In [Vercel](https://vercel.com) → **Add New** → **Project** → import the repository.
3. Use defaults: **Framework Preset** “Other”, no build command, output `.` (root).
4. Deploy.

The included `vercel.json` marks the project as static (no install/build step).

## Local preview

Open `index.html` in a browser, or run a static server from this directory:

```bash
npx serve .
```
