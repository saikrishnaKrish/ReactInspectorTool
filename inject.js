/**
 * React Inspector Pro - inject.js
 * 
 * Copyright © 2026 Sai Krishna Kanteti
 * Licensed under the MIT License
 * 
 * Features: Real-time React component inspection, Props/State viewing, 
 * JSX Export, Class Toggling, Computed Styles, Box Model Visualization, 
 * Global Search, Color Picker, Dark/Light Theme.
 * 
 * VERSION: 2.6.0
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 */

(function () {
  // --- Global State ---
  let isDevMode = false;
  let isSearchMode = false;
  let isOverlayHidden = false;
  let currentTargetFiber = null;
  let currentTargetElement = null;

  // Track which sections are collapsed
  const collapsedSections = new Set();

  const savedTheme = localStorage.getItem('ri-theme');
  let currentTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  let overlay = null;
  let sidePanel = null;

  let isDragging = false;
  let isResizing = false;
  let resizeType = null; // 'left', 'bottom', 'corner'
  let startX, startY, startWidth, startHeight, startLeft, startTop;

  let offsetX, offsetY;
  let tempVarCounter = 1;

  const recentColors = []; // Store colors picked by eyedropper

  // --- Utilities ---

  /**
   * Safe deep clone for React Fiber props/state to avoid circular references
   * and limit depth for performance.
   */
  const safeClone = (obj, depth = 0, seen = new WeakSet()) => {
    if (depth > 4) return '[Object]';
    if (obj === null || typeof obj !== 'object') {
      if (typeof obj === 'function') return `[Function: ${obj.name || 'anon'}]`;
      return obj;
    }
    if (seen.has(obj)) return '[Circular]';
    if (obj.nodeType) return `[DOM: ${obj.nodeName}]`;

    seen.add(obj);

    if (Array.isArray(obj)) {
      return obj.map(item => safeClone(item, depth + 1, seen));
    }

    const cloned = {};
    const internalKeys = ['_owner', '_store', '_self', '_source', 'alternate', 'stateNode', 'return', 'child', 'sibling', 'dependencies', 'updateQueue'];

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (internalKeys.includes(key) || key.startsWith('$$') || key.startsWith('__')) continue;
        cloned[key] = safeClone(obj[key], depth + 1, seen);
      }
    }
    return cloned;
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      // Modern Clipboard API (secure contexts only)
      navigator.clipboard.writeText(text).catch(() => {
        // Fallback for older browsers or non-secure contexts
        fallbackCopyToClipboard(text);
      });
    } else {
      fallbackCopyToClipboard(text);
    }
  };

  const fallbackCopyToClipboard = (text) => {
    const input = document.createElement('textarea');
    input.value = text;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
    } catch (e) {
      console.warn('Copy to clipboard failed:', e);
    }
    document.body.removeChild(input);
  };

  const getFiber = (el) => {
    if (!el) return null;
    const key = Object.keys(el).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'));
    return el[key];
  };

  const getComponentFiber = (fiber) => {
    let curr = fiber;
    while (curr) {
      if (typeof curr.type === 'function' || (typeof curr.type === 'object' && curr.type !== null)) {
        const name = curr.type.displayName || curr.type.name || (curr.type.render ? curr.type.render.name : null);
        if (name && !['Provider', 'Consumer', 'Context', 'Memo', 'ForwardRef', 'Fragment'].includes(name)) return curr;
      }
      curr = curr.return;
    }
    return fiber;
  };

  const getComponentName = (fiber) => {
    const target = getComponentFiber(fiber);
    if (!target) return 'Anonymous';
    const type = target.type;
    const name = (type && (type.displayName || type.name)) || (type && type.render && type.render.name) || 'Component';
    return String(name || 'Anonymous');
  };

  const getHierarchy = (fiber) => {
    const path = [];
    let curr = fiber;
    while (curr && path.length < 5) {
      const name = getComponentName(curr);
      if (name && name !== path[path.length - 1]) path.push(name);
      curr = curr.return;
    }
    return path;
  };

  const rgbToHex = (rgb) => {
    if (!rgb) return "#000000";
    const res = rgb.match(/\d+/g);
    if (!res) return rgb;
    return "#" + res.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join("").toUpperCase();
  };

  // --- Theme & Style Management ---

  const injectStyles = () => {
    if (document.getElementById('react-inspector-styles')) return;

    const style = document.createElement('style');
    style.id = 'react-inspector-styles';
    style.textContent = `
      .ri-panel {
        --ri-bg: #ffffff;
        --ri-text: #1e293b;
        --ri-text-dim: #64748b;
        --ri-border: #e2e8f0;
        --ri-header-bg: #f8fafc;
        --ri-code-bg: #f1f5f9;
        --ri-code-text: #2563eb;
        --ri-accent: #3b82f6;
        --ri-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        --ri-scroll-thumb: #cbd5e1;
        --bm-margin: #f9cc9d;
        --bm-border: #f3e5ab;
        --bm-padding: #c3e88d;
        --bm-content: #82aaff;
      }
      .ri-panel.dark {
        --ri-bg: #0f172a;
        --ri-text: #f1f5f9;
        --ri-text-dim: #94a3b8;
        --ri-border: #1e293b;
        --ri-header-bg: #1e293b;
        --ri-code-bg: #020617;
        --ri-code-text: #93c5fd;
        --ri-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5);
        --ri-scroll-thumb: #334155;
        --bm-margin: #6b4c2a;
        --bm-border: #5c5432;
        --bm-padding: #3c4c26;
        --bm-content: #2a3b5c;
      }

      .ri-panel * {
        scrollbar-width: thin;
        scrollbar-color: var(--ri-scroll-thumb) transparent;
      }
      .ri-panel *::-webkit-scrollbar { width: 5px; height: 5px; }
      .ri-panel *::-webkit-scrollbar-track { background: transparent; }
      .ri-panel *::-webkit-scrollbar-thumb { background-color: var(--ri-scroll-thumb); border-radius: 10px; }
      .ri-panel *::-webkit-scrollbar-button { display: none; }

      .ri-panel-container { 
        background: var(--ri-bg); color: var(--ri-text); box-shadow: var(--ri-shadow); 
        border: 1px solid var(--ri-border); transition: background 0.2s, color 0.2s, box-shadow 0.2s;
        display: flex; flex-direction: column;
        min-width: 280px; min-height: 200px;
      }
      .ri-code-block { 
        background: var(--ri-code-bg); color: var(--ri-code-text); border: 1px solid var(--ri-border); 
        font-family: 'Fira Code', monospace; font-size: 11px;
      }
      .ri-breadcrumb { background: var(--ri-header-bg); color: var(--ri-text-dim); }
      
      #theme-toggle-btn, .ri-copy-icon-btn, .ri-action-btn, .ri-header-tool { 
        cursor: pointer; background: none; border: none; color: var(--ri-text-dim); 
        display: flex; align-items: center; justify-content: center;
        padding: 4px; border-radius: 4px; transition: all 0.2s;
      }
      #theme-toggle-btn:hover, .ri-copy-icon-btn:hover, .ri-action-btn:hover, .ri-header-tool:hover { 
        background: var(--ri-border); color: var(--ri-accent); 
      }
      .ri-section-title { 
        color: var(--ri-text-dim); font-size: 10px; font-weight: bold; text-transform: uppercase; 
        margin-bottom: 8px; margin-top: 16px; border-bottom: 1px solid var(--ri-border);
        display: flex; justify-content: space-between; align-items: center;
        cursor: pointer; user-select: none;
      }
      .ri-section-title:hover { color: var(--ri-accent); }
      .ri-drag-handle { cursor: move; user-select: none; }
      
      .ri-layer-outline {
        position: fixed; pointer-events: none; z-index: 2147483646;
        border: 2px solid var(--ri-accent); background: rgba(59, 130, 246, 0.1);
      }
      
      .ri-name-label {
        position: absolute; top: -24px; left: -2px; 
        background: #3b82f6; color: white; 
        font-size: 10px; font-weight: bold; font-family: sans-serif;
        padding: 3px 8px; border-radius: 4px; white-space: nowrap;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
        pointer-events: none;
      }

      .ri-event-pill {
        color: var(--ri-accent); background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.2); padding: 2px 6px; border-radius: 4px; font-size: 9px; margin-right: 4px;
        cursor: pointer; transition: all 0.2s;
      }
      .ri-event-pill:hover { background: rgba(59, 130, 246, 0.2); }

      .ri-btn-group { display: flex; gap: 4px; }
      .ri-small-btn { font-size: 9px; padding: 5px 10px; border: 1px solid var(--ri-border); border-radius: 4px; cursor: pointer; background: var(--ri-bg); color: var(--ri-text-dim); transition: all 0.2s; }
      .ri-small-btn:hover { border-color: var(--ri-accent); color: var(--ri-accent); background: var(--ri-header-bg); }
      
      .ri-primary-btn { background: var(--ri-accent); color: white; border: none; font-weight: bold; }
      
      .ri-prop-filter {
        width: 80%; background: var(--ri-code-bg); border: 1px solid var(--ri-border);
        color: var(--ri-text); padding: 10px; border-radius: 8px; font-size: 11px; outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
        margin: 0 auto 12px auto; display: block;
      }
      .ri-comp-search-input {
        width: 100%; background: var(--ri-code-bg); border: 1px solid var(--ri-border);
        color: var(--ri-text); padding: 10px; border-radius: 8px; font-size: 11px; outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .ri-prop-filter:focus, .ri-comp-search-input:focus {
        border-color: var(--ri-accent);
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
      }

      .ri-search-match-info { font-size: 10px; color: var(--ri-accent); font-weight: bold; margin-top: 8px; display: block; }

      .ri-inline-search-container {
        padding: 12px;
        background: var(--ri-header-bg);
        border-bottom: 1px solid var(--ri-border);
        animation: ri-slide-down 0.2s ease-out;
      }

      @keyframes ri-slide-down {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Enhanced Search Border Styles */
      .ri-search-highlight { 
        outline: 3px solid var(--ri-accent) !important; 
        outline-offset: -3px;
        box-shadow: 0 0 15px rgba(59, 130, 246, 0.4); 
        animation: ri-search-pulse 2s infinite;
        z-index: 2147483640;
      }

      @keyframes ri-search-pulse {
        0% { outline-color: var(--ri-accent); outline-width: 3px; }
        50% { outline-color: #60a5fa; outline-width: 5px; }
        100% { outline-color: var(--ri-accent); outline-width: 3px; }
      }

      .ri-color-card {
        background: var(--ri-header-bg); border: 1px solid var(--ri-border);
        border-radius: 8px; padding: 12px; margin-bottom: 12px;
      }
      .ri-recent-swatches { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
      .ri-mini-swatch { width: 18px; height: 18px; border-radius: 50%; border: 1px solid var(--ri-border); cursor: copy; }

      .ri-copy-success {
        color: #22c55e; font-size: 10px; font-weight: bold;
        animation: ri-fade-in-out 1.5s forwards;
      }
      @keyframes ri-fade-in-out {
        0% { opacity: 0; transform: scale(0.8); }
        20% { opacity: 1; transform: scale(1); }
        80% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0.8); }
      }

      .ri-collapsible-content { display: block; }
      .ri-collapsed .ri-collapsible-content { display: none; }
      .ri-chevron { transition: transform 0.2s; font-size: 10px; margin-right: 6px; }
      .ri-collapsed .ri-chevron { transform: rotate(-90deg); }

      /* Resize Handles */
      .ri-resize-handle {
        position: absolute;
        z-index: 2147483648;
        background: transparent;
      }
      .ri-resize-left {
        left: 0; top: 0; bottom: 0; width: 6px; cursor: ew-resize;
      }
      .ri-resize-bottom {
        bottom: 0; left: 0; right: 0; height: 6px; cursor: ns-resize;
      }
      .ri-resize-corner-bl {
        bottom: 0; left: 0; width: 12px; height: 12px; cursor: sw-resize;
      }

      /* CSS Box Model Styling */
      .ri-box-container {
        font-family: monospace;
        font-size: 9px;
        text-align: center;
        margin: 10px 0;
        position: relative;
        display: flex;
        justify-content: center;
      }
      .ri-box {
        padding: 14px 20px;
        border: 1px dashed rgba(128,128,128,0.3);
        position: relative;
        min-width: 40px;
      }
      .ri-box-label {
        position: absolute;
        top: 2px;
        left: 4px;
        color: var(--ri-text-dim);
        font-size: 8px;
        text-transform: lowercase;
        opacity: 0.7;
      }
      .ri-box-val {
        position: absolute;
        color: var(--ri-text);
      }
      .ri-box-val.top { top: 2px; left: 50%; transform: translateX(-50%); }
      .ri-box-val.bottom { bottom: 2px; left: 50%; transform: translateX(-50%); }
      .ri-box-val.left { left: 4px; top: 50%; transform: translateY(-50%); }
      .ri-box-val.right { right: 4px; top: 50%; transform: translateY(-50%); }
      
      .ri-margin-box { background-color: var(--bm-margin); }
      .ri-border-box { background-color: var(--bm-border); }
      .ri-padding-box { background-color: var(--bm-padding); }
      .ri-content-box { 
        background-color: var(--bm-content); 
        padding: 8px 12px;
        border: 1px solid rgba(128,128,128,0.2);
        color: var(--ri-text);
        display: inline-block;
      }
    `;
    document.head.appendChild(style);
  };

  // --- UI Assets ---
  const logoIcon = `<svg viewBox="-11.5 -10.23174 23 20.46348" fill="none" stroke="#3b82f6" stroke-width="1.2"><circle cx="0" cy="0" r="2.05" fill="#3b82f6"/><g><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></g></svg>`;
  const copyIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>`;
  const sunIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/></svg>`;
  const moonIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
  const dropperIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 22 1-1h3l9-9"/><path d="M9 8 5 4h3l1 1"/><path d="m15 2 7 7-2 2-7-7 2-2Z"/></svg>`;
  const searchIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;
  const minimizeIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg>`;
  const chevronIcon = `<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>`;

  // --- UI Logic ---

  const initUI = () => {
    if (overlay) return;
    injectStyles();

    overlay = document.createElement('div');
    overlay.className = 'ri-layer-outline';
    overlay.style.display = 'none';

    const label = document.createElement('div');
    label.className = 'ri-name-label';
    overlay.appendChild(label);
    document.body.appendChild(overlay);

    sidePanel = document.createElement('div');
    sidePanel.className = `ri-panel ri-panel-container ${currentTheme}`;
    sidePanel.style.cssText = `position:fixed;top:15px;right:15px;width:340px;height:auto;max-height:90vh;z-index:2147483647;border-radius:12px;display:none;`;

    // Add Resizers
    const resizerLeft = document.createElement('div');
    resizerLeft.className = 'ri-resize-handle ri-resize-left';
    const resizerBottom = document.createElement('div');
    resizerBottom.className = 'ri-resize-handle ri-resize-bottom';
    const resizerCorner = document.createElement('div');
    resizerCorner.className = 'ri-resize-handle ri-resize-corner-bl';

    sidePanel.appendChild(resizerLeft);
    sidePanel.appendChild(resizerBottom);
    sidePanel.appendChild(resizerCorner);

    document.body.appendChild(sidePanel);

    // Mouse Listeners for Moving & Resizing
    const handleMouseDown = (e) => {
      const handle = e.target.closest('.ri-drag-handle');
      const resizer = e.target.closest('.ri-resize-handle');

      if (resizer) {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = sidePanel.getBoundingClientRect();
        startWidth = rect.width;
        startHeight = rect.height;
        startLeft = rect.left;
        startTop = rect.top;

        if (resizer.classList.contains('ri-resize-left')) resizeType = 'left';
        else if (resizer.classList.contains('ri-resize-bottom')) resizeType = 'bottom';
        else if (resizer.classList.contains('ri-resize-corner-bl')) resizeType = 'corner';

        sidePanel.style.transition = 'none';
        e.preventDefault();
        return;
      }

      if (handle && !e.target.closest('button')) {
        isDragging = true;
        const rect = sidePanel.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        sidePanel.style.transition = 'none';
      }
    };

    const handleMouseMove = (e) => {
      if (isResizing) {
        if (resizeType === 'left' || resizeType === 'corner') {
          const deltaX = startX - e.clientX;
          const newWidth = Math.max(280, startWidth + deltaX);
          sidePanel.style.width = `${newWidth}px`;
          if (sidePanel.style.right === 'auto') {
            sidePanel.style.left = `${startLeft - (newWidth - startWidth)}px`;
          }
        }
        if (resizeType === 'bottom' || resizeType === 'corner') {
          const deltaY = e.clientY - startY;
          const newHeight = Math.max(200, startHeight + deltaY);
          sidePanel.style.height = `${newHeight}px`;
        }
      }

      if (isDragging) {
        sidePanel.style.left = `${e.clientX - offsetX}px`;
        sidePanel.style.top = `${e.clientY - offsetY}px`;
        sidePanel.style.right = 'auto';
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
      isResizing = false;
      resizeType = null;
      if (sidePanel) sidePanel.style.transition = '';
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const createCollapsible = (id, title, content, extra = '') => {
    const isCollapsed = collapsedSections.has(id);
    return `
      <div id="section-${id}" class="ri-section-container ${isCollapsed ? 'ri-collapsed' : ''}">
        <div class="ri-section-title" data-collapse-id="${id}">
          <div style="display:flex; align-items:center;">
            <span class="ri-chevron">${chevronIcon}</span>
            <span>${title}</span>
          </div>
          ${extra}
        </div>
        <div class="ri-collapsible-content">
          ${content}
        </div>
      </div>
    `;
  };

  const updatePanel = (targetFiber, element) => {
    currentTargetFiber = targetFiber || currentTargetFiber;
    currentTargetElement = element || currentTargetElement;

    if (!sidePanel || !currentTargetFiber) return;

    sidePanel.style.display = 'flex';
    const hierarchy = getHierarchy(currentTargetFiber);
    const props = currentTargetFiber.memoizedProps || {};
    const state = currentTargetFiber.memoizedState;
    const name = getComponentName(currentTargetFiber);

    const computedStyles = window.getComputedStyle(currentTargetElement);

    // Detailed Box Model metrics
    const cleanPx = (val) => parseInt(val) || 0;
    const box = {
      margin: { t: cleanPx(computedStyles.marginTop), r: cleanPx(computedStyles.marginRight), b: cleanPx(computedStyles.marginBottom), l: cleanPx(computedStyles.marginLeft) },
      border: { t: cleanPx(computedStyles.borderTopWidth), r: cleanPx(computedStyles.borderRightWidth), b: cleanPx(computedStyles.borderBottomWidth), l: cleanPx(computedStyles.borderLeftWidth) },
      padding: { t: cleanPx(computedStyles.paddingTop), r: cleanPx(computedStyles.paddingRight), b: cleanPx(computedStyles.paddingBottom), l: cleanPx(computedStyles.paddingLeft) },
      content: { w: cleanPx(computedStyles.width), h: cleanPx(computedStyles.height) }
    };

    const essentialStyles = {
      display: computedStyles.display,
      position: computedStyles.position,
      width: computedStyles.width,
      height: computedStyles.height,
      color: rgbToHex(computedStyles.color),
      backgroundColor: rgbToHex(computedStyles.backgroundColor)
    };

    const classes = currentTargetElement.className || "";
    const classStr = typeof classes === 'string' ? classes : (classes.baseVal || "");
    const classArray = classStr.split(/\s+/).filter(Boolean);

    // Box Model HTML Builder
    const boxModelHtml = `
      <div class="ri-box-container">
        <div class="ri-box ri-margin-box">
          <span class="ri-box-label">margin</span>
          <span class="ri-box-val top">${box.margin.t}</span>
          <span class="ri-box-val bottom">${box.margin.b}</span>
          <span class="ri-box-val left">${box.margin.l}</span>
          <span class="ri-box-val right">${box.margin.r}</span>
          <div class="ri-box ri-border-box">
            <span class="ri-box-label">border</span>
            <span class="ri-box-val top">${box.border.t}</span>
            <span class="ri-box-val bottom">${box.border.b}</span>
            <span class="ri-box-val left">${box.border.l}</span>
            <span class="ri-box-val right">${box.border.r}</span>
            <div class="ri-box ri-padding-box">
              <span class="ri-box-label">padding</span>
              <span class="ri-box-val top">${box.padding.t}</span>
              <span class="ri-box-val bottom">${box.padding.b}</span>
              <span class="ri-box-val left">${box.padding.l}</span>
              <span class="ri-box-val right">${box.padding.r}</span>
              <div class="ri-content-box">
                ${box.content.w} × ${box.content.h}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Keep inner container content, preserving dimensions of sidePanel
    const contentHtml = `
      <div class="ri-drag-handle" style="padding:16px;background:var(--ri-header-bg);border-bottom:1px solid var(--ri-border);display:flex;justify-content:space-between;align-items:center; flex-shrink: 0;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:20px;">${logoIcon}</div>
          <span style="font-weight:bold;font-size:11px;">REACT INSPECTOR</span>
        </div>
        <div style="display:flex; align-items:center; gap:4px;">
          <button id="btn-toggle-search" class="ri-header-tool" title="Search Components (Alt+S)">${searchIcon}</button>
          <button id="theme-toggle-btn" class="ri-header-tool">${currentTheme === 'dark' ? moonIcon : sunIcon}</button>
          <button id="ri-close" style="font-size:20px;cursor:pointer;background:none;border:none;color:var(--ri-text-dim); padding:0 4px;">&times;</button>
        </div>
      </div>

      ${isSearchMode ? `
        <div class="ri-inline-search-container" style="flex-shrink: 0;">
          <div style="display:flex; align-items:center; gap:8px;">
            <input type="text" id="comp-search-inline" class="ri-comp-search-input" placeholder="Search components globally...">
            <button id="btn-minimize-search" class="ri-header-tool" title="Hide Search">${minimizeIcon}</button>
          </div>
          <span id="search-match-count" class="ri-search-match-info" style="margin-top: 10px;">Matches found: 0</span>
        </div>
      ` : ''}

      <div style="padding:16px;overflow-y:auto;flex:1;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <h2 style="font-size:18px;font-weight:800;color:var(--ri-text);margin:0;">&lt;${name} /&gt;</h2>
          <button class="ri-copy-icon-btn" id="btn-copy-name" title="Copy component name">${copyIcon}</button>
          <span id="copy-name-success" class="ri-copy-success" style="display:none; font-size:10px;">Copied!</span>
        </div>
        
        <div class="ri-section-title" style="cursor:default; border-bottom: 1px solid var(--ri-border); color: var(--ri-text-dim); padding-bottom: 4px;">Color Suite</div>
        <div class="ri-color-card">
          <button class="ri-small-btn w-full" id="btn-eyedropper">
            ${dropperIcon} Pick from Screen
          </button>
          <div id="recent-picks-container" class="ri-recent-swatches" style="${recentColors.length ? '' : 'display:none;'}">
            ${recentColors.map(c => `<div class="ri-mini-swatch" style="background:${c}" title="${c}" data-copy="${c}"></div>`).join('')}
          </div>
        </div>

        ${createCollapsible('boxmodel', 'Box Model', boxModelHtml)}

        ${createCollapsible('classes', 'Classes (Toggle)', `
          <div id="class-container" style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:12px;">
            ${classArray.map(c => `<span class="ri-event-pill" style="background:var(--ri-border); color:var(--ri-text);" data-class="${c}">${c}</span>`).join('')}
          </div>
        `, `<button class="ri-small-btn" id="btn-reset-classes" style="font-size:8px; padding: 2px 6px;">Reset</button>`)}

        ${createCollapsible('hierarchy', 'Hierarchy', `
          <div style="font-size:10px;display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px;">
            ${hierarchy.reverse().map(n => `<span class="ri-breadcrumb" style="padding:2px 6px;border-radius:4px;">${n}</span>`).join('<span>&gt;</span>')}
          </div>
        `)}

        <div style="margin-bottom:16px; display:flex; gap:8px;">
           <button class="ri-small-btn ri-primary-btn" id="btn-copy-jsx">Export as JSX</button>
           <button class="ri-small-btn" id="btn-log-fiber">Log Fiber</button>
        </div>

        ${createCollapsible('styles', 'Computed Styles', `
          <div class="ri-computed-box">
            <pre class="ri-code-block" style="padding:10px;border:none;max-height:100px;overflow-y:auto;background:transparent;">${JSON.stringify(essentialStyles, null, 2)}</pre>
          </div>
        `, `<button class="ri-copy-icon-btn" id="btn-copy-styles" title="Copy styles">${copyIcon}</button>`)}

        <div style="margin-top: 16px;">
          <input type="text" id="prop-filter" class="ri-prop-filter" placeholder="Filter props or values...">
        </div>

        ${createCollapsible('props', 'Props', `
          <pre id="pre-props" class="ri-code-block" style="padding:10px;border-radius:8px;overflow-x:auto;">${JSON.stringify(safeClone(props), null, 2)}</pre>
        `, `<button class="ri-copy-icon-btn" id="btn-copy-props" title="Copy props">${copyIcon}</button>`)}
        
        ${state ? createCollapsible('state', 'State', `
          <pre id="pre-state" class="ri-code-block" style="padding:10px;border-radius:8px;overflow-x:auto;">${JSON.stringify(safeClone(state), null, 2)}</pre>
        `, `<button class="ri-copy-icon-btn" id="btn-copy-state" title="Copy state">${copyIcon}</button>`) : ''}
      </div>
    `;

    // Re-add resizers to persistent panel
    const resizers = sidePanel.querySelectorAll('.ri-resize-handle');
    sidePanel.innerHTML = contentHtml;
    resizers.forEach(r => sidePanel.appendChild(r));

    // Listeners
    sidePanel.querySelector('#ri-close').onclick = () => sidePanel.style.display = 'none';

    // Global collapse handler
    sidePanel.querySelectorAll('[data-collapse-id]').forEach(header => {
      header.onclick = (e) => {
        if (e.target.closest('button')) return;
        const id = header.getAttribute('data-collapse-id');
        if (collapsedSections.has(id)) collapsedSections.delete(id);
        else collapsedSections.add(id);
        updatePanel();
      };
    });

    // Toggle Search Header button
    const searchToggle = sidePanel.querySelector('#btn-toggle-search');
    if (searchToggle) {
      searchToggle.onclick = () => {
        isSearchMode = !isSearchMode;
        updatePanel();
        if (isSearchMode) {
          setTimeout(() => sidePanel.querySelector('#comp-search-inline')?.focus(), 50);
        } else {
          document.querySelectorAll('.ri-search-highlight').forEach(el => el.classList.remove('ri-search-highlight'));
        }
      };
    }

    if (isSearchMode) {
      const minimizeBtn = sidePanel.querySelector('#btn-minimize-search');
      if (minimizeBtn) {
        minimizeBtn.onclick = () => {
          isSearchMode = false;
          updatePanel();
          document.querySelectorAll('.ri-search-highlight').forEach(el => el.classList.remove('ri-search-highlight'));
        };
      }

      const searchInput = sidePanel.querySelector('#comp-search-inline');
      if (searchInput) {
        searchInput.oninput = (e) => handleGlobalSearch(e.target.value);
      }
    }

    // Copy Logic with explicit existence checks
    const copyStylesBtn = sidePanel.querySelector('#btn-copy-styles');
    if (copyStylesBtn) {
      copyStylesBtn.onclick = () => {
        copyToClipboard(JSON.stringify(essentialStyles, null, 2));
        copyStylesBtn.style.color = '#22c55e';
        setTimeout(() => { if (copyStylesBtn) copyStylesBtn.style.color = ''; }, 1000);
      };
    }
    const copyPropsBtn = sidePanel.querySelector('#btn-copy-props');
    if (copyPropsBtn) {
      copyPropsBtn.onclick = () => {
        copyToClipboard(JSON.stringify(safeClone(props), null, 2));
        copyPropsBtn.style.color = '#22c55e';
        setTimeout(() => { if (copyPropsBtn) copyPropsBtn.style.color = ''; }, 1000);
      };
    }
    const copyStateBtn = sidePanel.querySelector('#btn-copy-state');
    if (copyStateBtn && state) {
      copyStateBtn.onclick = () => {
        copyToClipboard(JSON.stringify(safeClone(state), null, 2));
        copyStateBtn.style.color = '#22c55e';
        setTimeout(() => { if (copyStateBtn) copyStateBtn.style.color = ''; }, 1000);
      };
    }

    // Class Toggle Logic
    sidePanel.querySelectorAll('.ri-event-pill').forEach(pill => {
      pill.onclick = () => {
        const className = pill.getAttribute('data-class');
        if (currentTargetElement && currentTargetElement.classList) {
          currentTargetElement.classList.toggle(className);
          pill.style.opacity = currentTargetElement.classList.contains(className) ? '1' : '0.3';
        }
      };
    });

    const resetClassesBtn = sidePanel.querySelector('#btn-reset-classes');
    if (resetClassesBtn) {
      resetClassesBtn.onclick = () => {
        if (currentTargetElement) {
          currentTargetElement.className = classStr;
          updatePanel();
        }
      };
    }

    const copyNameBtn = sidePanel.querySelector('#btn-copy-name');
    if (copyNameBtn) {
      copyNameBtn.onclick = () => {
        copyToClipboard(name);
        const success = sidePanel.querySelector('#copy-name-success');
        if (success) {
          success.style.display = 'inline';
          setTimeout(() => { if (success) success.style.display = 'none'; }, 1500);
        }
      };
    }

    const themeToggle = sidePanel.querySelector('#theme-toggle-btn');
    if (themeToggle) {
      themeToggle.onclick = () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        sidePanel.className = `ri-panel ri-panel-container ${currentTheme}`;
        themeToggle.innerHTML = currentTheme === 'dark' ? moonIcon : sunIcon;
      };
    }

    const dropperBtn = sidePanel.querySelector('#btn-eyedropper');
    if (dropperBtn) {
      dropperBtn.onclick = async () => {
        if (!window.EyeDropper) {
          alert('EyeDropper API not supported in this browser. Please use Chrome 95+');
          return;
        }
        const dropper = new EyeDropper();
        try {
          const result = await dropper.open();
          const hex = result.sRGBHex.toUpperCase();
          copyToClipboard(hex);
          if (!recentColors.includes(hex)) {
            recentColors.unshift(hex);
            if (recentColors.length > 10) recentColors.pop();
          }
          updatePanel();
        } catch (e) {
          if (e.name !== 'AbortError') {
            console.warn('EyeDropper error:', e);
          }
        }
      };
    }

    sidePanel.querySelectorAll('.ri-mini-swatch').forEach(swatch => {
      swatch.onclick = (e) => {
        const colorToCopy = swatch.getAttribute('data-copy');
        if (colorToCopy) {
          copyToClipboard(colorToCopy);
          const originalBg = swatch.style.background;
          swatch.style.border = '2px solid #22c55e';
          setTimeout(() => {
            swatch.style.border = '1px solid var(--ri-border)';
          }, 1000);
        }
      };
    });

    const copyJsxBtn = sidePanel.querySelector('#btn-copy-jsx');
    if (copyJsxBtn) {
      copyJsxBtn.onclick = (e) => {
        const propStrings = Object.entries(props)
          .filter(([k]) => k !== 'children' && typeof props[k] !== 'function')
          .map(([k, v]) => {
            if (typeof v === 'string') return `${k}="${v}"`;
            if (typeof v === 'object' && v !== null) return `${k}={{${JSON.stringify(v, null, 1).replace(/\n/g, '').replace(/\s+/g, ' ')}}}`;
            return `${k}={${v}}`;
          });
        const jsx = `<${name}\n  ${propStrings.join('\n  ')}\n/>`;
        copyToClipboard(jsx);
        const originalText = e.currentTarget.textContent;
        e.currentTarget.textContent = 'Copied!';
        setTimeout(() => { if (e.currentTarget) e.currentTarget.textContent = originalText; }, 1500);
      };
    }

    const filterInput = sidePanel.querySelector('#prop-filter');
    if (filterInput) {
      filterInput.oninput = (e) => {
        const q = e.target.value.toLowerCase();
        const filt = (d) => Object.keys(d).filter(k => k.toLowerCase().includes(q) || JSON.stringify(d[k]).toLowerCase().includes(q)).reduce((o, k) => { o[k] = d[k]; return o; }, {});
        const propsPre = sidePanel.querySelector('#pre-props');
        if (propsPre) propsPre.textContent = JSON.stringify(filt(safeClone(props)), null, 2);
        const statePre = sidePanel.querySelector('#pre-state');
        if (state && statePre) statePre.textContent = JSON.stringify(filt(safeClone(state)), null, 2);
      };
    }
  };

  const handleGlobalSearch = (query) => {
    const q = (query || '').toLowerCase();
    let matches = 0;

    // Clear all existing highlights
    document.querySelectorAll('.ri-search-highlight').forEach(el => el.classList.remove('ri-search-highlight'));

    if (q.length > 2) {
      document.querySelectorAll('*').forEach(el => {
        const f = getFiber(el);
        if (f) {
          const name = String(getComponentName(f) || '').toLowerCase();
          if (name.includes(q)) {
            el.classList.add('ri-search-highlight');
            matches++;
          }
        }
      });
    }

    const countDisplay = document.getElementById('search-match-count');
    if (countDisplay) {
      countDisplay.textContent = `Matches found: ${matches}`;
    }
  };

  // --- Core Events ---
  window.addEventListener('mouseover', (e) => {
    if (!isDevMode || isOverlayHidden) return;
    if (e.target.closest('.ri-panel')) return;
    const f = getFiber(e.target);
    if (f) {
      initUI();
      const target = getComponentFiber(f);
      const rect = e.target.getBoundingClientRect();
      if (overlay) {
        overlay.style.display = 'block';
        overlay.style.top = `${rect.top}px`; overlay.style.left = `${rect.left}px`;
        overlay.style.width = `${rect.width}px`; overlay.style.height = `${rect.height}px`;
        const label = overlay.querySelector('.ri-name-label');
        if (label) label.textContent = getComponentName(target);
      }
    } else { if (overlay) overlay.style.display = 'none'; }
  });

  window.addEventListener('click', (e) => {
    if (!isDevMode || e.target.closest('.ri-panel')) return;
    const f = getFiber(e.target);
    if (f) {
      e.preventDefault(); e.stopPropagation();
      updatePanel(getComponentFiber(f), e.target);
    }
  }, true);

  window.addEventListener('keydown', (e) => {
    const k = (e.key || '').toLowerCase();
    if (e.altKey && k === 'i') {
      isDevMode = !isDevMode;
      initUI();
      if (!isDevMode) {
        if (overlay) overlay.style.display = 'none';
        if (sidePanel) sidePanel.style.display = 'none';
        document.querySelectorAll('.ri-search-highlight').forEach(el => el.classList.remove('ri-search-highlight'));
      }
    }
    if (e.altKey && k === 's') {
      if (!isDevMode) return;
      isSearchMode = !isSearchMode;
      if (!sidePanel) initUI();
      if (sidePanel && sidePanel.style.display === 'none') {
        updatePanel();
      } else if (sidePanel) {
        updatePanel();
      }
      if (isSearchMode && sidePanel) {
        setTimeout(() => sidePanel.querySelector('#comp-search-inline')?.focus(), 50);
      } else {
        document.querySelectorAll('.ri-search-highlight').forEach(el => el.classList.remove('ri-search-highlight'));
      }
    }
  });

  console.log('%c React Inspector Pro 2.6.0 Loaded ', 'background:#3b82f6; color:white; font-weight:bold; padding:4px;');
})();