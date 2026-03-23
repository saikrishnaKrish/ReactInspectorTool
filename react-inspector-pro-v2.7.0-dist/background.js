/**
 * React Inspector Pro - background.js
 * Service Worker for handling extension action clicks
 * 
 * Copyright © 2026 Sai Krishna Kanteti
 * Licensed under the MIT License
 */

// Handle extension action (icon) click
chrome.action.onClicked.addListener((tab) => {
  // Send message to content script to toggle sidebar
  chrome.tabs.sendMessage(tab.id, { action: "toggle_inspector" }, (response) => {
    if (chrome.runtime.lastError) {
      console.log("React Inspector Pro: Content script not loaded on this tab");
    }
  });
});
