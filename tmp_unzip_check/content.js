/**
 * React Inspector Pro - content.js
 * 
 * Copyright © 2026 Sai Krishna Kanteti
 * Licensed under the MIT License
 * 
 * Content script bridge for React Inspector Pro extension.
 * Handles extension icon clicks and messaging between background and main world scripts.
 * 
 * Licensed under the MIT License - see LICENSE file for details.
 */

// Listen for extension action (icon) click
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggle_inspector") {
    // Dispatch custom event to inject.js (MAIN world)
    window.dispatchEvent(new CustomEvent('RI_TOGGLE_MANUAL'));
    sendResponse({ status: "sidebar toggled" });
  }
});

console.log("React Inspector Pro: Content bridge loaded.");