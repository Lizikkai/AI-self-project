import { getToken } from "../auth";
import { removeSelectedMenuKey } from "../menu";
export function setupCacheClear() {
  const token = getToken();
  window.addEventListener('beforeunload', () => {
    if (!token) {
      removeSelectedMenuKey();
    }
  });
}