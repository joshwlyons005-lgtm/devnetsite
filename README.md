# DevNet site

Static landing for DevNet, the Developer Network (`index.html` + `style.css`).

## Assets

- **Social previews**: [`assets/og-image.png`](assets/og-image.png) is referenced by Open Graph and Twitter meta tags (e.g. `https://www.devnetwork.app/assets/og-image.png`). Keep this file in sync when deploying so link previews work.

## Deploy on Vercel

1. Push this repo to GitHub.
2. In [Vercel](https://vercel.com) → **Add New** → **Project** → import the repository.
3. Use defaults: **Framework Preset** "Other", no build command, output `.` (root).
4. Deploy.

The included [`vercel.json`](vercel.json) sets security headers (for example `X-Content-Type-Options`, `X-Frame-Options`). There is no separate "static site" preset in that file.

If you change Tailwind utility classes in `index.html`, rebuild the stylesheet so `tailwind-output.css` stays in sync: run `npm install` once, then `npm run build` (or `npm run dev` while editing).

## Local preview

Open `index.html` in a browser, or run a static server from this directory:

```bash
npx serve .
```
