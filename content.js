/**
 * content.js
 * Injects a guarded loader that will only load the obfuscated file if extension runtime is present.
 */

const injectScript = () => {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('dist/loader.js');
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
};

// Inject the loader immediately on page load
injectScript();

window.addEventListener('message', (event) => {
  if (event.data.type === 'REACT_INSPECTOR_DATA') {
    console.log('%c React Inspector ', 'background: #3b82f6; color: #fff; border-radius: 2px;', event.data.details);
  }
});