import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import type { MapItem } from '../lib/artworks';

type Category = { label: string; plural: string; color: string };
type Payload = {
  items: MapItem[];
  categories: Record<string, Category>;
  tiles: { url: string; attribution: string };
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function photoBlock(d: MapItem, cat: Category) {
  if (d.photo) {
    const c = d.photo.credit;
    let credit = '';
    if (c) {
      const ig = c.instagram
        ? ` · <a href="https://www.instagram.com/${esc(c.instagram)}/" target="_blank" rel="noopener">@${esc(c.instagram)}</a>`
        : '';
      credit = `<div class="popup-credit">📷 ${esc(c.name)}${ig}</div>`;
    }
    return `<div class="popup-media"><a href="${d.url}"><img src="${d.photo.src}" alt="${esc(d.photo.alt)}" width="280" height="180" loading="lazy"></a>${credit}</div>`;
  }
  const noun = cat.label.split(' /')[0].toLowerCase();
  return `<div class="popup-placeholder" style="--c:${cat.color}">
    <span class="icon" aria-hidden="true">📷</span>
    <span>No photo of this ${esc(noun)} yet</span>
    <a href="/photos-needed/">Have one? Help us out →</a>
  </div>`;
}

function popupHtml(d: MapItem, cat: Category) {
  const maps = `https://www.google.com/maps/search/?api=1&query=${d.lat},${d.lng}`;
  return `<div class="popup">
    ${photoBlock(d, cat)}
    <div class="popup-body">
      <div class="popup-title">${esc(d.title)}</div>
      <span class="tag" style="--c:${cat.color}">${esc(cat.label)}</span>
      ${d.location ? `<div class="popup-row">${esc(d.location)}</div>` : ''}
      ${d.artist ? `<div class="popup-row"><strong>Artist:</strong> ${esc(d.artist)}</div>` : ''}
      ${d.sponsor ? `<div class="popup-row"><strong>Sponsor:</strong> ${esc(d.sponsor)}</div>` : ''}
      ${d.description ? `<div class="popup-row">${esc(d.description)}</div>` : ''}
      <div class="popup-links">
        <a href="${d.url}">Details${d.photoCount > 1 ? ` · ${d.photoCount} photos` : ''} →</a>
        <a href="${maps}" target="_blank" rel="noopener">Google Maps ↗</a>
      </div>
    </div>
  </div>`;
}

export function initMap() {
  const payload: Payload = JSON.parse(document.getElementById('map-data')!.textContent!);
  const { items, categories, tiles } = payload;

  const map = L.map('map', { zoomControl: true }).setView([37.3382, -121.8863], 12);
  L.tileLayer(tiles.url, { attribution: tiles.attribution, maxZoom: 19 }).addTo(map);

  const cluster = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 40,
    disableClusteringAtZoom: 16,
    iconCreateFunction: (c) =>
      L.divIcon({ html: `<div class="am-cluster">${c.getChildCount()}</div>`, className: '', iconSize: [36, 36] }),
  });
  map.addLayer(cluster);

  const entries = items.map((d) => {
    const cat = categories[d.category];
    const marker = L.marker([d.lat, d.lng], {
      icon: L.divIcon({
        className: '',
        html: `<div class="am-marker${d.photo ? ' has-photo' : ''}" style="--c:${cat.color}"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -8],
      }),
      title: d.title,
      alt: d.title,
    }).bindPopup(popupHtml(d, cat), { maxWidth: 280, minWidth: 280, autoPanPadding: [20, 70] });
    const haystack = [d.title, d.location, d.artist, d.sponsor, d.description].join(' ').toLowerCase();
    return { d, marker, haystack };
  });

  const countEl = document.getElementById('count')!;
  const searchEl = document.getElementById('search') as HTMLInputElement;
  const enabled = new Set(Object.keys(categories));

  function describe(n: number) {
    const shown = [...new Set(entries.filter((e) => enabled.has(e.d.category)).map((e) => e.d.category))];
    if (shown.length === 1) {
      const c = categories[shown[0]];
      return `${n} ${n === 1 ? c.label.toLowerCase() : c.plural} on map`;
    }
    return `${n} artwork${n === 1 ? '' : 's'} on map`;
  }

  function refresh() {
    const q = searchEl.value.toLowerCase().trim();
    const visible = entries.filter((e) => enabled.has(e.d.category) && (!q || e.haystack.includes(q)));
    cluster.clearLayers();
    cluster.addLayers(visible.map((e) => e.marker));
    countEl.textContent = q
      ? `${visible.length} result${visible.length === 1 ? '' : 's'} for "${searchEl.value.trim()}"`
      : describe(visible.length);
  }

  searchEl.addEventListener('input', refresh);

  document.querySelectorAll<HTMLButtonElement>('.chip[data-category]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.category!;
      const on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      on ? enabled.add(key) : enabled.delete(key);
      refresh();
    });
  });

  document.getElementById('locate-btn')!.addEventListener('click', () => {
    map.locate({ setView: true, maxZoom: 16 });
  });
  map.on('locationerror', () => {
    alert('Could not get your location. Please allow location access and try again.');
  });

  refresh();

  // /?focus=artboxes/some-slug opens that artwork's popup (used by "View on map" links).
  const focus = new URLSearchParams(location.search).get('focus');
  const target = focus && entries.find((e) => e.d.id === focus);
  if (target) {
    cluster.zoomToShowLayer(target.marker, () => target.marker.openPopup());
  }
}
