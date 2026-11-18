import { getCollection, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import { categories, categoryOf, slugOf, type CategoryKey } from '../data/categories';

export type Artwork = CollectionEntry<'artworks'>;
export type Credit = NonNullable<Artwork['data']['featured']>['credit'];

export function artworkUrl(entry: Artwork): string {
  return `/${categoryOf(entry.id)}/${slugOf(entry.id)}/`;
}

export async function getArtworks({ includeRemoved = false } = {}) {
  const all = await getCollection('artworks');
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
      const f = e.data.featured;
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
        photoCount: (f ? 1 : 0) + e.data.photos.length,
      };
    }),
  );
}

export type MapItem = Awaited<ReturnType<typeof getMapData>>[number];

export { categories };
