
/**
 * Extracts accommodation ID from the URL
 */
function extractId(url) {
  const idMatch = url.match(/\/([0-9]+)\/?$/);
  return idMatch ? idMatch[1] : "";
}
