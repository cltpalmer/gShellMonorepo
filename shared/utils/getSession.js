// shared/utils/getSession.js
export function getSession() {
  const urlParams = new URLSearchParams(window.location.search);
  const authParam = urlParams.get('auth');

  console.log("🔍 getSession() called");
  console.log("URL search params:", window.location.search);

  if (authParam) {
    console.log("📦 Found auth param:", authParam);
    try {
      const decoded = JSON.parse(atob(authParam));
      console.log("✅ Decoded auth:", decoded);

      localStorage.setItem('userAuth', JSON.stringify(decoded));
      console.log("💾 Saved to localStorage");

      // Clean the URL
      const url = new URL(window.location.href);
      url.searchParams.delete('auth');
      window.history.replaceState({}, document.title, url.toString());
      console.log("🧹 Cleaned URL");
    } catch (err) {
      console.error("❌ Failed to parse auth param", err);
    }
  }

  // Return stored auth if available
  const stored = localStorage.getItem('userAuth');
  console.log("📂 Stored auth from localStorage:", stored);
  return stored ? JSON.parse(stored) : null;
}
