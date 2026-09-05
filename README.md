# WorldMap

A fullscreen physical world map with blue and red visit markers. Plain HTML,
CSS and JavaScript. No build step, API key, database or paid map account.
The user-supplied visits include 105 distinct places: 82 for Blue, 59 for Red,
with 36 shared. Demo entries have been removed. See DATA-NOTES.md for name
normalisation and date handling.

## Publish at MiraPurkrabek.github.io/WorldMap/

1. Create a GitHub repository named **WorldMap** in the MiraPurkrabek account.
2. Unzip `WorldMap.zip` and upload its contents to the repository root.
   `index.html`, `app.js`, `data/`, `vendor/` and `.nojekyll` must be at the root,
   not inside another WorldMap folder.
3. Open **Settings → Pages → Build and deployment**. Select **Deploy from a
   branch**, branch **main**, folder **/(root)**, and save.
4. Wait for GitHub's Pages deployment to finish. Open
   `https://MiraPurkrabek.github.io/WorldMap/`.

Nothing needs changing in the main personal-website repository. All application
asset paths are relative, so the same files also work under another repository
name. Do not add a space to the repository name. No custom domain or CNAME is needed.

GitHub's [Pages setup guide](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
explains repository visibility and plan requirements. GitHub Free requires a
public repository. A private source repository requires a supported paid plan;
the published Pages site can still be public.

## Edit the visits

Edit **data/places.js**. It contains a shared place catalogue, two individual lists, and an optional
`together` list that adds each visit to both colours:

```js
places: {
  prague: {
    name: "Prague",
    type: "city",                       // city, country, or place
    coordinates: [14.4378, 50.0755]      // LONGITUDE first, then LATITUDE
  }
},
blue: [{ place: "prague", date: "2026-05-12" }],
red:  [{ place: "prague", date: "2026-07-19" }]
```

- A place visited by both colours gets one exact half-blue, half-red marker.
  Sharing means the **same place ID**, even if the two dates differ.
- To record another visit, add another list entry with the same place ID and a
  different date. The popup shows all dates, newest first. Identical duplicates
  within one colour are removed.
- A country is a **point at the coordinates you choose**, not a coloured area.
  Visiting a city does not automatically mark its country. Give cities,
  countries and landmarks separate IDs.
- A place may be any named location, including a mountain or national park.
  Coordinates are explicit; there is no geocoding service or database to maintain.
- Dates accept `YYYY`, `YYYY-MM`, `YYYY-MM-DD`, `{ from, to }` ranges and
  `{ oneOf: [...] }` uncertain dates. Use `null` when no date is known. Exact dates
  display in UTC. No date precision is inferred. See DATA-NOTES.md for examples.
- Unused catalogue entries do not appear. Empty blue/red lists are supported.

On the source checkout used to create this draft, public files live in `dist/`.
The downloadable ZIP promotes those files to the root for direct GitHub Pages
deployment. That layout difference does not affect the application.

## Controls

| Action | Mouse / keyboard | Touch |
| --- | --- | --- |
| Move | Drag; arrow keys when map is focused | One-finger drag |
| Zoom | Wheel, +/− buttons, double-click, keyboard +/− | Pinch; +/− buttons; double-tap |
| Rotate | Right-button drag or Ctrl + drag | Twist with two fingers |
| Tilt | Right-button drag vertically; tilt button | Two-finger vertical drag; tilt button |
| Flatten / face north | Compass button | Compass button |
| Globe / flat map | Globe toggle | Globe toggle |
| Overview | Four-corners button | Four-corners button |
| Visit dates | Click a dot; Tab then Enter | Tap a dot |
| Close popup | Click elsewhere, × or Escape | Tap elsewhere or × |

