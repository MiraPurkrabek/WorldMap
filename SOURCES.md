# Sources and third-party notices

## Map engine

- **MapLibre GL JS 5.6.2**, BSD 3-Clause.
  [Project](https://github.com/maplibre/maplibre-gl-js/tree/v5.6.2)
  [Documentation](https://maplibre.org/maplibre-gl-js/docs/)
- Distributed files: `vendor/maplibre-gl.js`, `vendor/maplibre-gl.css`.
  The complete bundled notice is in `vendor/LICENSE-maplibre.txt`.

## Geographic relief

- **NASA GIBS — BlueMarble_ShadedRelief_Bathymetry**.
  [GIBS API access](https://nasa-gibs.github.io/gibs-api-docs/access-basics/)
  [NASA Blue Marble](https://visibleearth.nasa.gov/collection/1484/blue-marble)
- Tile template:
  `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg`
- `data/world-relief.jpg` is a 2048 × 2048 global Web Mercator overview from the
  same layer, obtained through GIBS WMS. Its bounds are ±20037508.342789244 metres
  in EPSG:3857. No tile proxy or API key is required.
- NASA's public imagery is credited visibly on the map. This project does not
  imply NASA endorsement. Keep that credit when reusing the page.

## Boundaries, rivers and labels

- **Natural Earth**, public domain.
  [Terms of use](https://www.naturalearthdata.com/about/terms-of-use/)
  [Source data repository](https://github.com/nvkelso/natural-earth-vector)
- Inputs: `ne_50m_admin_0_boundary_lines_land`, `ne_50m_admin_0_countries`,
  `ne_50m_rivers_lake_centerlines`, `ne_50m_populated_places_simple`.
- `data/geography.js` strips unrelated properties, rounds line coordinates to
  four decimals and uses country label points instead of polygon fills. Labels
  use English / ASCII names. Empty line features are omitted.

## Map label font

- **Open Sans Semibold**, SIL Open Font License 1.1.
  [Font project and license](https://github.com/googlefonts/opensans)
- The 0–255 glyph range is bundled locally in `vendor/fonts/Open Sans Semibold/`.
  The font notice is in `vendor/LICENSE-OpenSans.txt`.

## Deployment and indexing

- [GitHub Pages setup](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [Google: blocking indexing with noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Mapy.com API key requirements](https://developer.mapy.com/rest-api-mapy-cz/api-key/)

Source endpoints and documentation checked on 5 September 2026. The basemap is
historical reference imagery, not a live satellite feed. Visit dates come from
the user and preserve their original precision.

## Capital and city coordinates

- **GeoNames**, Creative Commons Attribution 4.0.
  [Data source](https://download.geonames.org/export/dump/)
  [License and attribution](https://www.geonames.org/export/)
- 241 capital locations (feature code PPLC) were extracted from the cities1000
  gazetteer. City coordinates in the visit catalogue use the same source, with
  country and canonical-name matching. Coordinate source links are stored per city.
- Globe support uses MapLibre 5.6.2's native globe projection, raster tile meshes
  and marker hemisphere-occlusion handling.
  [Globe example](https://maplibre.org/maplibre-gl-js/docs/examples/display-a-globe-with-a-vector-map/)
- Bundled overview tiles at zoom levels 0–2 are generated from the existing
  NASA overview. Their geographic colours and projection are unchanged.
