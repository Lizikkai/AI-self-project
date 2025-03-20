export function setupCacheClear() {
  window.addEventListener('beforeunload', () => {
    localStorage.removeItem('selected-menu-key');
  });
}