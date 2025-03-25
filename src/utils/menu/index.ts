export function getSelectedMenuKey(): string {
  return localStorage.getItem('selected-menu-key') || '';
}

export function setSelectedMenuKey(key: string) {
  localStorage.setItem('selected-menu-key', key);
}

export function removeSelectedMenuKey() {
  localStorage.removeItem('selected-menu-key');
}