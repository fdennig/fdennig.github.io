# fdennig.github.io

Personal site built with [Pelican](https://getpelican.com) and the `pelican-bootstrap3` theme (vendored into `themes/`).

---

## Theme & template override notes

The active theme is `pelican-bootstrap3`. Several templates in `templates/` override or extend the theme's defaults (via `THEME_TEMPLATES_OVERRIDES = ['templates']` in `pelicanconf.py`):

| File | What it does |
|---|---|
| `templates/about.html` | Bio layout (photo + text) + `Person` JSON-LD |
| `templates/contact.html` | Contact page with vCard download + QR code |
| `templates/article.html` | JSON-LD for publications, posts, and reports |
| `templates/index.html` | Custom home page layout |
| `templates/includes/ga.html` | GoatCounter analytics (replaces GA include) |

**Changing `BOOTSTRAP_THEME`** (e.g. `simplex` → `readable`) only swaps the CSS — no impact on any of the above.

**Switching to a different Pelican theme** requires attention:
- `about.html`, `contact.html`, `article.html`, `index.html` contain hardcoded Bootstrap 3 classes. They will replace the new theme's templates entirely and likely break the layout. These need to be rewritten to match the new theme's structure (the JSON-LD and GoatCounter content inside them is reusable).
- `templates/includes/ga.html` will be silently ignored if the new theme does not include `ga.html` in its base — analytics stops working with no error. Fix: add the GoatCounter script tag directly to the new theme's `base.html`.

---

## Analytics — GoatCounter

The site uses [GoatCounter](https://www.goatcounter.com) for privacy-friendly analytics. No cookies, no consent banner required (GDPR compliant).

- **Dashboard:** https://fdennig.goatcounter.com
- **Script location:** `templates/includes/ga.html` — overrides the theme's own `ga.html` include

**Warning:** this override works because `pelican-bootstrap3` includes `ga.html` in its `base.html`. If you switch themes, verify the new theme does the same — otherwise analytics will silently stop working. Fix: copy the theme's `base.html` to `templates/base.html` and add the script tag directly before `</head>`.

---

## Contact page & QR code

- **URL:** `/pages/contact/`
- **QR code URL** (for business cards): `https://fdennig.github.io/pages/contact/?qr=1`
  - On mobile via QR: automatically triggers a vCard (`.vcf`) download
  - On desktop or without `?qr=1`: shows the contact page normally
- **vCard file:** `content/files/francis-dennig.vcf`
- **Template:** `templates/contact.html`

To regenerate the QR code SVG for print:
```bash
qrencode -o contact-qr.svg -t SVG 'https://fdennig.github.io/pages/contact/?qr=1'
```

---

## JSON-LD structured data

Structured data is embedded as `<script type="application/ld+json">` blocks so search engines can understand the content semantically.

| Template | Schema type | Where |
|---|---|---|
| `templates/about.html` | `Person` | About page — name, title, org, social profiles |
| `templates/article.html` | `ScholarlyArticle` | Individual publication pages |
| `templates/article.html` | `BlogPosting` | Individual blog post pages |
| `templates/article.html` | `Report` | Individual report pages |

The article template branches on `article.category` to emit the right schema type. Fields used from content metadata: `title`, `authors`, `date`, `summary`, `outlet`, `doi` (publications), `uri` (reports).

To validate: paste any page URL into [Google's Rich Results Test](https://search.google.com/test/rich-results) or [schema.org validator](https://validator.schema.org).

---

## Deploying

The site is deployed to GitHub Pages via the `gh-pages` branch using `ghp-import`.

**Setup (one-time):**
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
Then in GitHub → Settings → Pages → set source to branch **`gh-pages`**, folder **`/ (root)`**.

**Publishing changes:**
```bash
source venv/bin/activate
invoke gh-pages
```

This builds the site using `publishconf.py` and force-pushes the `output/` folder to the `gh-pages` branch. The live site updates within a minute or two.

**Note:** the invoke task is defined as `gh_pages` in `tasks.py` but called with a hyphen (`gh-pages`) on the command line — that is how invoke works.
