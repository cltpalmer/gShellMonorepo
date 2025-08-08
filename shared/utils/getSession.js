// shared/utils/getSession.js
export function getSession() {
  const urlParams = new URLSearchParams(window.location.search);
  const authParam = urlParams.get('auth');

  if (authParam) {
    try {
      const decoded = JSON.parse(atob(authParam));
      localStorage.setItem('userAuth', JSON.stringify(decoded));

      // Clean the URL
      const url = new URL(window.location.href);
      url.searchParams.delete('auth');
      window.history.replaceState({}, document.title, url.toString());
    } catch (err) {
      console.error("❌ Failed to parse auth param", err);
    }
  }

  // Return stored auth if available
  const stored = localStorage.getItem('userAuth');
  return stored ? JSON.parse(stored) : null;
}
