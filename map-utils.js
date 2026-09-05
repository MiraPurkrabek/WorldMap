(function (root) {
  'use strict';

  function validatePartialDate(value) {
    if (typeof value !== 'string' || !/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(value)) {
      throw new Error('Use YYYY, YYYY-MM or YYYY-MM-DD for a date.');
    }
    const full = value.length === 4 ? value + '-01-01' : value.length === 7 ? value + '-01' : value;
    const parsed = new Date(full + 'T00:00:00Z');
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== full) {
      throw new Error('Invalid date: ' + value);
    }
    return value;
  }

  function normalizeDate(value) {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value === 'string') return validatePartialDate(value);
    if (typeof value !== 'object') throw new Error('Invalid date.');
    if (Array.isArray(value.oneOf) && value.oneOf.length >= 2) {
      return { oneOf: [...new Set(value.oneOf.map(validatePartialDate))].sort() };
    }
    if (value.from && value.to) {
      const from = validatePartialDate(value.from), to = validatePartialDate(value.to);
      if (from > to) throw new Error('Date range starts after it ends.');
      return { from, to };
    }
    throw new Error('Use { from, to } for a date range, or { oneOf: [...] } for an uncertain date.');
  }

  function formatDate(value) {
    if (value === null) return 'Date not specified';
    if (typeof value === 'object') {
      if (value.oneOf) return value.oneOf.map(formatDate).join(' or ');
      if (value.from.length === 7 && value.to.length === 7 && value.from.slice(0, 4) === value.to.slice(0, 4)) {
        return formatDate(value.from).split(' ')[0] + '–' + formatDate(value.to);
      }
      return formatDate(value.from) + ' – ' + formatDate(value.to);
    }
    if (value.length === 4) return value;
    const full = value.length === 7 ? value + '-01' : value;
    return new Intl.DateTimeFormat('en-GB', { ...(value.length === 10 ? { day: 'numeric' } : {}), month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(full + 'T00:00:00Z'));
  }

  function dateKey(value) {
    if (value === null) return '';
    return typeof value === 'string' ? value : value.to || value.oneOf.at(-1);
  }

  function mergeVisits(data) {
    if (!data || !data.places || !Array.isArray(data.blue) || !Array.isArray(data.red) ||
        (data.together !== undefined && !Array.isArray(data.together))) {
      throw new Error('Define places, blue and red in data/places.js.');
    }
    const merged = new Map();
    for (const color of ['blue', 'red']) {
      for (const visit of [...data[color], ...(data.together || [])]) {
        const place = data.places[visit.place];
        if (!place) throw new Error(`Unknown place ID: ${visit.place}`);
        if (!place.name || !['city', 'country', 'place'].includes(place.type)) {
          throw new Error(`Invalid name or type for ${visit.place}`);
        }
        const c = place.coordinates;
        if (!Array.isArray(c) || c.length !== 2 || !c.every(Number.isFinite) ||
            Math.abs(c[0]) > 180 || Math.abs(c[1]) > 85.05112878) {
          throw new Error(`Invalid [longitude, latitude] for ${visit.place}`);
        }
        const date = normalizeDate(visit.date);
        if (!merged.has(visit.place)) {
          merged.set(visit.place, { id: visit.place, ...place, blue: [], red: [] });
        }
        const dates = merged.get(visit.place)[color];
        if (!dates.some(existing => JSON.stringify(existing) === JSON.stringify(date))) dates.push(date);
      }
    }
    return [...merged.values()].map(place => ({
      ...place,
      blue: place.blue.filter(d => d !== null || !place.blue.some(other => other !== null)).sort((a, b) => dateKey(b).localeCompare(dateKey(a))),
      red: place.red.filter(d => d !== null || !place.red.some(other => other !== null)).sort((a, b) => dateKey(b).localeCompare(dateKey(a))),
      color: place.blue.length && place.red.length ? 'shared' : place.blue.length ? 'blue' : 'red'
    }));
  }

  // Cluster only dots whose touch targets overlap. Cluster counts mean PLACES,
  // never people; they intentionally use a neutral colour, not the split fill.
  function groupNearby(points, radius = 42) {
    const parents = points.map((_, i) => i);
    function rootOf(i) {
      while (parents[i] !== i) { parents[i] = parents[parents[i]]; i = parents[i]; }
      return i;
    }
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        if (Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y) < radius) {
          parents[rootOf(j)] = rootOf(i);
        }
      }
    }
    const groups = new Map();
    points.forEach((point, i) => {
      const key = rootOf(i);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(point);
    });
    return [...groups.values()];
  }

  function nearestLongitude(lng, center) {
    return lng + Math.round((center - lng) / 360) * 360;
  }

  // Smallest longitude arc containing all places, including date-line crossings.
  function visitBounds(coordinates, center = 0) {
    if (!coordinates.length) return null;
    const longs = coordinates.map(c => ((c[0] % 360) + 360) % 360).sort((a, b) => a - b);
    let gap = -1, start = 0;
    for (let i = 0; i < longs.length; i++) {
      const next = i + 1 < longs.length ? longs[i + 1] : longs[0] + 360;
      if (next - longs[i] > gap) { gap = next - longs[i]; start = next % 360; }
    }
    const west = start, east = west + 360 - gap;
    const shift = Math.round((center - (west + east) / 2) / 360) * 360;
    return [[west + shift, Math.min(...coordinates.map(c => c[1]))], [east + shift, Math.max(...coordinates.map(c => c[1]))]];
  }

  const api = { mergeVisits, groupNearby, nearestLongitude, visitBounds, normalizeDate, formatDate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.WorldMapUtils = api;
})(typeof window !== 'undefined' ? window : globalThis);
