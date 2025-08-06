// shared/authUtils.js

export const STORAGE_KEYS = {
  API_KEY: 'apiKey',
  USERNAME: 'username',
};

export function saveAuthToStorage(apiKey, username, useSession = false) {
  const storage = useSession ? sessionStorage : localStorage;
  storage.setItem(STORAGE_KEYS.API_KEY, apiKey);
  storage.setItem(STORAGE_KEYS.USERNAME, username);
}

export function loadAuthFromStorage(useSession = false) {
  const storage = useSession ? sessionStorage : localStorage;
  return {
    apiKey: storage.getItem(STORAGE_KEYS.API_KEY),
    username: storage.getItem(STORAGE_KEYS.USERNAME),
  };
}

export function clearAuthStorage() {
  localStorage.removeItem(STORAGE_KEYS.API_KEY);
  localStorage.removeItem(STORAGE_KEYS.USERNAME);
  sessionStorage.removeItem(STORAGE_KEYS.API_KEY);
  sessionStorage.removeItem(STORAGE_KEYS.USERNAME);
}
