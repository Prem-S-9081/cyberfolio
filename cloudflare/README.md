# Cloudflare in front of GitHub Pages (free plan)

Order matters: GitHub Pages first, Cloudflare second. Replace `your-domain.com` everywhere.

## 1. GitHub Pages + GoDaddy
1. Repo > Settings > Pages: set the custom domain. The file `docs/CNAME` (containing only your domain) is created by `python security/set-domain.py your-domain.com`.
2. Verify the domain (Settings > Pages > Add a domain, or your account's Pages verification). This stops anyone else claiming it.
3. At GoDaddy, add the DNS records from GitHub's "Managing a custom domain" page (apex A records plus a `www` CNAME).
4. When the certificate is issued, tick **Enforce HTTPS**.

## 2. Move DNS to Cloudflare
1. If DNSSEC is on at GoDaddy, turn it off first (otherwise the domain can go dark after the switch).
2. Add the site in Cloudflare (Free). Import the records. Leave the GitHub records **DNS only (grey cloud)** for now.
3. GoDaddy > domain > Nameservers > "I'll use my own nameservers" > enter the two Cloudflare ones. Wait for "Active".
4. Open the site over HTTPS and confirm it works. Then turn the records to **Proxied (orange cloud)**.

## 3. Settings
- SSL/TLS mode: **Full (strict)**. Never "Flexible" (redirect loops with GitHub Pages).
- Edge Certificates: Always Use HTTPS on, Minimum TLS 1.2, Automatic HTTPS Rewrites on.
- Security > Bots: Bot Fight Mode on (verified crawlers such as Googlebot stay allowed).
- Rules > Cache Rules: hostname equals your domain, Edge TTL **Respect origin** (GitHub sends a 10-minute max-age, so a push appears within about 10 minutes; without this Cloudflare can serve old CSS/JS for hours). After an urgent deploy: Caching > Purge Everything.

## 4. Security headers
Rules > Transform Rules > Modify Response Header > Create rule.
When: hostname equals your domain. Then: **Set static** for each line in `cloudflare/response-headers.txt` (six headers).
That file is generated. To change the policy, edit `security/csp.txt`, run `python security/apply-security.py`, paste the new `Content-Security-Policy` line into the rule, commit.

HSTS starts at 180 days without `includeSubDomains` or `preload`, so your other subdomains are untouched. Raise it later once everything is stable.

## 5. Check it
- `curl -I https://your-domain.com` shows all six headers.
- securityheaders.com and the Mozilla Observatory.
- Search Console > URL Inspection > Test live URL: confirm the rendered page still shows the project, research and blog cards.

## 6. Protect the accounts
Turn on 2FA for Cloudflare, GoDaddy and GitHub, and lock the domain at GoDaddy.

## Rollback
Set the DNS records back to **DNS only (grey cloud)**. Cloudflare is bypassed, and the meta tags in the pages still apply the CSP and referrer policy.
