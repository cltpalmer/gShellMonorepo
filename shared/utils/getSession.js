// shared/utils/getSession.js
export function getSession() {
  console.log("🔍 getSession() called");

  // Check normal query string
  let params = new URLSearchParams(window.location.search);

  // If nothing found, check inside hash (for hash routers)
  if (!params.get('auth') && window.location.hash.includes('?')) {
    const hashQuery = window.location.hash.split('?')[1];
    params = new URLSearchParams(hashQuery);
  }

  const authParam = params.get('auth');
  console.log("URL search params:", window.location.search, "hash:", window.location.hash);
  console.log("📦 Found auth param:", authParam);

  if (authParam) {
    try {
      const decoded = JSON.parse(atob(authParam));
      console.log("✅ Decoded auth:", decoded);

      localStorage.setItem('userAuth', JSON.stringify(decoded));
      console.log("💾 Saved to localStorage");

      // Clean the URL (keep hash path but remove query part)
      if (window.location.hash.includes('?')) {
        window.history.replaceState({}, document.title,
          window.location.origin + window.location.pathname + window.location.hash.split('?')[0]
        );
      } else {
        const url = new URL(window.location.href);
        url.searchParams.delete('auth');
        window.history.replaceState({}, document.title, url.toString());
      }

    } catch (err) {
      console.error("❌ Failed to parse auth param", err);
    }
  }

  // Return stored auth if available
  const stored = localStorage.getItem('userAuth');
  console.log("📂 Stored auth from localStorage:", stored);
  return stored ? JSON.parse(stored) : null;
}
