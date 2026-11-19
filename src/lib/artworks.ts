import { getCollection, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import { categories, categoryOf, slugOf, type CategoryKey } from '../data/categories';
import { showPendingPhotos } from '../data/site';

let announced = false;

export type Artwork = CollectionEntry<'artworks'>;
export type Photo = NonNullable<Artwork['data']['featured']>;
export type Credit = Photo['credit'];

/** Photos this build may show, featured first. Pending-permission photos are dropped on the live site. */
export function photosOf(entry: Artwork): Photo[] {
  const all = [...(entry.data.featured ? [entry.data.featured] : []), ...entry.data.photos];
  return all.filter((p) => showPendingPhotos || !p.permissionPending);
}

export function artworkUrl(entry: Artwork): string {
  return `/${categoryOf(entry.id)}/${slugOf(entry.id)}/`;
}

export async function getArtworks({ includeRemoved = false } = {}) {
  const all = await getCollection('artworks');
  if (!announced) {
    announced = true;
    const pending = all.flatMap((e) => [e.data.featured, ...e.data.photos]).filter((p) => p?.permissionPending).length;
    console.log(`[artmapsj] ${pending} permission-pending photos: ${showPendingPhotos ? 'SHOWN (preview build)' : 'HIDDEN (live build)'}`);
  }
  return all
    .filter((e) => includeRemoved || e.data.status !== 'removed')
    .sort((a, b) => a.data.title.localeCompare(b.data.title));
}

export function instagramUrl(handle: string) {
  return `https://www.instagram.com/${handle}/`;
}

export function googleMapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

/** The small data set the map page needs, with popup thumbnails pre-sized. */
export async function getMapData() {
  const entries = await getArtworks();
  return Promise.all(
    entries.map(async (e) => {
      const category: CategoryKey = categoryOf(e.id);
      const visible = photosOf(e);
      const f = visible[0];
      const thumb = f ? await getImage({ src: f.src, width: 600, format: 'webp', quality: 75 }) : null;
      return {
        id: e.id,
        category,
        title: e.data.title,
        location: e.data.location ?? '',
        artist: e.data.artist ?? '',
        sponsor: e.data.sponsor ?? '',
        description: e.data.description,
        district: e.data.district ?? null,
        lat: e.data.lat,
        lng: e.data.lng,
        url: artworkUrl(e),
        photo: thumb
          ? {
              src: thumb.src,
              alt: f?.alt ?? e.data.title,
              credit: f?.credit ?? null,
            }
          : null,
        photoCount: visible.length,
      };
    }),
  );
}

export type MapItem = Awaited<ReturnType<typeof getMapData>>[number];

export { categories };
