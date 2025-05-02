
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
    '.property-rules li',
    '.regels-en-beleid li',  // Voor Mongoolse yurt pagina
    '[id*="regels"] li',     // ID's die "regels" bevatten
    '[class*="rule"] li'     // Classes die "rule" bevatten
  ];
  
  for (const selector of ruleSelectors) {
    document.querySelectorAll(selector).forEach(item => {
      const text = item.innerText.trim();
      if (text) rules.push(text);
    });
    if (rules.length > 0) break;
  }
  
  // Als geen regels gevonden zijn, probeer te zoeken naar specifieke secties
  if (rules.length === 0) {
    const rulesSections = [
      document.querySelector('h2:contains("Regels"), h3:contains("Regels")'),
      document.querySelector('[id*="rules"], [id*="regels"]'),
      document.querySelector('.rules, .regels')
    ];
    
    for (const section of rulesSections) {
      if (section) {
        const listItems = section.nextElementSibling?.querySelectorAll('li');
        if (listItems && listItems.length > 0) {
          listItems.forEach(item => {
            const text = item.innerText.trim();
            if (text) rules.push(text);
          });
        }
        if (rules.length > 0) break;
      }
    }
  }
  
  // Als nog steeds geen regels, probeer te zoeken naar aankomst- en vertrektijden
  if (rules.length === 0) {
    document.querySelectorAll('*').forEach(el => {
      const text = el.innerText || '';
      
      // Zoek naar aankomst- en vertrektijden in de tekst
      const aankomstMatch = text.match(/(aankomst|check[\s-]*in)[\s:]*([\d]{1,2}[:.]\d{2})\s*-\s*([\d]{1,2}[:.]\d{2})/i);
      const vertrekMatch = text.match(/(vertrek|check[\s-]*out)[\s:]*([\d]{1,2}[:.]\d{2})\s*-\s*([\d]{1,2}[:.]\d{2})/i);
      
      if (aankomstMatch && !rules.includes(`Aankomst: ${aankomstMatch[2]} - ${aankomstMatch[3]}`)) {
        rules.push(`Aankomst: ${aankomstMatch[2]} - ${aankomstMatch[3]}`);
      }
      
      if (vertrekMatch && !rules.includes(`Vertrek: ${vertrekMatch[2]} - ${vertrekMatch[3]}`)) {
        rules.push(`Vertrek: ${vertrekMatch[2]} - ${vertrekMatch[3]}`);
      }
    });
  }
  
  return rules;
}
