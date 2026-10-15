# Deployment: GitHub Pages + GoDaddy domain + Cloudflare

Do the steps in order. Replace `example.com` with your domain and `<user>` with your GitHub username.
Cloudflare comes last, only after the site already works over HTTPS on your domain.

## Already have a live site? Migrate to this layout without downtime
If your repo already has a `CNAME` file and Pages is serving from the repo root, steps 3 to 5 below are mostly done. Switch layouts in this order:
1. In your local repo folder (the one with the hidden `.git`), **keep your old files for now** and extract this package into it. It adds `docs/`, `security/`, `cloudflare/` next to them.
2. Open your old `CNAME` in Notepad to read your domain, then run `python security/set-domain.py <that domain>`. It fills the placeholders and writes `docs/CNAME`.
3. `python security/apply-security.py --check`, then commit and push. The live site is unchanged, because Pages still serves the root.
4. Settings > Pages > Folder: change `/ (root)` to `/docs`, Save. Wait for the build, then check the live site.
5. Second commit: delete the old flat files from the repo root (`index.html`, `script.js`, `styles.css`, `404.html`, `robots.txt`, `sitemap.xml`, the images, the old `CNAME`, and any stray `mnt` folder). Push.

## 0. Before the first commit
1. Pick the exact host visitors and Google should see: `example.com` or `www.example.com`. If the apex is already used by another site, use a subdomain such as `portfolio.example.com`.
2. From the repo root run:
   `python security/set-domain.py example.com`
   It replaces the placeholder in `docs/index.html`, `docs/sitemap.xml` and `docs/robots.txt` and writes `docs/CNAME`.
3. Optional: put your photo at `docs/profile.jpg` (portrait, about 800x1000). Until then the frame shows a silhouette.
4. `python security/apply-security.py --check` should say "in sync".
5. Preview: `cd docs`, then `python -m http.server 8000`, open http://localhost:8000. Click through the modals, the form and the 404 page (http://localhost:8000/nope does not show it locally; open `404.html` directly).

## 1. GitHub
GitHub Pages on a free account needs a **public** repository.
```
git init -b main
git add .
git commit -m "Initial site"
git remote add origin https://github.com/<user>/cyberfolio.git
git push -u origin main
```
(Create the empty `cyberfolio` repo on github.com first, with no README. Sign in with a personal access token or SSH key.)

## 2. Turn on Pages
Repo > Settings > Pages > Build and deployment: Source **Deploy from a branch**, Branch **main**, folder **/docs**, Save.
Under Custom domain enter `example.com`, Save. The first build takes a minute or two.

The project address `https://<user>.github.io/cyberfolio/` will show the site but not style the 404 page (it uses root paths). That is expected until the custom domain works.

## 3. Verify the domain (stops takeover)
Settings (your profile, not the repo) > Pages > Add a domain. GitHub gives you a TXT record name and value. Add it at GoDaddy (step 4), then click Verify.

## 4. GoDaddy DNS
GoDaddy > My Products > Domain > DNS. Delete any default parked or forwarding records for the same host, then add:

| Type | Name | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | `<user>.github.io` |
| TXT | (the name GitHub shows) | (the value GitHub shows) |

Check these addresses against GitHub's "Managing a custom domain" page, since GitHub owns that list.
If you chose a subdomain, add one CNAME for it pointing to `<user>.github.io` instead of the A records.
DNS usually settles in minutes, occasionally hours.

## 5. HTTPS
Back in Settings > Pages, wait for the green "DNS check successful", then tick **Enforce HTTPS** (the certificate can take up to an hour).

## 6. Smoke test on the live domain
- Home page loads; the hero name sweeps in; both modals open; contact form shows success.
- `https://example.com/nope` shows the 404 page, styled.
- View source: the Open Graph tags show `https://example.com/...`.
- `curl -I https://example.com` (no custom headers yet; that is expected).

## 7. Add Cloudflare (optional but planned)
Follow `cloudflare/README.md`. Keep the DNS records grey (DNS only) until the site works through Cloudflare's nameservers, then switch them to proxied.

## 8. After launch
- Google Search Console: add a Domain property (DNS TXT), submit `https://example.com/sitemap.xml`, inspect the home page.
- LinkedIn Post Inspector and Facebook Sharing Debugger: paste the URL to refresh the preview.
- Google Rich Results Test: confirm the ProfilePage markup.

## Updating the site later
Edit files in `docs/`, run `python security/apply-security.py --check`, then `git add . && git commit -m "..." && git push`. It is live in a minute or two (plus up to 10 minutes of caching).

## If something goes wrong
- Blank card rows or a missing font: open the browser console and look for `Refused to ...` (see `security/README.md`).
- Certificate or "Enforce HTTPS" greyed out: DNS has not settled, or an old record conflicts. Recheck step 4.
- After adding Cloudflare, redirect loops: SSL mode must be **Full (strict)**.
