/**
 * inject.js - React Inspector Pro (Production Edition)
 * Features: Prop/State/Ref Inspection, Event Map, Performance Audit, Dual Theme, Draggable UI.
 * VERSION: 1.5.1 - Enhanced Class/Style Visibility & DOM Attribute Mapping.
 */

(function() {
  // --- Global State ---
  let isDevMode = false;
  let isSearchMode = false;
  let isLayerMode = false;
  let isOverlayHidden = false;
  
  // Persistent Theme Logic
  const savedTheme = localStorage.getItem('ri-theme');
  let currentTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  let overlay = null;
  let sidePanel = null;
  let searchOverlay = null;
  let allLayers = [];

  // Dragging state
  let isDragging = false;
  let offsetX, offsetY;

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
      }
      .ri-panel-container { 
        background: var(--ri-bg); 
        color: var(--ri-text); 
        box-shadow: var(--ri-shadow); 
        border: 1px solid var(--ri-border); 
        transition: background 0.2s, color 0.2s;
        display: flex;
        flex-direction: column;
      }
      .ri-code-block { 
        background: var(--ri-code-bg); 
        color: var(--ri-code-text); 
        border: 1px solid var(--ri-border); 
        font-family: 'Fira Code', 'JetBrains Mono', 'Courier New', monospace; 
      }
      .ri-breadcrumb { background: var(--ri-header-bg); color: var(--ri-text-dim); }
      
      #theme-toggle-btn, .ri-copy-icon-btn, .ri-action-btn { 
        cursor: pointer; 
        background: none; 
        border: none; 
        color: var(--ri-text-dim); 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        padding: 4px; 
        border-radius: 4px; 
        transition: all 0.2s; 
      }
      #theme-toggle-btn:hover, .ri-copy-icon-btn:hover, .ri-action-btn:hover { 
        background: var(--ri-border); 
        color: var(--ri-accent); 
      }
      .ri-section-title { 
        color: var(--ri-text-dim); 
        font-size: 10px; 
        font-weight: bold; 
        text-transform: uppercase; 
        margin-bottom: 8px; 
        margin-top: 16px; 
        border-bottom: 1px solid var(--ri-border); 
        padding-bottom: 4px; 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
      }
      .ri-drag-handle { cursor: move; user-select: none; }
      
      .ri-prop-filter {
        width: 100%;
        background: var(--ri-code-bg);
        border: 1px solid var(--ri-border);
        color: var(--ri-text);
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 11px;
        margin-bottom: 8px;
        outline: none;
      }
      .ri-prop-filter:focus { border-color: var(--ri-accent); }

      @keyframes ri-pulse {
        0% { outline: 4px solid var(--ri-accent); outline-offset: 0px; }
        100% { outline: 4px solid transparent; outline-offset: 20px; }
      }
      .ri-locate-pulse { animation: ri-pulse 0.8s ease-out; }

      @keyframes ri-fade-in-out {
        0% { opacity: 0; transform: scale(0.8); }
        20% { opacity: 1; transform: scale(1); }
        80% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0.8); }
      }
      .ri-copy-success {
        color: #22c55e;
        font-size: 10px;
        font-weight: bold;
        animation: ri-fade-in-out 1.5s forwards;
      }
      .ri-logo-container svg { display: block; width: 20px; height: 20px; }
      .ri-perf-tag { font-size: 9px; padding: 2px 4px; border-radius: 3px; font-weight: bold; margin-left: 6px; }
      .ri-perf-fast { background: #dcfce7; color: #166534; }
      .ri-perf-slow { background: #fee2e2; color: #991b1b; }

      .ri-layer-outline {
        position: fixed;
        pointer-events: none;
        z-index: 2147483646;
        border: 1px solid rgba(59, 130, 246, 0.4);
        background: rgba(59, 130, 246, 0.05);
      }

      .ri-perf-advice {
        background: #fff7ed;
        border: 1px solid #fed7aa;
        color: #9a3412;
        padding: 12px;
        border-radius: 8px;
        font-size: 11px;
        margin-bottom: 16px;
        line-height: 1.5;
      }
      .dark .ri-perf-advice {
        background: #431407;
        border: 1px solid #7c2d12;
        color: #fdba74;
      }
      .ri-advice-item { margin-bottom: 6px; display: flex; gap: 8px; }
      .ri-advice-item:last-child { margin-bottom: 0; }
      
      .ri-event-pill {
        color: var(--ri-accent);
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.2);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 9px;
      }

      .ri-class-box {
        background: var(--ri-header-bg);
        border: 1px solid var(--ri-border);
        border-radius: 6px;
        padding: 8px;
        font-size: 11px;
        color: var(--ri-text);
        margin-bottom: 12px;
        word-break: break-all;
      }
      .ri-class-label {
        font-size: 9px;
        font-weight: bold;
        color: var(--ri-accent);
        text-transform: uppercase;
        margin-bottom: 4px;
      }
    `;
    document.head.appendChild(style);
  };

  // --- Utilities ---

  const safeClone = (obj, depth = 0, seen = new WeakSet()) => {
    if (depth > 4) return '[Object]'; 
    if (obj === null || typeof obj !== 'object') {
      if (typeof obj === 'function') return `[Function: ${obj.name || 'anon'}]`;
      if (typeof obj === 'symbol') return obj.toString();
      return obj;
    }
    if (seen.has(obj)) return '[Circular]';
    if (obj.nodeType || obj instanceof Window) return `[DOM: ${obj.nodeName || 'Window'}]`;
    seen.add(obj);
    if (Array.isArray(obj)) return obj.map(item => safeClone(item, depth + 1, seen));
    const cloned = {};
    const internalKeys = ['_owner', '_store', '_self', '_source', 'alternate', 'stateNode', 'return', 'child', 'sibling', 'dependencies', 'updateQueue'];
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (internalKeys.includes(key) || key.startsWith('$$') || key.startsWith('__')) continue;
        if (key === 'children') {
          cloned[key] = Array.isArray(obj[key]) ? `[Array(${obj[key].length})]` : '[React Element]';
          continue;
        }
        try { cloned[key] = safeClone(obj[key], depth + 1, seen); } catch (e) { cloned[key] = '[Complex Value]'; }
      }
    }
    return cloned;
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

  // --- UI Assets ---
  const logoIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-11.5 -10.23174 23 20.46348" fill="none" stroke="#3b82f6" stroke-width="1.2"><circle cx="0" cy="0" r="2.05" fill="#3b82f6"/><g><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></g></svg>`;
  const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/></svg>`;
  const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
  const copyIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>`;
  const eyeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
  const eyeOffIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`;
  const locateIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>`;

  // --- UI Logic ---

  const initUI = () => {
    if (overlay) return;
    injectStyles();

    overlay = document.createElement('div');
    overlay.style.cssText = `position:fixed;pointer-events:none;z-index:2147483647;border:2px solid var(--ri-accent);background:rgba(59,130,246,0.1);display:none;`;
    const label = document.createElement('div');
    label.style.cssText = `position:absolute;top:-22px;left:-2px;background:var(--ri-accent);color:white;font-size:10px;font-weight:bold;padding:2px 6px;border-radius:2px;font-family:monospace;`;
    overlay.appendChild(label);
    document.body.appendChild(overlay);

    sidePanel = document.createElement('div');
    sidePanel.className = `ri-panel ri-panel-container ${currentTheme}`;
    sidePanel.style.cssText = `position:fixed;top:15px;right:15px;width:340px;max-height:90vh;z-index:2147483647;border-radius:12px;display:none;`;
    document.body.appendChild(sidePanel);

    searchOverlay = document.createElement('div');
    searchOverlay.className = `ri-panel ri-panel-container ${currentTheme}`;
    searchOverlay.style.cssText = `position:fixed;top:20%;left:50%;transform:translateX(-50%);width:400px;z-index:2147483647;border-radius:12px;padding:20px;display:none;border-color:var(--ri-accent);`;
    searchOverlay.innerHTML = `<input type="text" id="comp-search" placeholder="Search Component Name..." style="width:100%;background:var(--ri-header-bg);border:1px solid var(--ri-border);color:var(--text);padding:10px;border-radius:6px;outline:none;">`;
    document.body.appendChild(searchOverlay);

    const handleMouseDown = (e) => {
      const handle = e.target.closest('.ri-drag-handle');
      if (!handle || e.target.closest('button')) return;
      isDragging = true;
      const rect = sidePanel.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
    };
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      sidePanel.style.left = `${e.clientX - offsetX}px`;
      sidePanel.style.top = `${e.clientY - offsetY}px`;
      sidePanel.style.right = 'auto';
    };
    const handleMouseUp = () => isDragging = false;
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const toggleTheme = () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('ri-theme', currentTheme);
    sidePanel.className = `ri-panel ri-panel-container ${currentTheme}`;
    searchOverlay.className = `ri-panel ri-panel-container ${currentTheme}`;
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) themeIcon.innerHTML = currentTheme === 'dark' ? moonIcon : sunIcon;
  };

  const toggleLayerMode = () => {
    isLayerMode = !isLayerMode;
    allLayers.forEach(l => l.remove());
    allLayers = [];
    if (isLayerMode) {
      document.querySelectorAll('*').forEach(el => {
        const f = getFiber(el);
        if (f && f.stateNode === el) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const l = document.createElement('div');
            l.className = 'ri-layer-outline';
            l.style.top = `${rect.top + window.scrollY}px`;
            l.style.left = `${rect.left + window.scrollX}px`;
            l.style.width = `${rect.width}px`;
            l.style.height = `${rect.height}px`;
            document.body.appendChild(l);
            allLayers.push(l);
          }
        }
      });
    }
  };

  const updatePanel = (details, targetComp, elementFiber) => {
    const hierarchy = getHierarchy(targetComp);
    sidePanel.style.display = 'flex';
    
    const props = targetComp.memoizedProps || {};
    const cleanedCompProps = safeClone(props);
    const cleanedCompState = safeClone(targetComp.memoizedState);
    const elementProps = elementFiber.memoizedProps || {};
    const cleanedElementProps = safeClone(elementProps);
    const cleanedRefs = targetComp.ref ? safeClone(targetComp.ref) : (targetComp.memoizedProps?.ref ? safeClone(targetComp.memoizedProps.ref) : null);
    
    // Summary Data for quick viewing
    const className = elementProps.className || elementProps.class || details.className || "";
    const styleProp = safeClone(elementProps.style);

    const isSame = targetComp === elementFiber;
    const events = Object.keys(props).filter(k => k.startsWith('on') && typeof props[k] === 'function');
    const renderTime = targetComp.actualDuration ? targetComp.actualDuration.toFixed(2) : '0.00';
    const isSlow = parseFloat(renderTime) > 1.5;

    const source = targetComp._debugSource || (targetComp.type && targetComp.type._source);
    const sourceInfo = source ? `${source.fileName.split('/').pop()}:${source.lineNumber}` : 'Unknown';

    const insights = [];
    if (isSlow) insights.push(`<strong>Render Speed:</strong> Slow render detected (${renderTime}ms). Consider using <code>React.memo()</code>.`);
    if (Object.keys(props).length > 10) insights.push(`<strong>Prop Bloat:</strong> Component has too many props. Consider grouping.`);
    if (hierarchy.length > 4) insights.push(`<strong>Tree Depth:</strong> Deep nesting detected. Consider Context API.`);

    sidePanel.innerHTML = `
      <div class="ri-drag-handle" style="padding:16px;background:var(--ri-header-bg);border-bottom:1px solid var(--ri-border);display:flex;justify-content:space-between;align-items:center;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="ri-logo-container">${logoIcon}</div>
          <span style="font-weight:700;color:var(--ri-accent);font-size:11px;letter-spacing:1px;">REACT INSPECTOR</span>
          <button id="theme-toggle-btn" title="Toggle Theme" style="pointer-events: auto;">
            <span id="theme-icon">${currentTheme === 'dark' ? moonIcon : sunIcon}</span>
          </button>
        </div>
        <button id="ri-close" style="cursor:pointer;background:none;border:none;color:var(--ri-text-dim);font-size:20px;">&times;</button>
      </div>
      <div style="padding:16px;overflow-y:auto;flex:1;">
        <div style="margin-bottom:16px;">
          <div class="ri-section-title" style="margin-top:0;">Hierarchy</div>
          <div style="font-size:10px;display:flex;flex-wrap:wrap;gap:4px;">
            ${hierarchy.reverse().map(name => `<span class="ri-breadcrumb" style="padding:2px 6px;border-radius:4px;">${name}</span>`).join('<span>&gt;</span>')}
          </div>
        </div>
        
        <div style="margin-bottom:12px;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
             <h2 style="font-size:18px;font-weight:800;color:var(--ri-text);margin:0;">&lt;${details.name} /&gt;</h2>
             <span class="ri-perf-tag ${isSlow ? 'ri-perf-slow' : 'ri-perf-fast'}">${renderTime}ms</span>
          </div>
          <div style="font-size:10px;color:var(--ri-text-dim);margin-top:4px;display:flex;justify-content:space-between;">
             <span>File: ${sourceInfo}</span>
             <span>Tag: ${details.tagName.toLowerCase()}</span>
          </div>
        </div>

        ${className ? `
        <div class="ri-class-box">
          <div class="ri-class-label">Classes</div>
          <div style="font-family: monospace; opacity: 0.9;">${className}</div>
        </div>
        ` : ''}

        ${styleProp && Object.keys(styleProp).length > 0 ? `
        <div class="ri-class-box">
          <div class="ri-class-label">Inline Styles</div>
          <pre style="font-family: monospace; font-size: 10px; margin: 0; opacity: 0.9;">${JSON.stringify(styleProp, null, 1)}</pre>
        </div>
        ` : ''}

        ${insights.length > 0 ? `
        <div class="ri-perf-advice">
          <div style="font-weight:bold; font-size:10px; text-transform:uppercase; margin-bottom:8px;">⚡ Component Audit</div>
          ${insights.map(item => `<div class="ri-advice-item">• ${item}</div>`).join('')}
        </div>
        ` : ''}

        <div style="display:flex;gap:8px;margin-bottom:16px;">
          <button id="btn-toggle-overlay" style="flex:2;background:var(--ri-accent);border:none;color:white;padding:8px;border-radius:6px;font-size:11px;cursor:pointer;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;">
            ${isOverlayHidden ? eyeIcon : eyeOffIcon} <span>${isOverlayHidden ? 'Show' : 'Hide'} Highlights</span>
          </button>
          <button id="btn-locate" title="Locate in DOM" style="flex:0.5;background:var(--ri-header-bg);border:1px solid var(--ri-border);color:var(--ri-text);border-radius:6px;display:flex;align-items:center;justify-content:center;">${locateIcon}</button>
          <button id="btn-log" title="Log to Console" style="flex:0.5;background:var(--ri-header-bg);border:1px solid var(--ri-border);color:var(--ri-text);border-radius:6px;display:flex;align-items:center;justify-content:center;">CLG</button>
        </div>

        <input type="text" id="prop-filter" class="ri-prop-filter" placeholder="Filter memory...">

        <div class="ri-section-group">
          <div class="ri-section-title"><span>Component Props</span><button class="ri-copy-icon-btn" id="btn-copy-comp">${copyIcon}</button></div>
          <pre id="pre-component" class="ri-code-block" style="padding:12px;border-radius:8px;font-size:11px;overflow-x:auto;">${JSON.stringify(cleanedCompProps, null, 2)}</pre>
        </div>

        ${cleanedCompState ? `
        <div class="ri-section-group">
          <div class="ri-section-title"><span>Component State</span><button class="ri-copy-icon-btn" id="btn-copy-state">${copyIcon}</button></div>
          <pre id="pre-state" class="ri-code-block" style="padding:12px;border-radius:8px;font-size:11px;overflow-x:auto;">${JSON.stringify(cleanedCompState, null, 2)}</pre>
        </div>
        ` : ''}

        <div class="ri-section-group">
          <div class="ri-section-title"><span>Element Attributes (DOM)</span><button class="ri-copy-icon-btn" id="btn-copy-el">${copyIcon}</button></div>
          <pre id="pre-element" class="ri-code-block" style="padding:12px;border-radius:8px;font-size:11px;overflow-x:auto;margin-bottom:12px;">${JSON.stringify(cleanedElementProps, null, 2)}</pre>
        </div>

        ${cleanedRefs ? `
        <div class="ri-section-group">
          <div class="ri-section-title"><span>Refs</span><button class="ri-copy-icon-btn" id="btn-copy-refs">${copyIcon}</button></div>
          <pre id="pre-refs" class="ri-code-block" style="padding:12px;border-radius:8px;font-size:11px;overflow-x:auto;">${JSON.stringify(cleanedRefs, null, 2)}</pre>
        </div>
        ` : ''}
      </div>
    `;

    sidePanel.querySelector('#ri-close').onclick = () => sidePanel.style.display = 'none';
    sidePanel.querySelector('#theme-toggle-btn').onclick = (e) => { e.stopPropagation(); toggleTheme(); };
    sidePanel.querySelector('#btn-log').onclick = () => console.log(`[Fiber: ${details.name}]`, targetComp);
    
    sidePanel.querySelector('#btn-locate').onclick = () => {
       const node = elementFiber.stateNode;
       if (node instanceof HTMLElement) {
          node.scrollIntoView({ behavior: 'smooth', block: 'center' });
          node.classList.add('ri-locate-pulse');
          setTimeout(() => node.classList.remove('ri-locate-pulse'), 1000);
       }
    };

    sidePanel.querySelector('#btn-toggle-overlay').onclick = (e) => {
      isOverlayHidden = !isOverlayHidden;
      if (isOverlayHidden) overlay.style.display = 'none';
      e.currentTarget.innerHTML = `${isOverlayHidden ? eyeIcon : eyeOffIcon} <span>${isOverlayHidden ? 'Show' : 'Hide'} Highlights</span>`;
    };

    sidePanel.querySelector('#prop-filter').oninput = (e) => {
      const q = e.target.value.toLowerCase();
      const filt = (d) => {
        if (!d) return null;
        return Object.keys(d).filter(k => k.toLowerCase().includes(q) || JSON.stringify(d[k]).toLowerCase().includes(q)).reduce((o, k) => { o[k] = d[k]; return o; }, {});
      };
      sidePanel.querySelector('#pre-component').innerText = JSON.stringify(filt(cleanedCompProps), null, 2);
      if (cleanedCompState) sidePanel.querySelector('#pre-state').innerText = JSON.stringify(filt(cleanedCompState), null, 2);
      sidePanel.querySelector('#pre-element').innerText = JSON.stringify(filt(cleanedElementProps), null, 2);
      if (cleanedRefs) sidePanel.querySelector('#pre-refs').innerText = JSON.stringify(filt(cleanedRefs), null, 2);
    };

    const handleCopy = (btn, data) => {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      const old = btn.innerHTML;
      btn.innerHTML = '<span class="ri-copy-success">✓ COPIED</span>';
      setTimeout(() => btn.innerHTML = old, 1500);
    };

    sidePanel.querySelector('#btn-copy-comp').onclick = (e) => handleCopy(e.currentTarget, cleanedCompProps);
    sidePanel.querySelector('#btn-copy-el').onclick = (e) => handleCopy(e.currentTarget, cleanedElementProps);
    if (cleanedCompState) sidePanel.querySelector('#btn-copy-state').onclick = (e) => handleCopy(e.currentTarget, cleanedCompState);
    if (cleanedRefs) sidePanel.querySelector('#btn-copy-refs').onclick = (e) => handleCopy(e.currentTarget, cleanedRefs);
  };

  // --- Core Events ---
  window.addEventListener('mouseover', (e) => {
    if (!isDevMode || isSearchMode || isOverlayHidden || isLayerMode) return;
    const fiber = getFiber(e.target);
    if (fiber) {
      const targetComp = getComponentFiber(fiber);
      const rect = e.target.getBoundingClientRect();
      overlay.style.display = 'block';
      overlay.style.top = `${rect.top}px`;
      overlay.style.left = `${rect.left}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
      overlay.querySelector('div').innerText = getComponentName(targetComp);
    }
  });

  window.addEventListener('click', (e) => {
    if (!isDevMode || e.target.closest('.ri-panel')) return;
    const fiber = getFiber(e.target);
    if (fiber) {
      e.preventDefault(); e.stopPropagation();
      const targetComp = getComponentFiber(fiber);
      const details = { 
        name: getComponentName(targetComp), 
        tagName: e.target.tagName,
        className: e.target.className
      };
      updatePanel(details, targetComp, fiber);
    }
  }, true);

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (e.altKey && k === 'i') {
      isDevMode = !isDevMode;
      initUI();
      if (!isDevMode) {
        overlay.style.display = 'none';
        sidePanel.style.display = 'none';
        if (isLayerMode) toggleLayerMode();
      }
      console.log(`React Inspector: ${isDevMode ? 'ENABLED' : 'DISABLED'}`);
    }
    if (e.altKey && k === 's') {
      if (!isDevMode) return;
      isSearchMode = !isSearchMode;
      searchOverlay.style.display = isSearchMode ? 'block' : 'none';
      if (isSearchMode) searchOverlay.querySelector('input').focus();
    }
    if (e.altKey && k === 'l') {
      if (!isDevMode) return;
      toggleLayerMode();
    }
  });

  // Safe Search Logic
  document.addEventListener('input', (e) => {
    if (e.target.id === 'comp-search') {
      const query = (e.target.value || '').toLowerCase();
      document.querySelectorAll('*').forEach(el => {
        const f = getFiber(el);
        if (f) {
          const name = String(getComponentName(f) || '').toLowerCase();
          if (name && name.includes(query) && query.length > 2) {
            el.style.boxShadow = "0 0 0 2px var(--ri-accent) inset";
          } else {
            el.style.boxShadow = "";
          }
        }
      });
    }
  });

  console.log('%c React Inspector Pro 1.5.1 Loaded ', 'background:#3b82f6;color:white;font-weight:bold;padding:4px;border-radius:4px;');
})();