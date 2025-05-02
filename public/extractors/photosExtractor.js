
/**
 * Extracts accommodation photos from the page
 */
function extractPhotos() {
  const photos = [];
  const photoSelectors = [
    '.accommodation-photos img', 
    '.gallery img',
    '.property-images img',
    '[data-testid="property-image"] img',
    '.carousel img',
    '.gallery__image'
  ];
  
  for (const selector of photoSelectors) {
    document.querySelectorAll(selector).forEach(img => {
      const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
      if (src && !photos.includes(src) && !src.includes('placeholder')) {
        photos.push(src);
      }
    });
  }
  
  // Also try to get photos from data-srcset or srcset attributes
  if (photos.length === 0) {
    document.querySelectorAll('img[data-srcset], img[srcset]').forEach(img => {
      const srcset = img.getAttribute('data-srcset') || img.getAttribute('srcset');
      if (srcset) {
        const firstSrc = srcset.split(',')[0].trim().split(' ')[0];
        if (firstSrc && !photos.includes(firstSrc) && !firstSrc.includes('placeholder')) {
          photos.push(firstSrc);
        }
      }
    });
  }
  
  // Try to find preloaded images from meta tags
  if (photos.length === 0) {
    document.querySelectorAll('link[rel="preload"][as="image"]').forEach(link => {
      const src = link.getAttribute('href');
      if (src && !photos.includes(src) && !src.includes('placeholder')) {
        photos.push(src);
      }
    });
    
    // Also check OpenGraph image tags
    document.querySelectorAll('meta[property="og:image"]').forEach(meta => {
      const src = meta.getAttribute('content');
      if (src && !photos.includes(src) && !src.includes('placeholder')) {
        photos.push(src);
      }
    });
  }
  
  return photos;
}
