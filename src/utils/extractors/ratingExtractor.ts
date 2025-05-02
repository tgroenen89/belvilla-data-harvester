
/**
 * Extracts rating information from the document
 */
export const extractRating = (doc: Document) => {
  let score = 0;
  let count = 0;
  
  const ratingSelectors = [
    '.accommodation-rating__score',
    '.rating__score',
    '[data-testid="rating-score"]',
    '.rating-score',
    '.property-rating',
    '[class*="rating"]'
  ];
  
  for (const selector of ratingSelectors) {
    const ratingEl = doc.querySelector(selector);
    if (ratingEl) {
      const scoreText = ratingEl.textContent || '';
      const scoreMatch = scoreText.match(/\d+[.,]?\d*/);
      if (scoreMatch) {
        score = parseFloat(scoreMatch[0].replace(',', '.'));
      }
      
      const countSelectors = [
        '.accommodation-rating__count',
        '.rating__count',
        '[data-testid="rating-count"]',
        '.rating-count',
        '.reviews-count'
      ];
      
      for (const countSelector of countSelectors) {
        const countEl = doc.querySelector(countSelector);
        if (countEl) {
          const countText = countEl.textContent || '';
          const countMatch = countText.match(/\d+/);
          if (countMatch) {
            count = parseInt(countMatch[0]);
          }
          break;
        }
      }
      
      break;
    }
  }
  
  // Try to find rating in schema.org data if not found yet
  if (score === 0) {
    const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
    for (const script of scripts) {
      try {
        const jsonData = JSON.parse(script.textContent || '{}');
        if (jsonData.aggregateRating) {
          score = parseFloat(jsonData.aggregateRating.ratingValue) || 0;
          count = parseInt(jsonData.aggregateRating.reviewCount) || 0;
          break;
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }
  }
  
  return { score, count };
};
