
/**
 * Extracts rating information from the page
 */
function extractRating() {
  let score = 0, count = 0;
  const ratingSelectors = [
    '.accommodation-rating__score',
    '.rating__score',
    '[data-testid="rating-score"]',
    '.rating-score',
    '.property-rating'
  ];
  
  for (const selector of ratingSelectors) {
    const ratingElement = document.querySelector(selector);
    if (ratingElement) {
      const scoreText = ratingElement.innerText.trim();
      const scoreMatch = scoreText.match(/\d+[.,]?\d*/);
      if (scoreMatch) {
        score = parseFloat(scoreMatch[0].replace(',', '.')) || 0;
      }
      
      const countSelectors = [
        '.accommodation-rating__count',
        '.rating__count',
        '[data-testid="rating-count"]',
        '.rating-count',
        '.reviews-count'
      ];
      
      for (const countSelector of countSelectors) {
        const countElement = document.querySelector(countSelector);
        if (countElement) {
          const countText = countElement.innerText.trim();
          const countMatch = countText.match(/\d+/);
          count = countMatch ? parseInt(countMatch[0]) : 0;
          break;
        }
      }
      
      break;
    }
  }
  
  // Check JSON-LD for rating info if not found
  if (score === 0) {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(script => {
      try {
        const jsonData = JSON.parse(script.textContent || '{}');
        if (jsonData.aggregateRating) {
          score = parseFloat(jsonData.aggregateRating.ratingValue) || 0;
          count = parseInt(jsonData.aggregateRating.reviewCount) || 0;
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    });
  }
  
  return { score, count };
}
