import type { MetadataRoute } from 'next';

/**
 * PWA manifest so the app can be installed / added to the home screen for quick
 * bedside access, with the teal brand colour for the mobile chrome.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GuidelineAtlas — bilingual clinical guideline finder',
    short_name: 'GuidelineAtlas',
    description:
      'Search current US, European and Polish medical society treatment guidelines in English or Polish.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0d9488',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}
