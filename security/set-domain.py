#!/usr/bin/env python3
import pathlib, re, sys

SITE = pathlib.Path(__file__).resolve().parent.parent / "docs"
FILES = ["index.html", "sitemap.xml", "robots.txt"]
PLACEHOLDER = "https://securedbyprem.com/"


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    domain = sys.argv[1].strip().lower().removeprefix("https://").removeprefix("http://").rstrip("/")
    if not re.fullmatch(r"([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}", domain):
        sys.exit(f"'{domain}' does not look like a domain name (example: securedbyprem.com)")
    cname = SITE / "CNAME"
    previous = cname.read_text().strip() if cname.exists() else ""
    olds = {PLACEHOLDER} | ({previous} if previous else set())   # the placeholder AND any domain already in CNAME
    olds.discard(domain)
    total = 0
    for name in FILES:
        p = SITE / name
        text = p.read_text(encoding="utf-8")
        for old in olds:
            total += text.count(f"https://{old}")
            text = text.replace(f"https://{old}", f"https://{domain}")
        p.write_text(text, encoding="utf-8")
    cname.write_text(domain + "\n")
    left = sum((SITE / n).read_text(encoding="utf-8").count(PLACEHOLDER) for n in FILES)
    print(f"-> {domain}: {total} URLs updated, docs/CNAME written, placeholders left: {left}")
    sys.exit(1 if left else 0)


if __name__ == "__main__":
    main()
