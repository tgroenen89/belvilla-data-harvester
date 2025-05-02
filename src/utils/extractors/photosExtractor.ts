
/**
 * Extracts accommodation photos from the document
 */
export const extractPhotos = (doc: Document): string[] => {
  const photos: string[] = [];
  const photoSelectors = [
    'img[data-src]',
    '.accommodation-photos img', 
    '.gallery img',
    '.property-images img',
    '[data-testid="property-image"] img',
    '.image-gallery img',
    '.carousel img',
    '.gallery__image',
    'img[srcset]',
    'img[data-srcset]',
    // Voor de Mongoolse yurt pagina
    '.carousel__item img',
    '.carousel-item img',
    '.slider img',
    '[class*="carousel"] img',
    '[class*="slider"] img',
    '[class*="gallery"] img'
  ];
  
  for (const selector of photoSelectors) {
    doc.querySelectorAll(selector).forEach(img => {
      let src = img.getAttribute('data-src') || 
                img.getAttribute('src') || 
                img.getAttribute('data-lazy-src');
      
      // Try to extract from srcset if no direct src
      if (!src) {
        const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
        if (srcset) {
          src = srcset.split(',')[0].trim().split(' ')[0];
        }
      }
      
      // Add photo if it's valid and not already in the array
      if (src && !photos.includes(src) && 
          !src.includes('placeholder') && 
          src.includes('http') &&
          (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png') || src.includes('.webp'))) {
        photos.push(src);
      }
    });
    if (photos.length > 0) break;
  }
  
  // Try to find preloaded images from meta tags
  if (photos.length === 0) {
    doc.querySelectorAll('link[rel="preload"][as="image"]').forEach(link => {
      const src = link.getAttribute('href');
      if (src && !photos.includes(src) && !src.includes('placeholder')) {
        photos.push(src);
      }
    });
    
    // Also check OpenGraph image tags
    doc.querySelectorAll('meta[property="og:image"]').forEach(meta => {
      const src = meta.getAttribute('content');
      if (src && !photos.includes(src) && !src.includes('placeholder')) {
        photos.push(src);
      }
    });
  }
  
  // Als nog steeds geen foto's, zoek naar achtergrondafbeeldingen in stijlattributen
  if (photos.length === 0) {
    doc.querySelectorAll('[style*="background"]').forEach(el => {
      const style = el.getAttribute('style') || '';
      const match = style.match(/url\(['"]?(https?:\/\/[^'"]+\.(?:jpg|jpeg|png|webp))['"]?\)/i);
      if (match && match[1] && !photos.includes(match[1])) {
        photos.push(match[1]);
      }
    });
  }
  
  return photos;
};
