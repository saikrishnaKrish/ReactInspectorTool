/**
 * React Inspector Pro - content.js
 * 
 * Copyright © 2026 Sai Krishna Kanteti
 * Licensed under the MIT License
 * 
 * Content script bridge for React Inspector Pro extension.
 * Matches: <all_urls> | World: ISOLATED
 * 
 * Licensed under the MIT License - see LICENSE file for details.
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