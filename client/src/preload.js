// Warm the browser cache for images so cards don't render before their picture.
const cache = new Map();

export function preloadImage(url) {
  if (!url) return Promise.resolve();
  if (!cache.has(url)) {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    const ready = (img.decode ? img.decode() : new Promise((res, rej) => { img.onload = res; img.onerror = rej; }))
      .catch(() => {}); // a broken image shouldn't block anything
    cache.set(url, ready);
  }
  return cache.get(url);
}

export const preloadImages = (urls) => Promise.all(urls.map(preloadImage));

// Resolve when the image is ready, or after `ms` so a slow image never blocks the UI.
export const preloadWithTimeout = (url, ms = 2500) =>
  Promise.race([preloadImage(url), new Promise((r) => setTimeout(r, ms))]);