The map opens on Europe and Africa. The globe toggle switches to a rotatable
sphere; dragging across the Pacific has no longitude edge. Flat mode also wraps
continuously. The overview button fits the visits in flat mode or pulls back to
the whole globe in globe mode. The hidden hemisphere never contributes invisible
pins to visible clusters.
Controls and pin targets are at least 44 × 44 CSS pixels. Nearby pins combine
into a **neutral numbered circle** to prevent overlapping touch targets.
Its number counts distinct places, not people. Tap it to zoom; at maximum zoom,
coincident locations open a combined popup so none become inaccessible.

The only always-visible text belongs to the map itself: geographic labels,
scale and map-source attribution. There are no headings, names, profile details,
navigation menus, analytics or geolocation requests. Keyboard focus, reduced
motion and phone safe areas are supported.

## Map quality and limits

- NASA Blue Marble shaded relief and bathymetry provide geographic colour,
  visible mountain ranges, vegetation and ocean-floor detail.
- The map loads higher-resolution public NASA GIBS tiles as you zoom. Its tile
  pyramid ends at level 8; this is a regional / mountain-range map, not a street
  map. Maximum interactive zoom is deliberately limited to 8.
- A bundled geographic overview, derived from the same 2048 × 2048 imagery,
  is served as 21 small tiles so it also wraps correctly around the globe.
  It remains available if NASA is offline and is coarser than live tiles.
- Natural Earth 1:50m supplies thin national boundaries, rivers and country names.
  A dark outline under a pale line keeps national borders visible across light
  and dark terrain. Country names and GeoNames national-capital dots / names appear
  from zoom 3.5; at smaller scales only borders are visible. Label collision
  handling avoids clutter. Boundaries are simplified cartography.
- Tilt and rotation are real camera interactions over relief imagery. The
  mountains are shaded imagery, not an extruded 3D elevation mesh.
- Flat mode uses Web Mercator, with polar distortion. Globe mode removes the
  longitude seam; the Mercator imagery at the extreme polar caps is approximate.
- WebGL and a modern browser are required. Detailed tiles need internet access.
- Mapy.com can be added later, but its API requires an account/key and prescribed
  attribution. This version avoids that setup.

Source links and licenses are in **SOURCES.md**. MapLibre is bundled at a pinned
version; the application does not fetch its code from a CDN at runtime.

## Public but unlisted

The HTML includes `noindex`, `nofollow`, `noarchive`, `nosnippet` and
`noimageindex` directives. Do not add this page to the main site's menu or sitemap
if you want to limit discovery.

**Unlisted is not access control.** Anyone who knows the URL can read the page
and download the full visit file. A public GitHub repository and its README / code
can also be found independently of these page directives. A private repository
reduces source discovery but cannot conceal data served by the public page.

Do **not** add `Disallow: /WorldMap/` to the main site's robots.txt: Google needs
to crawl the HTML to see `noindex`. A robots.txt inside this project path is not
the domain's controlling robots.txt. No robots.txt is needed for this setup.
See [Google's noindex documentation](https://developers.google.com/search/docs/crawling-indexing/block-indexing).
Search engines must cooperate; no setting guarantees zero discovery or low traffic.

There is no analytics or tracking code. NASA receives ordinary tile requests
(including the visitor's IP and requested map areas); the site host receives
ordinary file requests. The page sends no referrer. If you later want actual
privacy, use hosting with server-side authentication and keep visit data behind it;
a password embedded in client-side JavaScript is not protection.

## Local preview and validation

The separate **WorldMap-preview.html** embeds the code, geography, font and
overview in one file. Download it and open it in a WebGL-capable browser. It still
uses the internet for high-resolution tiles. Phone file viewers sometimes disable
JavaScript or WebGL; the live preview URL is more reliable on phones.

For the repository, use any local HTTP server, for example:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/`. Serving over HTTP avoids browsers' restrictions
on loading local font and image files. No Node installation is needed to run or
deploy the website. If Node is available, validate edited data with:

```sh
node scripts/check-data.cjs
```

This draft was checked for JavaScript syntax, data consistency, actual MapLibre
style validity and complete local assets. The native tile endpoint was checked.
Date precision, shared imports and date-line bounds also have automated checks.
It has not been visually tested on physical phones or tablets.
