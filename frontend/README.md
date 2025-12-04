# HealID - Frontend UI Kit

This folder contains a clean, minimal, responsive HTML/CSS UI kit for HealID.

Preview quickly with a static server (from this folder):

```bash
cd /home/nawalalao/Documents/SiliHealth/frontend
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Structure:
- `css/style.css` — design system and page styles
- `js/main.js` — minimal UI helpers (sidebar, preview, pregnancy calculator)
- `*.html` — individual pages for the product

Integration notes:
- HTML is structured for easy integration with backend templating (NestJS views or static serve).
- Forms use semantic names and `data-*` attributes to ease backend binding.

Run with Node/EJS dev server
----------------------------
We also include a minimal Express + EJS dev server to preview templates with shared header/footer.

Install dependencies and run:

```bash
cd /home/nawalalao/Documents/SiliHealth/frontend
npm install
npm run start
# open http://localhost:3000
```

Use `npm run dev` if you have `nodemon` installed (dev dependency included).
