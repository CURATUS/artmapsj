// CARTO dark basemap. The key is restricted by referrer in the CARTO dashboard:
// any new domain the site runs on (preview URLs too) must be added there.
export const tiles = {
  url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=cb1_45m5_1_b623373f3a32914090f73b34',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  maxZoom: 19,
};

// Photos marked `permissionPending: true` appear on preview builds but never on the live site.
// Cloudflare tells the build which git branch it's building; anything but `main` is a preview.
// Override either way with the SHOW_PENDING_PHOTOS=true|false environment variable.
const branch = process.env.WORKERS_CI_BRANCH ?? process.env.CF_PAGES_BRANCH ?? '';
const override = process.env.SHOW_PENDING_PHOTOS;
export const showPendingPhotos = override ? override === 'true' : branch !== 'main';
