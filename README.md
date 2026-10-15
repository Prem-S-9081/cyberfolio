# Cyberfolio

Personal cybersecurity portfolio. Static site (HTML, CSS, JavaScript), no build step.

```
docs/         the website (GitHub Pages publishes this folder)
security/     policy tool: csp.txt, apply-security.py, set-domain.py
cloudflare/   Cloudflare setup guide and the response-header list
DEPLOY.md     step-by-step deployment
```

Edit the site in `docs/`. Before committing, run `python security/apply-security.py --check`.
