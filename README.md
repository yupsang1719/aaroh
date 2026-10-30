# Aaroh

Website for **Aaroh Entertainment Limited**: original music and the films that go with it.
Live at **https://aaroh.co.uk**.

- [How it works](#how-it-works)
- [Run it locally](#run-it-locally)
- [Editing content](#editing-content)
  - [Adding a release](#adding-a-release)
- [Contact page and email](#contact-page-and-email)
- [Hosting on the VPS](#hosting-on-the-vps)
- [Pointing aaroh.co.uk at the site](#pointing-aarohcouk-at-the-site)
- [After going live](#after-going-live)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Changing the look](#changing-the-look)
- [Moving content to a CMS later](#moving-content-to-a-cms-later)
- [Troubleshooting](#troubleshooting)

## How it works

One Node.js server does everything in production:

- **Website**: React (Vite, TypeScript, Tailwind), built into `client/dist` and served by the
  server.
- **API**: Express (`/api/settings`, `/api/releases`, `/api/releases/:slug`,
  `POST /api/contact`, `/api/health`).
- **Content**: plain JSON files in `server/content/`, no database. Images live next to them in
  `server/content/media/`.
- **Link previews and SEO**: for every page the server writes the real title, description,
  share image, canonical URL and structured data into the HTML, so links shared on social media
  and messaging apps preview properly. It also serves `sitemap.xml` and `robots.txt`.
- **Contact**: email only for now (`rlp@aaroh.co.uk`), with a copy button and topic links that
  prefill the subject. A contact form is built in and can be switched on later; its messages are
  emailed and nothing is stored on the server.

```
client/   React website (pages, components, Tailwind theme)
server/   Express server, content files, tests
  content/          live content: settings.json, releases.json, media/
  content-sample/   sample content with two releases, for previewing the design
shared/   types, validation schemas and SEO helpers used by both sides
```

## Run it locally

Requires **Node.js 22.9 or newer** (`nvm use` picks up `.nvmrc`).

```bash
npm install
npm run dev
```

Open http://localhost:5173. This starts the API server (port 4000) and the website (port 5173)
together. Always run it from the repository root: running `npm run dev` inside `client/` starts
the website without the API.

- Edits to code reload automatically. Edits to `server/content/*.json` show up on the next page
  load.
- Contact form messages are printed in the terminal (no email is sent unless SMTP is set up in
  `server/.env`).
- **Preview the release pages:** there are no releases yet, so use the sample content:
  `npm run dev:sample`. Sample content is full of PLACEHOLDER text and can never be used in
  production.

Optional local settings: copy `server/.env.example` to `server/.env`.

## Editing content

All content is in `server/content/`:

| File            | What it holds                                                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings.json` | Tagline, home hero, About text, team, Process steps, contact email, social links, the note shown on Work before the first release, and the company's legal details. |
| `releases.json` | The releases, newest first by `order`. `[]` until the first release.                                                                                                |
| `media/`        | Images (and an optional hero video). Reference a file as `/media/<file name>`.                                                                                      |

Keys starting with `_` (like `_comment`) are notes for editors and are ignored by the site.

After editing, check the content:

```bash
npm run check:content
```

It validates both files, checks that every `/media/...` file exists and lists any value that
still contains `PLACEHOLDER`. **The production server refuses to start while any PLACEHOLDER is
left**, so placeholder text can never go live by accident.

To publish a change: commit and push to `main` (GitHub runs the checks), then deploy it to the
server (see [Deploying an update](#deploying-an-update)). Content is read once at start-up in
production, so changes appear after the deploy.

Good to know:

- **Home hero:** with no `hero.collageImages` the home page shows the wordmark on its own. Add
  3 to 6 images (stills, behind-the-scenes photos) for the collage, each
  `{ "url": "/media/….jpg", "alt": "what the image shows" }`. Or set `hero.mode` to `"video"`
  with `videoUrl` (a short, muted MP4 in `media/`) and `posterUrl`.
- **Team:** add `{ "name": "…", "role": "…", "photoUrl": "/media/….jpg" }` entries to show the
  team on About. Empty hides the section.
- **Socials:** full profile URLs for `instagram`, `youtube`, `tiktok`, `spotify`. Empty ones are
  hidden.
- **Legal details** (`legal`): the registered name, number and office as at
  [Companies House](https://find-and-update.company-information.service.gov.uk/company/17498033).
  UK law requires them on the website; they appear in every page footer and on `/legal`. If the
  registered office changes, update `registeredOffice` (one line per address line). Add
  `vatNumber` and `icoRegistrationNumber` if and when you have them. `privacyUpdated` is the
  date shown on the privacy notice; change it whenever you change how personal data is handled.
- **Images:** export JPEGs at the size they are shown, roughly 1600 px wide for covers and
  16:9 stills, 1200 px for portrait photos, quality about 75 (usually 150 to 400 KB). Large
  originals slow the site down on phones.

### Adding a release

1. **Images.** Put the cover (a 16:9 still from the video) and any stills in
   `server/content/media/`, named after the release, for example `first-light-cover.jpg`,
   `first-light-still-1.jpg`.
2. **Add the release** to `server/content/releases.json` (it is a list; keep the `[` `]`):

   ```json
   [
     {
       "title": "First Light",
       "slug": "first-light",
       "artist": "Artist Name",
       "releaseDate": "2026-12-04",
       "summary": "One or two sentences shown on Work, in link previews and search results.",
       "story": "The story of the release.\n\nA blank line (\\n\\n) starts a new paragraph.",
       "youtubeId": "aqz-KE-bpKQ",
       "streamingLinks": {
         "spotify": "https://open.spotify.com/track/…",
         "appleMusic": "https://music.apple.com/…",
         "youtubeMusic": "https://music.youtube.com/watch?v=…",
         "other": [{ "label": "Bandcamp", "url": "https://….bandcamp.com/track/…" }]
       },
       "coverImage": {
         "url": "/media/first-light-cover.jpg",
         "alt": "Still from the First Light video: …"
       },
       "stills": [
         {
           "url": "/media/first-light-still-1.jpg",
           "alt": "What the image shows",
           "caption": "Optional caption"
         }
       ],
       "credits": [
         { "role": "Artist", "name": "…" },
         { "role": "Producer", "name": "…" },
         { "role": "Director", "name": "…" },
         { "role": "Director of Photography", "name": "…" },
         { "role": "Editor", "name": "…" }
       ],
       "featured": true,
       "published": true,
       "order": 1
     }
   ]
   ```

   | Field            | Notes                                                                                                                                 |
   | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
   | `slug`           | The page address: `aaroh.co.uk/work/first-light`. Lowercase words and hyphens. Do not change it after release, or shared links break. |
   | `releaseDate`    | `YYYY-MM-DD`. Shown as "4 December 2026".                                                                                             |
   | `youtubeId`      | The 11 characters after `v=` in the YouTube URL. The video only loads when someone presses play.                                      |
   | `streamingLinks` | Only the services you fill in are shown.                                                                                              |
   | `featured`       | The release shown on the home page. If none is featured, the newest is shown.                                                         |
   | `published`      | `false` hides it everywhere (useful to prepare a release in advance).                                                                 |
   | `order`          | Lower comes first on Work. Use 1 for the newest and renumber older ones, or give each new release a lower number.                     |

3. **Check and preview:** `npm run check:content`, then `npm run dev` and open
   http://localhost:5173/work.
4. **Publish:** commit and push. As soon as there is a release, the home page shows it, Work
   lists it, and it is added to the sitemap automatically.

## Contact page and email

**The contact form is switched off.** The Contact page shows `contactEmail` from
`settings.json` (`rlp@aaroh.co.uk`) in large type, an **Email us** button, a **Copy address**
button (for visitors whose computer has no email app set up) and topic links (General,
Collaborations, Press, Licensing) that open an email with the subject filled in. No email
sending needs to be configured while the form is off.

### Turning the contact form on

1. Set up email sending (below) and add the SMTP variables on the host.
2. In `server/content/settings.json` set `"contactFormEnabled": true`, and set
   `legal.formDeliveryProvider` to the sending service (e.g. `"Resend"`) so the privacy notice
   names it. The privacy notice and Contact page switch to the form wording automatically.
3. Push. With the form on, the production server refuses to start without the SMTP settings, so
   form messages are never silently lost.

### Email sending for the form

Form messages are sent by SMTP to `CONTACT_NOTIFY_TO` (`rlp@aaroh.co.uk`).

**Use [Resend](https://resend.com), not Microsoft 365, to send them.** Your mailbox is on
Microsoft 365, but Microsoft has switched off SMTP sending with a password for tenants that were
not already using it and is retiring it altogether. A sending service is the reliable option.
Your inbox stays on Microsoft 365; Resend only delivers the form messages to it.

1. Create a Resend account and **add the domain `aaroh.co.uk`**. Choose the **EU (Ireland)**
   region.
2. Resend shows a few DNS records (a DKIM `TXT` record such as `resend._domainkey`, and an `MX`
   and `TXT` record on the `send` subdomain). Add them **exactly as shown** in GoDaddy
   (_My Products › aaroh.co.uk › DNS › Add New Record_). They sit on their own names, so they do
   not affect your Microsoft 365 email. Wait for Resend to show the domain as verified.
3. Create an **API key** with sending access.
4. Add these settings to `/etc/aaroh/aaroh.env` on the server, then `systemctl restart aaroh`:

   ```
   SMTP_HOST=smtp.resend.com
   SMTP_PORT=587
   SMTP_USER=resend
   SMTP_PASS=<the Resend API key>
   SMTP_FROM=Aaroh website <website@aaroh.co.uk>
   CONTACT_NOTIFY_TO=rlp@aaroh.co.uk
   ```

5. **Test it:** `npm run email:test` (locally with these values in `server/.env`, or on the
   server: `cd /var/www/aaroh && set -a && . /etc/aaroh/aaroh.env && set +a && sudo -E -u aaroh -H npm run email:test`). It sends one message exactly as the form does. Check the
   junk folder the first time and mark it as safe.

Recommended once email works: add a DMARC record in GoDaddy, `TXT` named `_dmarc` with value
`v=DMARC1; p=none; rua=mailto:rlp@aaroh.co.uk`, so receiving servers can check mail claiming to
be from aaroh.co.uk.

## Hosting on the VPS

The site runs on the company VPS (Contabo, Ubuntu 24.04, `161.97.166.20`) next to the other
sites there, without touching them:

| What       | Where                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------- |
| Code       | `/var/www/aaroh`, owned by the `aaroh` system user (no password, no login)                               |
| Settings   | `/etc/aaroh/aaroh.env` (template: `deploy/aaroh.env.example`)                                            |
| Process    | systemd service `aaroh` (`deploy/aaroh.service`), running as `aaroh`, listening on `127.0.0.1:4100` only |
| Web server | nginx site `/etc/nginx/sites-available/aaroh` (`deploy/nginx-aaroh.conf`), HTTPS by certbot              |

### Deploying an update

Push to `main` (CI checks it), then:

```bash
ssh root@161.97.166.20 /var/www/aaroh/deploy/deploy.sh
```

It pulls `main`, installs dependencies, checks the content, builds, restarts the service and
waits for `/api/health`. If the new version does not start it prints the recent logs. The
check stops the deploy before anything is replaced if the content is invalid or still has
PLACEHOLDER values.

### Day-to-day commands (on the server)

```bash
systemctl status aaroh              # is it running?
journalctl -u aaroh -f              # live logs
journalctl -u aaroh -n 100          # recent logs
systemctl restart aaroh             # restart (e.g. after editing /etc/aaroh/aaroh.env)
```

### Setting up a new server

`deploy/setup-server.sh` does the one-time setup on an Ubuntu server with Node.js 22.9+, nginx and
certbot installed: creates the `aaroh` user, clones the repository to `/var/www/aaroh`, installs
the settings file, the systemd service and the nginx site, and builds and starts the app. It then
prints the remaining steps: enable the nginx site, point DNS, and run certbot. Copy it to the
server and run it as root.

Another host works too: build with `npm ci --include=dev && npm run build`, start with
`npm start`, health check `/api/health`, and set the variables from `deploy/aaroh.env.example`.

## Pointing aaroh.co.uk at the site

The domain is registered and managed at **GoDaddy**; email is on **Microsoft 365**. Only the
website records change. **Do not touch the `MX` record, the `TXT` records (SPF and Microsoft
verification) or the `autodiscover` and other Microsoft records**, or email will stop working.

1. In GoDaddy, open _My Products › aaroh.co.uk › DNS_:
   - Turn off any **Forwarding** set up for the domain.
   - **`A` record, name `@`:** change it to **`161.97.166.20`**. Delete any other `A` records for
     `@` (GoDaddy's parking addresses `3.33.130.190` and `15.197.148.33`) and any **`AAAA`**
     records for `@` or `www`.
   - **`www`:** change the existing `CNAME` (which points to `@`) into an **`A` record** with value
     **`161.97.166.20`**, or leave the `CNAME` pointing to `@`; both work.
2. Wait until `dig +short aaroh.co.uk` and `dig +short www.aaroh.co.uk` both return
   `161.97.166.20` (usually minutes, at most 48 hours).
3. **HTTPS**, on the server as root:

   ```bash
   certbot --nginx -d aaroh.co.uk -d www.aaroh.co.uk --redirect
   ```

   Certbot issues the certificate, adds HTTPS to the nginx site, redirects http to https and
   renews automatically (like the other sites on the server). `www.aaroh.co.uk` then redirects
   to `https://aaroh.co.uk` (the app does this).

## After going live

- [ ] On the live Contact page, check **Email us** opens a new email to `rlp@aaroh.co.uk` and
      send yourself a test from another address.
- [ ] Check a link preview: paste https://aaroh.co.uk into a WhatsApp or iMessage chat, or use
      the [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/).
- [ ] Add the site to [Google Search Console](https://search.google.com/search-console)
      (domain property; verify with a `TXT` record in GoDaddy) and submit
      `https://aaroh.co.uk/sitemap.xml`.
- [ ] Pay the [ICO data protection fee](https://ico.org.uk/for-organisations/data-protection-fee/)
      if it applies to the company, then add the number as `legal.icoRegistrationNumber`.
- [ ] Have the privacy notice (`/privacy`) reviewed. It describes exactly what the site does
      today; update it (and `legal.privacyUpdated`) if you add analytics, a newsletter, a shop
      or a service like Cloudflare.

## Environment variables

Server (`server/.env` locally, the host's settings in production). See `server/.env.example`.

| Variable                                            | Default                               | Notes                                                                                                  |
| --------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `HOST`                                              | all interfaces                        | `127.0.0.1` on the VPS, so only nginx can reach the app.                                               |
| `NODE_ENV`                                          | `development`                         | `production` on the host.                                                                              |
| `PORT`                                              | `4000`                                | `4100` on the VPS (see `deploy/aaroh.env.example`).                                                    |
| `SITE_URL`                                          | `https://aaroh.co.uk`                 | Used for canonical URLs, share images, sitemap and structured data.                                    |
| `CONTENT_DIR`                                       | `server/content`                      | Content folder. `npm run dev:sample` points it at `server/content-sample`.                             |
| `TRUST_PROXY`                                       | `0`                                   | `1` behind nginx (the VPS) or a hosting proxy, so the contact form's rate limit sees real visitor IPs. |
| `CLIENT_ORIGIN`                                     | `http://localhost:5173`               | Browser origins allowed by CORS (comma-separated). Only matters in development.                        |
| `CLIENT_DIST_DIR`                                   | `client/dist`                         | Built website location in production. Rarely needs setting.                                            |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`  | `587` for the port                    | Contact form email. Required in production only while the contact form is on.                          |
| `SMTP_FROM`                                         | `Aaroh website <website@aaroh.co.uk>` | Sender. Must be allowed by the SMTP service.                                                           |
| `CONTACT_NOTIFY_TO`                                 | `rlp@aaroh.co.uk`                     | Inbox for contact form messages.                                                                       |
| `CONTACT_RATE_LIMIT`, `CONTACT_RATE_WINDOW_MINUTES` | `5`, `15`                             | Messages allowed per IP address per window.                                                            |

Website (`client/.env`, read at build time; see `client/.env.example`): `VITE_SITE_URL`
(default `https://aaroh.co.uk`; keep it the same as `SITE_URL`).

## Scripts

Run from the repository root.

| Command                                                 | What it does                                                                                                                                   |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                                           | API server and website with live reload (http://localhost:5173).                                                                               |
| `npm run dev:sample`                                    | The same, with the sample content (two releases) for previewing.                                                                               |
| `npm run check:content`                                 | Validates content, checks media files exist, lists PLACEHOLDERs. Add a folder to check another one: `npm run check:content -- content-sample`. |
| `npm run email:test`                                    | Sends one test contact message with the current SMTP settings.                                                                                 |
| `npm run build`                                         | Production build of the website and server.                                                                                                    |
| `npm start`                                             | Starts the production server (after `npm run build`).                                                                                          |
| `npm test`                                              | Server API tests (Vitest + Supertest) and client unit tests.                                                                                   |
| `npm run lint` / `npm run typecheck` / `npm run format` | Code quality.                                                                                                                                  |

## Changing the look

- **Colours, fonts and type sizes** are all in `client/tailwind.config.ts`.
- **Logo:** save it as `client/public/brand/logo.svg`; it replaces the "Aaroh" wordmark
  everywhere automatically on the next build. Draw it with a height that suits text: it is
  displayed 1em tall.
- **Favicon and share image:** replace `client/public/brand/favicon.svg`, `apple-touch-icon.png`
  (180×180), `icon-512.png` (512×512, used as the logo in search results) and
  `og-default.png` (1200×630, the share image for pages without their own).

## Moving content to a CMS later

The site never reads content files directly; everything goes through one interface,
`ContentProvider` (`server/src/content/ContentProvider.ts`), with three methods: `getSettings`,
`listReleases`, `getReleaseBySlug`. To use a headless CMS such as Sanity, Contentful or Strapi:

1. Write `server/src/content/SanityContentProvider.ts` implementing `ContentProvider`. Pass the
   CMS data through the helpers in `server/src/content/validate.ts`, so it is checked against the
   same schemas as the JSON files (`shared/src/content.ts`).
2. Add `'sanity'` to `CONTENT_SOURCE` in `server/src/config/env.ts` and a `case 'sanity'` in
   `server/src/content/index.ts`.
3. Set `CONTENT_SOURCE=sanity` (plus the CMS credentials) on the host.

The website keeps talking only to this server's API, so nothing in `client/` changes. For images
hosted by the CMS, return responsive image URLs from `imageSrcSet()` in
`client/src/lib/images.ts`.

## Troubleshooting

- **`http proxy error … ECONNREFUSED` when developing:** only the website is running. Stop it
  and run `npm run dev` from the repository root.
- **Production: `Refusing to start: content … still has PLACEHOLDER values`:** replace the listed
  values (`npm run check:content` shows them) and push.
- **Production: `Refusing to start: the contact form is enabled … SMTP_HOST … not set`:** set the
  SMTP variables on the host (see [Contact page and email](#contact-page-and-email)) or set
  `contactFormEnabled` back to `false`.
- **Contact form says "Your message could not be sent":** the email service rejected the message.
  `journalctl -u aaroh -n 50` on the server shows the reason; `npm run email:test` reproduces it. Usually the
  API key is wrong or the domain is not yet verified in Resend.
- **Link preview shows old information:** social networks cache previews. Use the
  [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) or the
  [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) to refresh them.
