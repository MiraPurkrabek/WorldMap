/* MapLibre + geographic relief. No analytics, geolocation, accounts or backend. */
(function () {
  'use strict';
  const status = document.getElementById('status');
  const say = message => { status.textContent = message; status.hidden = !message; };
  if (!window.maplibregl) {
    say('This map needs WebGL. Open it in a current browser with graphics acceleration enabled.');
    return;
  }

  let places;
  try { places = WorldMapUtils.mergeVisits(window.WORLD_MAP_DATA); }
  catch (error) { console.error(error); say(error.message); return; }
  const geo = window.WORLD_MAP_GEOGRAPHY;
  if (!geo) { say('The geographic map data could not load. Please reload.'); return; }
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const controls = Object.fromEntries(['zoom-in', 'zoom-out', 'compass', 'tilt', 'projection', 'overview'].map(id => [id, document.getElementById(id)]));
  let globeMode = false;
  const tileBase = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8';
  const rasterPaint = {
    'raster-saturation': -0.28,
    'raster-contrast': -0.1,
    'raster-brightness-min': 0.14,
    'raster-brightness-max': 1,
    'raster-fade-duration': reducedMotion ? 0 : 180
  };
  const minZoom = () => globeMode ? -1.5 : Math.max(-2, Math.log2(Math.max(160, window.innerWidth - 130) / 512));
  const globeZoom = () => Math.max(-1, Math.log2(Math.min(window.innerWidth, window.innerHeight) / 390) + 0.5);
  const style = {
    version: 8,
    projection: { type: 'mercator' },
    glyphs: new URL('./vendor/fonts/{fontstack}/{range}.pbf', location.href).href.replaceAll('%7B', '{').replaceAll('%7D', '}'),
    sources: {
      overview: { type: 'raster', tiles: [new URL('./data/overview/{z}/{x}/{y}.jpg', location.href).href.replaceAll('%7B', '{').replaceAll('%7D', '}')], tileSize: 512, minzoom: 0, maxzoom: 2 },
      relief: {
        type: 'raster', tiles: [tileBase + '/{z}/{y}/{x}.jpeg'], tileSize: 256,
        minzoom: 0, maxzoom: 8,
        attribution: '<a href="https://earthdata.nasa.gov/gibs" target="_blank" rel="noopener noreferrer">NASA GIBS</a> · <a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth</a> · <a href="https://www.geonames.org/" target="_blank" rel="noopener noreferrer">GeoNames</a>'
      },
      borders: { type: 'geojson', data: geo.borders },
      rivers: { type: 'geojson', data: geo.rivers },
      countries: { type: 'geojson', data: geo.countries },
      capitals: { type: 'geojson', data: geo.capitals }
    },
    layers: [
      { id: 'ocean', type: 'background', paint: { 'background-color': '#315478' } },
      { id: 'overview', type: 'raster', source: 'overview', paint: rasterPaint },
      { id: 'relief', type: 'raster', source: 'relief', paint: rasterPaint },
      { id: 'rivers', type: 'line', source: 'rivers', minzoom: 4, paint: {
        'line-color': '#9bc5d6', 'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.3, 7, 0.65],
        'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.45, 8, 1.1]
      } },
      { id: 'borders-shadow', type: 'line', source: 'borders', paint: {
        'line-color': '#102a30', 'line-width': ['interpolate', ['linear'], ['zoom'], 0, 1.9, 6, 2.5], 'line-opacity': 0.85
      } },
      { id: 'borders', type: 'line', source: 'borders', paint: {
        'line-color': '#fff9e8', 'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.85, 5, 1.05, 8, 1.2],
        'line-opacity': 0.92
      } },
      { id: 'country-labels', type: 'symbol', source: 'countries', minzoom: 3.5,
        filter: ['<=', ['get', 'minzoom'], 2.6],
        layout: { 'text-field': ['upcase', ['get', 'name']], 'text-font': ['Open Sans Semibold'], 'text-size': ['interpolate', ['linear'], ['zoom'], 2, 11, 6, 14], 'text-letter-spacing': 0.15, 'text-max-width': 8, 'text-padding': 16, 'symbol-sort-key': ['get', 'rank'] },
        paint: { 'text-color': '#f6f3df', 'text-halo-color': '#293f40', 'text-halo-width': 1, 'text-halo-blur': 1.3, 'text-opacity': 0.84 }
      },
      { id: 'capital-points', type: 'circle', source: 'capitals', minzoom: 3.5,
        paint: { 'circle-radius': 2.6, 'circle-color': '#fff9e8', 'circle-stroke-color': '#112c34', 'circle-stroke-width': 1.3 }
      },
      { id: 'capital-labels', type: 'symbol', source: 'capitals', minzoom: 3.5,
        layout: { 'text-field': ['get', 'name'], 'text-font': ['Open Sans Semibold'], 'text-size': 12, 'text-padding': 10, 'text-anchor': 'left', 'text-offset': [0.65, 0], 'symbol-sort-key': ['-', ['get', 'population']] },
        paint: { 'text-color': '#fff8e7', 'text-halo-color': '#263b39', 'text-halo-width': 1.4, 'text-halo-blur': 1 }
      }
    ]
  };

  let map;
  try {
    map = new maplibregl.Map({
      container: 'map', style, center: [12, 30], zoom: Math.max(1.6, minZoom() + 0.1),
      minZoom: minZoom(), maxZoom: 8, maxPitch: 55,
      renderWorldCopies: true, attributionControl: false,
      dragRotate: true, touchZoomRotate: true, touchPitch: true,
      pitchWithRotate: true, keyboard: true,
      canvasContextAttributes: { antialias: true },
      transformRequest: (url, type) => {
        if (type === 'Glyphs' && window.WORLD_MAP_ASSETS?.glyphs) return { url: window.WORLD_MAP_ASSETS.glyphs };
        const tile = url.match(/\/data\/overview\/(\d+\/\d+\/\d+)\.jpg/);
        return { url: tile && window.WORLD_MAP_ASSETS?.overviewTiles?.[tile[1]] || url };
      },
      maxTileCacheSize: 150, fadeDuration: reducedMotion ? 0 : 180
    });
  } catch (error) { console.error(error); say('The map could not start. Try reloading or opening it in another browser.'); return; }
  map.addControl(new maplibregl.AttributionControl({ compact: false }), 'bottom-right');
  map.addControl(new maplibregl.ScaleControl({ maxWidth: 95, unit: 'metric' }), 'bottom-left');

  const markers = new Map();
  let popup = null;
  let popupButton = null;
  let updateQueued = false;
  let failedTiles = false;
  const duration = () => reducedMotion ? 0 : 650;

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function popupContents(items) {
    const content = node('div', 'popup-scroll');
    items.forEach(place => {
      const card = node('section', 'place-card');
      card.append(node('h2', 'place-name', place.name));
      card.append(node('div', 'place-type', { city: 'City', country: 'Country', place: 'Place' }[place.type]));
      ['blue', 'red'].forEach(color => {
        if (!place[color].length) return;
        const row = node('div', 'visit-row');
        const dot = node('span', 'visit-color ' + color); dot.setAttribute('aria-hidden', 'true');
        row.append(dot, node('span', 'visit-person', color === 'blue' ? 'Blue' : 'Red'));
        const dates = node('div', 'visit-dates');
        place[color].forEach(date => {
          const time = node(typeof date === 'string' ? 'time' : 'span', 'visit-date', WorldMapUtils.formatDate(date));
          if (typeof date === 'string') time.dateTime = date;
          dates.append(time);
        });
        row.append(dates); card.append(row);
      });
      content.append(card);
    });
    return content;
  }

  function openPopup(items, lngLat, button) {
    if (popup) popup.remove();
    popupButton = button;
    button.setAttribute('aria-expanded', 'true');
    const activePopup = new maplibregl.Popup({ closeButton: true, closeOnClick: true, maxWidth: '290px', offset: 15, focusAfterOpen: true })
      .setLngLat(lngLat).setDOMContent(popupContents(items)).addTo(map);
    popup = activePopup;
    activePopup.getElement().setAttribute('role', 'dialog');
    activePopup.getElement().setAttribute('aria-label', items.length === 1 ? items[0].name + ' visits' : 'Visits to nearby places');
    activePopup.on('close', () => {
      button.setAttribute('aria-expanded', 'false');
      if (popup === activePopup) popup = null;
    });
  }

  function updateMarkers() {
    updateQueued = false;
    const width = map.getContainer().clientWidth;
    const height = map.getContainer().clientHeight;
    const center = map.getCenter().lng;
    const projected = places.filter(place => !map.transform.isLocationOccluded(new maplibregl.LngLat(...place.coordinates))).map(place => {
      const coordinates = [WorldMapUtils.nearestLongitude(place.coordinates[0], center), place.coordinates[1]];
      const point = map.project(coordinates);
      return { place, coordinates, x: point.x, y: point.y };
    }).filter(p => p.x > -50 && p.x < width + 50 && p.y > -50 && p.y < height + 50);
    const groups = WorldMapUtils.groupNearby(projected, 42);
    const keep = new Set();
    groups.forEach(group => {
      const key = group.map(p => p.place.id).sort().join('|');
      keep.add(key);
      const lngLat = group.length === 1 ? group[0].coordinates : map.unproject([
        group.reduce((a, p) => a + p.x, 0) / group.length,
        group.reduce((a, p) => a + p.y, 0) / group.length
      ]);
      if (markers.has(key)) { markers.get(key).marker.setLngLat(lngLat); return; }
      const button = node('button', 'pin ' + (group.length > 1 ? 'cluster' : group[0].place.color));
      const label = group.length > 1 ? `${group.length} nearby places. Zoom in to explore.` :
        `${group[0].place.name}, ${group[0].place.color === 'shared' ? 'Blue and Red' : group[0].place.color === 'blue' ? 'Blue' : 'Red'}. Show visit dates.`;
      button.type = 'button'; button.title = label; button.setAttribute('aria-label', label);
      button.setAttribute('aria-expanded', 'false');
      const dot = node('span', 'dot', group.length > 1 ? String(group.length) : undefined);
      dot.setAttribute('aria-hidden', 'true'); button.append(dot);
      const marker = new maplibregl.Marker({ element: button, anchor: 'center', pitchAlignment: 'viewport', rotationAlignment: 'viewport', opacityWhenCovered: '0', subpixelPositioning: true }).setLngLat(lngLat).addTo(map);
      button.addEventListener('click', event => {
        event.stopPropagation();
        if (group.length > 1 && map.getZoom() < map.getMaxZoom() - 0.2) {
          const bounds = WorldMapUtils.visitBounds(group.map(p => p.place.coordinates), map.getCenter().lng);
          map.fitBounds(bounds, { padding: { top: 85, bottom: 85, left: 60, right: 75 }, maxZoom: Math.min(map.getZoom() + 2, map.getMaxZoom()), duration: duration() });
        } else {
          openPopup(group.map(p => p.place), marker.getLngLat(), button);
        }
      });
      markers.set(key, { marker, button });
    });
    for (const [key, entry] of markers) {
      if (!keep.has(key)) {
        if (popup && popupButton === entry.button) popup.remove();
        entry.marker.remove(); markers.delete(key);
      }
    }
  }

  function queueMarkers() {
    if (!updateQueued) { updateQueued = true; requestAnimationFrame(updateMarkers); }
  }

  function updateControls() {
    controls['zoom-in'].disabled = map.getZoom() >= map.getMaxZoom() - 0.01;
    controls['zoom-out'].disabled = map.getZoom() <= map.getMinZoom() + 0.01;
    controls.tilt.setAttribute('aria-pressed', String(map.getPitch() > 1));
    controls.projection.setAttribute('aria-pressed', String(globeMode));
    controls.projection.setAttribute('aria-label', globeMode ? 'Switch to flat map' : 'Switch to globe');
    controls.projection.title = globeMode ? 'Switch to flat map' : 'Switch to globe';
    document.getElementById('compass-arrow').style.transform = `rotate(${-map.getBearing()}deg)`;
  }

  controls['zoom-in'].addEventListener('click', () => map.zoomIn({ duration: reducedMotion ? 0 : 300 }));
  controls['zoom-out'].addEventListener('click', () => map.zoomOut({ duration: reducedMotion ? 0 : 300 }));
  controls.compass.addEventListener('click', () => map.easeTo({ bearing: 0, pitch: 0, duration: duration() }));
  controls.tilt.addEventListener('click', () => map.easeTo({ pitch: map.getPitch() > 1 ? 0 : 50, duration: duration() }));
  controls.projection.addEventListener('click', () => {
    if (popup) popup.remove();
    globeMode = !globeMode;
    map.setProjection({ type: globeMode ? 'globe' : 'mercator' });
    map.setMinZoom(minZoom());
    map.easeTo({ zoom: globeMode ? globeZoom() : Math.max(map.getZoom(), 1.6), pitch: 0, bearing: 0, duration: duration() });
    document.body.classList.toggle('globe-mode', globeMode);
    updateControls(); queueMarkers();
  });
  controls.overview.addEventListener('click', () => {
    if (popup) popup.remove();
    if (globeMode) { map.easeTo({ zoom: globeZoom(), bearing: 0, pitch: 0, duration: duration() }); return; }
    const bounds = WorldMapUtils.visitBounds(places.map(place => place.coordinates), map.getCenter().lng);
    if (bounds) map.fitBounds(bounds, { padding: { top: 70, bottom: 65, left: 45, right: 75 }, maxZoom: places.length === 1 ? 5 : 3, bearing: 0, pitch: 0, duration: duration() });
    else map.easeTo({ center: [12, 30], zoom: Math.max(1.6, minZoom()), bearing: 0, pitch: 0, duration: duration() });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && popup) {
      popup.remove();
      if (popupButton?.isConnected) popupButton.focus();
    }
  });
  window.addEventListener('resize', () => { map.setMinZoom(minZoom()); map.resize(); queueMarkers(); });
  window.addEventListener('offline', () => say('You are offline. The overview is still available; detailed tiles need a connection.'));
  window.addEventListener('online', () => { say(''); if (failedTiles) { map.getSource('relief')?.setTiles([tileBase + '/{z}/{y}/{x}.jpeg']); failedTiles = false; } });
  const updateLabels = () => {
    if (!map.getLayer('country-labels')) return;
    map.setFilter('country-labels', ['<=', ['get', 'minzoom'], map.getZoom() + 0.8]);
  };
  map.on('load', () => { updateMarkers(); updateControls(); updateLabels(); });
  map.on('zoomend', updateLabels);
  map.on('moveend', () => { queueMarkers(); updateControls(); });
  map.on('move', queueMarkers);
  map.on('projectiontransition', queueMarkers);
  map.on('rotate', updateControls);
  map.on('pitch', updateControls);
  map.on('error', event => {
    console.warn('Map resource:', event.error?.message || event);
    if (event.sourceId === 'relief') {
      failedTiles = true;
      say('Detailed tiles are unavailable. You can still explore the overview; reload to retry.');
    }
  });
  map.on('sourcedata', event => {
    if (event.sourceId === 'relief' && event.isSourceLoaded && !failedTiles && navigator.onLine) say('');
  });
  updateControls();
})();
