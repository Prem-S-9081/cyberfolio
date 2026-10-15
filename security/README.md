# Security policy: how it works

- `security/csp.txt` is the single source of truth for the Content Security Policy.
- `python security/apply-security.py` writes it into the `<meta>` tags of `docs/index.html` and `docs/404.html` and regenerates `cloudflare/response-headers.txt`.
  `--check` exits 1 if anything is out of date (handy before a commit).
- GitHub Pages cannot set headers, so the meta tags are the baseline. Cloudflare adds the real headers (see `cloudflare/README.md`).

## When something stops loading
Open the browser console. A blocked item says `Refused to load ... because it violates ... directive`. Add only that host to that directive in `csp.txt`, run the tool, redeploy.

| New thing | Directive to touch |
|---|---|
| Analytics or other script | `script-src` (and `connect-src` if it sends data) |
| Images from another site | `img-src` |
| Embedded video or iframe | `frame-src` (add it; the default is blocked) |
| Another API your JS calls | `connect-src` |

## Rules for writing code
- No inline handlers (`onclick=`), no inline `<script>` or `<style>`, no `style="..."` attributes, no `eval`.
- Buttons use `data-modal-open="id"`, `data-modal-close="id"` and `data-scroll-row="rowId" data-scroll-dir="1|-1"`, wired once in `script.js`.
- Setting `element.style.x` from JavaScript is fine.
- JSON-LD in `<head>` is data, not script, so it is allowed.

## Fonts
Inter is self-hosted in `fonts/` (variable, Latin subset) under the SIL Open Font License (`fonts/OFL-LICENSE.txt`).

## Contact details
The email address and phone number are not in the HTML. They live in pieces at the top of the "CONTACT BUTTONS" block in `docs/script.js` (`PIECES`) and are assembled only when someone hovers, focuses or taps a contact button. Edit them there. Anything that runs JavaScript and interacts can still read them, so this stops page-source scrapers, not determined ones.
