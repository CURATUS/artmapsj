// One entry per category. The key must match a folder name in
// src/content/artworks/. To add a category: add it here, then create the folder.
export const categories = {
  artboxes: {
    label: 'Art Box',
    plural: 'art boxes',
    color: '#38bdf8',
  },
  murals: {
    label: 'Mural',
    plural: 'murals',
    color: '#a78bfa',
  },
  'public-art': {
    label: 'Public Art',
    plural: 'public art pieces',
    color: '#4ade80',
  },
  galleries: {
    label: 'Gallery / Museum',
    plural: 'galleries & museums',
    color: '#f472b6',
  },
} as const;

export type CategoryKey = keyof typeof categories;

export function categoryOf(id: string): CategoryKey {
  const folder = id.split('/')[0];
  if (!(folder in categories)) {
    throw new Error(
      `Artwork "${id}" is in folder "${folder}", which isn't a category. ` +
        `Valid folders: ${Object.keys(categories).join(', ')} (see src/data/categories.ts).`,
    );
  }
  return folder as CategoryKey;
}

export function slugOf(id: string): string {
  return id.split('/').slice(1).join('/');
}
