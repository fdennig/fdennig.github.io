"""
Convert a BibTeX file to Pelican 'publications' markdown items.

Usage:
  python scripts/bib_to_markdown.py publications.bib content/publications

Requires:
  pip install bibtexparser
"""
import sys, re, os
from pathlib import Path
try:
    import bibtexparser
except ImportError:
    print("Install dependency first: pip install bibtexparser")
    sys.exit(1)

TYPE_MAP = {
    "article": "article",
    "inproceedings": "conference paper",
    "conference": "conference paper",
    "proceedings": "conference paper",
    "book": "book",
    "inbook": "book chapter",
    "incollection": "book chapter",
    "phdthesis": "thesis",
    "mastersthesis": "thesis",
    "techreport": "report",
    "report": "report",
    "misc": "report"
}

def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[’'`]", "", text)
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text[:80]

def format_authors(entry):
    raw = entry.get("author", "").strip()
    if not raw:
        return ""
    parts = [a.strip().replace("\n", " ") for a in raw.split(" and ")]
    norm = []
    for p in parts:
        if "," in p:
            last, first = [s.strip() for s in p.split(",", 1)]
            norm.append(f"{first} {last}".strip())
        else:
            norm.append(p)
    return ", ".join(norm)

def detect_outlet(e):
    return (e.get("journal") or e.get("booktitle") or e.get("publisher") or "")

def detect_type(e):
    return TYPE_MAP.get(e.get("ENTRYTYPE","").lower(), e.get("ENTRYTYPE","").lower())

def best_link(e):
    if e.get("url"):
        return e["url"]
    if e.get("doi"):
        return f"https://doi.org/{e['doi']}"
    return ""

def first_sentence(text: str) -> str:
    m = re.split(r'(?<=[.!?])\s+', text.strip(), 1)
    return m[0] if m else ""

TEMPLATE = """Title: {title}
Date: {year}-01-01
Category: publications
Slug: {slug}
Year: {year}
Authors: {authors}
Outlet: {outlet}
Type: {type_}
DOI: {doi}
Link: {link}
Summary: {summary}
Save_as:
URL:

{abstract}
"""

def main(bib_path, out_dir):
    with open(bib_path, encoding="utf-8") as f:
        db = bibtexparser.load(f)

    out_path = Path(out_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    for entry in db.entries:
        title = entry.get("title", "").replace("{", "").replace("}", "").strip()
        if not title:
            continue
        year = entry.get("year", "1900")
        authors = format_authors(entry)
        outlet = detect_outlet(entry)
        type_ = detect_type(entry)
        doi = entry.get("doi","")
        link = best_link(entry)
        abstract = entry.get("abstract","").strip()
        # Escape braces in abstract so .format() doesn’t treat them as placeholders
        abstract_fmt = abstract.replace("{","{{").replace("}","}}")
        slug = slugify(title) or slugify(entry.get("ID","publication"))
        summary = first_sentence(abstract)[:300] if abstract else ""

        md_text = TEMPLATE.format(
            title=title,
            year=year,
            slug=slug,          # FIX: added slug
            authors=authors,
            outlet=outlet,
            type_=type_,
            doi=doi,
            link=link,
            summary=summary,
            abstract=abstract_fmt
        ).rstrip() + "\n"

        md_file = out_path / f"{slug}.md"
        with open(md_file, "w", encoding="utf-8") as mf:
            mf.write(md_text)
        print(f"Created {md_file}")

    print("Done.")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python scripts/bib_to_markdown.py input.bib content/publications")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])