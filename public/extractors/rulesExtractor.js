
/**
 * Extracts house rules from the page
 */
function extractRules() {
  const rules = [];
  const ruleSelectors = [
    '.accommodation-rules__item',
    '.house-rules li',
    '[data-testid="rules"] li',
    '.rules li',
    '.property-rules li'
  ];
  
  for (const selector of ruleSelectors) {
    document.querySelectorAll(selector).forEach(item => {
      const text = item.innerText.trim();
      if (text) rules.push(text);
    });
    if (rules.length > 0) break;
  }
  
  return rules;
}
