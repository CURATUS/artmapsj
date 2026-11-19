# ArtMapSJ

An interactive map of public art in San José: art boxes now, with murals, public art, and galleries & museums to come.
Built with [Astro](https://astro.build) and served by Cloudflare. Live at **https://artmapsj.com**.

## Adding or editing artwork

Each artwork is one small file in `src/content/artworks/<category>/`. The folder is the category:

| Folder | Category |
|---|---|
| `artboxes/` | Art Box |
| `murals/` | Mural |
| `public-art/` | Public Art |
| `galleries/` | Gallery / Museum |

To add one on github.com: open the folder → **Add file → Create new file** → name it like `park-ave-race-st.md`
(lowercase, hyphens). Every commit rebuilds the site automatically in about a minute.

```yaml
---
title: "Park Ave & Race St"          # Art boxes use the location as the title
artist: "Suhita Shirodkar"
sponsor: "Hanchett Park Heritage Project"
description: "Historic pillars ... with native wildlife."
lat: 37.326014
lng: -121.911581
district: 6                           # optional, San José council district 1–10
neighborhood: "Hanchett Park"         # optional
featured:                             # optional, the main photo shown in the popup
  src: ./park-ave-race-st.jpg         # upload the photo into the same folder
  alt: "Art box painted with native birds"
  credit:
    name: "Jane Doe"
    instagram: "janedoe"              # no @
    url: "https://..."                # optional link for the name (e.g. Flickr page)
photos:                               # optional, extra photos for the artwork's page
  - src: ./park-ave-race-st-2.jpg
    credit:
      name: "Jane Doe"
---
```

- **Photos:** upload the full-size original (JPG or PNG) next to the `.md` file. The build makes small, fast versions
  automatically and strips hidden data such as GPS location. No need to resize first.
- **Permission pending:** add `permissionPending: true` to a photo we don't have the photographer's OK for yet.
  It shows on preview builds (any branch except `main`) and is hidden on the live site automatically. Delete the line
  once permission comes in. The build log prints how many pending photos were shown or hidden.
- **Removed or destroyed art:** add `status: removed`. It disappears from the map, but its page stays up, marked
  "No longer on view".
- **Mistakes are caught for you:** a missing title, coordinates outside San José, a bad Instagram handle, a photo path
  that doesn't exist, or a file in an unknown folder will stop the build with a message saying what's wrong. The live
  site stays on the last good version until it's fixed.
- **New category:** add it to `src/data/categories.ts`, then create the folder.

## Pages

- `/`: the map (search, Near Me, category toggles, clustering)
- `/<category>/<slug>/`: one page per artwork (photo, gallery, credits, mini map)
- `/photos-needed/`: every artwork still missing a photo

## Running locally

Requires Node 20+.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```

Map tiles show an "API key required" watermark locally because the CARTO key only allows the live domains. That's
expected.

## Deploying (Cloudflare)

Connect this repo in the Cloudflare dashboard (Workers & Pages → Create → Import a repository):

- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy` (Workers, uses `wrangler.jsonc`), *or* for a Pages project the
  **build output directory** is `dist`

After connecting, add the preview domain (`*.workers.dev` or `*.pages.dev`) to the CARTO API key's allowed referrers,
or the map tiles will be watermarked on previews.

## Notes

- The CARTO basemap key lives in `src/data/site.ts`. It's restricted by referrer in the CARTO dashboard.
- `CNAME` is only used by GitHub Pages and can be deleted once the site is served from Cloudflare.

© ArtMapSJ. All rights reserved. No license is granted to reuse the code, data, or images.
