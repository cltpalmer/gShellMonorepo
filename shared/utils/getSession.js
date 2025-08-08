// shared/utils/getSession.js
export function getSession() {
  console.log("🔍 getSession() called");
  console.log("   href:", window.location.href);
  console.log("   search:", window.location.search);
  console.log("   hash:", window.location.hash);

  // 1) Look for ?auth in search or hash (hash-router)
  let params = new URLSearchParams(window.location.search);
  if (!params.get('auth') && window.location.hash.includes('?')) {
    const hashQuery = window.location.hash.split('?')[1];
    params = new URLSearchParams(hashQuery);
  }

  const authParam = params.get('auth');
  console.log("📦 auth param seen:", Boolean(authParam));

  if (authParam) {
    try {
      const decoded = JSON.parse(atob(authParam));
      console.log("✅ Decoded auth:", decoded);
      localStorage.setItem('userAuth', JSON.stringify(decoded));
      console.log("💾 Saved to localStorage");

      // Clean URL (remove only the query; keep hash path)
      if (window.location.hash.includes('?')) {
        const cleaned = window.location.origin + window.location.pathname + window.location.hash.split('?')[0];
        window.history.replaceState({}, document.title, cleaned);
      } else {
        const url = new URL(window.location.href);
        url.searchParams.delete('auth');
        window.history.replaceState({}, document.title, url.toString());
      }
    } catch (err) {
      console.error("❌ Failed to parse auth param", err);
      // If auth was bad, nuke it so we don't keep looping
      try { localStorage.removeItem('userAuth'); } catch {}
    }
  }

  // 2) Return stored auth if available (safe parse)
  let stored = null;
  try {
    const raw = localStorage.getItem('userAuth');
    stored = raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("❌ Stored userAuth is corrupted. Clearing.", e);
    try { localStorage.removeItem('userAuth'); } catch {}
    stored = null;
  }

  console.log("📂 Session resolved:", stored);
  return stored && stored.owner ? stored : null;
}
