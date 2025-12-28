/**
 * inject.js - React Inspector Pro (Enterprise Suite)
 * Features: Prop/State/Ref/Style Inspection, JSX Export, a11y Audit, Performance, Event Map.
 * VERSION: 1.8.3 - Restored & Enhanced Search Logic (Alt+S).
 */

(function() {
  // --- Global State ---
  let isDevMode = false;
  let isSearchMode = false;
  let isLayerMode = false;
  let isOverlayHidden = false;
  
  const savedTheme = localStorage.getItem('ri-theme');
  let currentTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  let overlay = null;
  let sidePanel = null;
  let searchOverlay = null;
  let allLayers = [];

  let isDragging = false;
  let offsetX, offsetY;
  let tempVarCounter = 1;

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
        background: var(--ri-bg); color: var(--ri-text); box-shadow: var(--ri-shadow); 
        border: 1px solid var(--ri-border); transition: all 0.2s;
        display: flex; flex-direction: column;
      }
      .ri-code-block { 
        background: var(--ri-code-bg); color: var(--ri-code-text); border: 1px solid var(--ri-border); 
        font-family: 'Fira Code', monospace; font-size: 11px;
      }
      .ri-breadcrumb { background: var(--ri-header-bg); color: var(--ri-text-dim); }
      
      #theme-toggle-btn, .ri-copy-icon-btn, .ri-action-btn { 
        cursor: pointer; background: none; border: none; color: var(--ri-text-dim); 
        display: flex; align-items: center; justify-content: center;
        padding: 4px; border-radius: 4px; transition: all 0.2s;
      }
      #theme-toggle-btn:hover, .ri-copy-icon-btn:hover, .ri-action-btn:hover { 
        background: var(--ri-border); color: var(--ri-accent); 
      }
      .ri-section-title { 
        color: var(--ri-text-dim); font-size: 10px; font-weight: bold; text-transform: uppercase; 
        margin-bottom: 8px; margin-top: 16px; border-bottom: 1px solid var(--ri-border);
        display: flex; justify-content: space-between; align-items: center;
      }
      .ri-drag-handle { cursor: move; user-select: none; }
      
      .ri-prop-filter {
        width: 100%; background: var(--ri-code-bg); border: 1px solid var(--ri-border);
        color: var(--ri-text); padding: 8px; border-radius: 6px; font-size: 11px; margin-bottom: 8px; outline: none;
      }

      .ri-perf-tag { font-size: 9px; padding: 2px 4px; border-radius: 3px; font-weight: bold; }
      .ri-perf-fast { background: #dcfce7; color: #166534; }
      .ri-perf-slow { background: #fee2e2; color: #991b1b; }

      .ri-audit-box {
        background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412;
        padding: 12px; border-radius: 8px; font-size: 11px; margin-bottom: 16px; line-height: 1.5;
      }
      .dark .ri-audit-box { background: #431407; border: 1px solid #7c2d12; color: #fdba74; }

      .ri-class-badge {
        background: var(--ri-header-bg); border: 1px solid var(--ri-border);
        border-radius: 6px; padding: 8px; font-size: 10px; margin-bottom: 12px; font-family: monospace; word-break: break-all;
      }

      .ri-event-pill {
        color: var(--ri-accent); background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.2); padding: 2px 6px; border-radius: 4px; font-size: 9px; margin-right: 4px;
      }

      .ri-layer-outline {
        position: fixed; pointer-events: none; z-index: 2147483646;
        border: 1px solid rgba(59, 130, 246, 0.4); background: rgba(59, 130, 246, 0.05);
      }

      .ri-btn-group { display: flex; gap: 4px; }
      .ri-small-btn { font-size: 9px; padding: 5px 10px; border: 1px solid var(--ri-border); border-radius: 4px; cursor: pointer; background: var(--ri-bg); color: var(--ri-text-dim); transition: all 0.2s; }
      
      /* Fixed Hover Colors */
      .ri-small-btn:hover { border-color: var(--ri-accent); color: var(--ri-accent); background: var(--ri-header-bg); }
      
      .ri-primary-btn { background: var(--ri-accent); color: white; border: none; font-weight: bold; }
      .ri-primary-btn:hover { background: var(--ri-accent) !important; color: white !important; opacity: 0.85; transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3); }
      
      .ri-computed-box {
        border-left: 3px solid var(--ri-accent);
        background: var(--ri-code-bg);
        margin-bottom: 16px;
        border-radius: 0 6px 6px 0;
      }
      
      .ri-search-match-info {
        font-size: 10px;
        color: var(--ri-accent);
        font-weight: bold;
        margin-top: 8px;
        display: block;
      }

      .ri-search-highlight {
        box-shadow: 0 0 0 3px var(--ri-accent) inset, 0 0 20px var(--ri-accent);
        transition: box-shadow 0.2s;
      }

      .ri-copy-success {
        color: #22c55e;
        font-size: 10px;
        font-weight: bold;
        animation: ri-fade-in-out 1.5s forwards;
      }
      @keyframes ri-fade-in-out {
        0% { opacity: 0; transform: scale(0.8); }
        20% { opacity: 1; transform: scale(1); }
        80% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0.8); }
      }
    `;
    document.head.appendChild(style);
  };

  // --- Utilities ---

  const safeClone = (obj, depth = 0, seen = new WeakSet()) => {
    if (depth > 4) return '[Object]'; 
    if (obj === null || typeof obj !== 'object') {
      if (typeof obj === 'function') return `[Function: ${obj.name || 'anon'}]`;
      return obj;
    }
    if (seen.has(obj)) return '[Circular]';
    if (obj.nodeType) return `[DOM: ${obj.nodeName}]`;
    seen.add(obj);
    if (Array.isArray(obj)) return obj.map(item => safeClone(item, depth + 1, seen));
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

  const getFiber = (el) => {
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
  const logoIcon = `<svg viewBox="-11.5 -10.23174 23 20.46348" fill="none" stroke="#3b82f6" stroke-width="1.2"><circle cx="0" cy="0" r="2.05" fill="#3b82f6"/><g><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></g></svg>`;
  const copyIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>`;
  const sunIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/></svg>`;
  const moonIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;

  // --- UI Logic ---

  const initUI = () => {
    if (overlay) return;
    injectStyles();

    overlay = document.createElement('div');
    overlay.style.cssText = `position:fixed;pointer-events:none;z-index:2147483647;border:2px solid var(--ri-accent);background:rgba(59,130,246,0.1);display:none;`;
    const label = document.createElement('div');
    label.style.cssText = `position:absolute;top:-22px;left:-2px;background:var(--ri-accent);color:white;font-size:10px;font-weight:bold;padding:2px 6px;border-radius:2px;`;
    overlay.appendChild(label);
    document.body.appendChild(overlay);

    sidePanel = document.createElement('div');
    sidePanel.className = `ri-panel ri-panel-container ${currentTheme}`;
    sidePanel.style.cssText = `position:fixed;top:15px;right:15px;width:340px;max-height:90vh;z-index:2147483647;border-radius:12px;display:none;`;
    document.body.appendChild(sidePanel);

    searchOverlay = document.createElement('div');
    searchOverlay.className = `ri-panel ri-panel-container ${currentTheme}`;
    searchOverlay.style.cssText = `position:fixed;top:20%;left:50%;transform:translateX(-50%);width:400px;z-index:2147483647;border-radius:12px;padding:20px;display:none;border-color:var(--ri-accent);`;
    searchOverlay.innerHTML = `
      <div style="font-weight:bold; font-size:12px; margin-bottom:10px; color:var(--ri-accent);">COMPONENT SEARCH</div>
      <input type="text" id="comp-search" placeholder="Type component name..." style="width:100%;background:var(--ri-header-bg);border:1px solid var(--ri-border);color:var(--ri-text);padding:10px;border-radius:6px;outline:none;">
      <span id="search-match-count" class="ri-search-match-info">Matches found: 0</span>
    `;
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
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) themeIcon.innerHTML = currentTheme === 'dark' ? moonIcon : sunIcon;
  };

  const updatePanel = (targetFiber, element) => {
    sidePanel.style.display = 'flex';
    const hierarchy = getHierarchy(targetFiber);
    const props = targetFiber.memoizedProps || {};
    const state = targetFiber.memoizedState;
    const name = getComponentName(targetFiber);
    
    // Feature: Computed Style Explorer
    const computedStyles = window.getComputedStyle(element);
    const essentialStyles = {
      display: computedStyles.display,
      position: computedStyles.position,
      width: computedStyles.width,
      height: computedStyles.height,
      margin: computedStyles.margin,
      padding: computedStyles.padding,
      fontSize: computedStyles.fontSize,
      color: computedStyles.color,
      backgroundColor: computedStyles.backgroundColor,
      borderRadius: computedStyles.borderRadius,
      boxShadow: computedStyles.boxShadow
    };

    const audit = [];
    if (element.tagName === 'IMG' && !element.alt) audit.push('Missing <code>alt</code> attribute.');
    if (element.tagName === 'BUTTON' && !element.innerText && !element.getAttribute('aria-label')) audit.push('Missing accessible label.');
    
    const classes = element.className || "";
    const classArray = typeof classes === 'string' ? classes.split(/\s+/).filter(Boolean) : [];
    if (classArray.length > 12) audit.push(`<strong>CSS Bloat:</strong> Component has ${classArray.length} classes.`);

    const renderTime = targetFiber.actualDuration ? targetFiber.actualDuration.toFixed(2) : '0.00';
    const events = Object.keys(props).filter(k => k.startsWith('on') && typeof props[k] === 'function');

    sidePanel.innerHTML = `
      <div class="ri-drag-handle" style="padding:16px;background:var(--ri-header-bg);border-bottom:1px solid var(--ri-border);display:flex;justify-content:space-between;align-items:center;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:20px;">${logoIcon}</div>
          <span style="font-weight:bold;font-size:11px;">REACT INSPECTOR</span>
          <button id="theme-toggle-btn" style="margin-left:8px;">
            <span id="theme-icon">${currentTheme === 'dark' ? moonIcon : sunIcon}</span>
          </button>
        </div>
        <button id="ri-close" style="font-size:20px;cursor:pointer;background:none;border:none;color:var(--ri-text-dim);">&times;</button>
      </div>
      <div style="padding:16px;overflow-y:auto;flex:1;">
        <div style="margin-bottom:12px;">
           <div class="ri-section-title" style="margin-top:0;">Hierarchy</div>
           <div style="font-size:10px;display:flex;flex-wrap:wrap;gap:4px;">
            ${hierarchy.reverse().map(n => `<span class="ri-breadcrumb" style="padding:2px 6px;border-radius:4px;">${n}</span>`).join('<span>&gt;</span>')}
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <h2 style="font-size:18px;font-weight:800;color:var(--ri-text);">&lt;${name} /&gt;</h2>
          <span class="ri-perf-tag ${renderTime > 1.5 ? 'ri-perf-slow' : 'ri-perf-fast'}">${renderTime}ms</span>
        </div>

        <div style="margin-bottom:16px; display:flex; gap:8px;">
           <button class="ri-small-btn ri-primary-btn" id="btn-copy-jsx">Export as JSX</button>
           <button class="ri-small-btn" id="btn-log-fiber">Log Fiber</button>
        </div>

        ${events.length > 0 ? `<div style="margin-bottom:12px;">${events.map(e => `<span class="ri-event-pill">${e}</span>`).join('')}</div>` : ''}

        <div class="ri-section-title">
          <span>Classes & Styles</span>
          <button class="ri-small-btn" id="btn-toggle-classes">Reset</button>
        </div>
        ${classes ? `
          <div class="ri-class-badge">
            <div style="color:var(--ri-accent);font-weight:bold;font-size:9px;text-transform:uppercase;margin-bottom:4px;">CSS Classes</div>
            <div id="class-container" style="display:flex; flex-wrap:wrap; gap:4px;">
              ${classArray.map(c => `<span class="ri-event-pill" style="cursor:pointer; background:var(--ri-border); color:var(--ri-text);" onclick="this.style.opacity = this.style.opacity === '0.3' ? '1' : '0.3'; window._ri_toggle_class('${c}')">${c}</span>`).join('')}
            </div>
          </div>` : ''}
          
        <div style="color:var(--ri-accent);font-weight:bold;font-size:9px;text-transform:uppercase;margin-bottom:4px;">Computed CSS Explorer</div>
        <div class="ri-computed-box">
          <pre class="ri-code-block" style="padding:10px;border:none;max-height:150px;overflow-y:auto;background:transparent;">${JSON.stringify(essentialStyles, null, 2)}</pre>
        </div>

        ${audit.length > 0 ? `
          <div class="ri-audit-box">
            <div style="font-weight:bold;margin-bottom:6px;font-size:10px;text-transform:uppercase;">⚡ Component Audit</div>
            ${audit.map(a => `<div style="margin-bottom:4px;">• ${a}</div>`).join('')}
          </div>
        ` : ''}

        <input type="text" id="prop-filter" class="ri-prop-filter" placeholder="Filter props or state values...">

        <div class="ri-section-title">
          <span>Component Props</span>
          <div class="ri-btn-group">
            <button class="ri-small-btn" id="btn-map-props">Map temp1</button>
            <button class="ri-copy-icon-btn" id="copy-props">${copyIcon}</button>
          </div>
        </div>
        <pre id="pre-props" class="ri-code-block" style="padding:10px;border-radius:8px;overflow-x:auto;">${JSON.stringify(safeClone(props), null, 2)}</pre>

        ${state ? `
          <div class="ri-section-title">
            <span>Component State</span>
            <div class="ri-btn-group">
              <button class="ri-small-btn" id="btn-map-state">Map temp2</button>
              <button class="ri-copy-icon-btn" id="copy-state">${copyIcon}</button>
            </div>
          </div>
          <pre id="pre-state" class="ri-code-block" style="padding:10px;border-radius:8px;overflow-x:auto;">${JSON.stringify(safeClone(state), null, 2)}</pre>
        ` : ''}
      </div>
    `;

    window._ri_toggle_class = (className) => element.classList.toggle(className);
    sidePanel.querySelector('#ri-close').onclick = () => sidePanel.style.display = 'none';
    sidePanel.querySelector('#theme-toggle-btn').onclick = toggleTheme;
    sidePanel.querySelector('#btn-log-fiber').onclick = () => console.log(`[Fiber: ${name}]`, targetFiber);
    
    // Feature: Export to JSX Snippet logic
    sidePanel.querySelector('#btn-copy-jsx').onclick = (e) => {
       const propStrings = Object.entries(props)
         .filter(([k]) => k !== 'children' && typeof props[k] !== 'function')
         .map(([k, v]) => {
           if (typeof v === 'string') return `${k}="${v}"`;
           if (typeof v === 'object' && v !== null) return `${k}={{${JSON.stringify(v, null, 1).replace(/\n/g, '').replace(/\s+/g, ' ')}}}`;
           return `${k}={${v}}`;
         });
       
       const jsx = `<${name}\n  ${propStrings.join('\n  ')}\n/>`;
       navigator.clipboard.writeText(jsx);
       const btn = e.currentTarget;
       btn.innerText = 'Copied!';
       setTimeout(() => btn.innerText = 'Export as JSX', 1500);
    };

    const mapToConsole = (data, type) => {
      const varName = `temp${tempVarCounter++}`;
      window[varName] = data;
      console.log(`%c [React Inspector] %c ${name} ${type} mapped to %c window.${varName} `, 'color: #3b82f6; font-weight: bold', 'color: inherit', 'color: #3b82f6; font-weight: bold; background: #3b82f622');
    };

    sidePanel.querySelector('#btn-map-props').onclick = () => mapToConsole(props, 'Props');
    if (state) sidePanel.querySelector('#btn-map-state').onclick = () => mapToConsole(state, 'State');
    if (sidePanel.querySelector('#btn-toggle-classes')) {
      sidePanel.querySelector('#btn-toggle-classes').onclick = () => {
        element.className = classes;
        updatePanel(targetFiber, element);
      };
    }

    const filterInput = sidePanel.querySelector('#prop-filter');
    filterInput.oninput = (e) => {
      const q = e.target.value.toLowerCase();
      const filt = (d) => Object.keys(d).filter(k => k.toLowerCase().includes(q) || JSON.stringify(d[k]).toLowerCase().includes(q)).reduce((o, k) => { o[k] = d[k]; return o; }, {});
      sidePanel.querySelector('#pre-props').innerText = JSON.stringify(filt(safeClone(props)), null, 2);
      if (state) sidePanel.querySelector('#pre-state').innerText = JSON.stringify(filt(safeClone(state)), null, 2);
    };
  };

  // --- Core Events ---

  window.addEventListener('mouseover', (e) => {
    if (!isDevMode || isOverlayHidden || isLayerMode) return;
    const f = getFiber(e.target);
    if (f) {
      const target = getComponentFiber(f);
      const rect = e.target.getBoundingClientRect();
      overlay.style.display = 'block';
      overlay.style.top = `${rect.top + window.scrollY}px`; overlay.style.left = `${rect.left + window.scrollX}px`;
      overlay.style.width = `${rect.width}px`; overlay.style.height = `${rect.height}px`;
      overlay.querySelector('div').innerText = getComponentName(target);
    }
  });

  window.addEventListener('click', (e) => {
    if (!isDevMode || e.target.closest('.ri-panel')) return;
    const f = getFiber(e.target);
    if (f) {
      e.preventDefault(); e.stopPropagation();
      const target = getComponentFiber(f);
      updatePanel(target, e.target);
    }
  }, true);

  // Search Input Event Listener (FIXED)
  document.addEventListener('input', (e) => {
    if (e.target.id === 'comp-search') {
      const query = (e.target.value || '').toLowerCase();
      let matches = 0;
      
      document.querySelectorAll('*').forEach(el => {
        const f = getFiber(el);
        if (f) {
          const name = String(getComponentName(f) || '').toLowerCase();
          if (query.length > 2 && name.includes(query)) {
            el.classList.add('ri-search-highlight');
            matches++;
          } else {
            el.classList.remove('ri-search-highlight');
          }
        }
      });
      
      const countDisplay = document.getElementById('search-match-count');
      if (countDisplay) {
        countDisplay.innerText = `Matches found: ${matches}`;
      }
    }
  });

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (e.altKey && k === 'i') {
      isDevMode = !isDevMode;
      initUI();
      if (!isDevMode) { 
        overlay.style.display = 'none'; 
        sidePanel.style.display = 'none'; 
        searchOverlay.style.display = 'none';
        document.querySelectorAll('.ri-search-highlight').forEach(el => el.classList.remove('ri-search-highlight'));
      }
    }
    if (e.altKey && k === 's') {
      if (!isDevMode) return;
      isSearchMode = !isSearchMode;
      searchOverlay.style.display = isSearchMode ? 'block' : 'none';
      if (isSearchMode) {
        searchOverlay.querySelector('input').focus();
      } else {
        document.querySelectorAll('.ri-search-highlight').forEach(el => el.classList.remove('ri-search-highlight'));
      }
    }
  });

  console.log('%c React Inspector Pro 1.8.3 Loaded ', 'background:#3b82f6;color:white;font-weight:bold;padding:4px;');
})();