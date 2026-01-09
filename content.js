/**
 * content.js - React Inspector Pro Loader
 * Matches: <all_urls>
 * World: ISOLATED
 */

// Since the manifest uses world: "MAIN" for inject.js, content.js
// can be used for secondary messaging or browser-level triggers.
console.log("React Inspector Pro: Content bridge loaded.");

// Optional: listen for action click from manifest.json
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggle_inspector") {
    // Dispatch a custom event that inject.js (MAIN world) can listen to
    window.dispatchEvent(new CustomEvent('RI_TOGGLE_MANUAL'));
  }
});