
/**
 * Extracts house rules from the document
 */
export const extractRules = (doc: Document): string[] => {
  const rules: string[] = [];
  const ruleSelectors = [
    '.accommodation-rules__item',
    '.house-rules li',
    '[data-testid="rules"] li',
    '.rules li',
    '.property-rules li'
  ];
  
  for (const selector of ruleSelectors) {
    doc.querySelectorAll(selector).forEach(item => {
      const text = item.textContent?.trim();
      if (text) {
        rules.push(text);
      }
    });
    if (rules.length > 0) break;
  }
  
  return rules;
};
