
// Background script for Chrome extension
console.log("Belvilla Data Harvester extension loaded");

// Listen for installation event
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});
