// shared/utils/navHelpers.js - FIXED VERSION
export function openApp(appName) {
  const prodUrlMap = {
    gShellTerminal: 'https://terminal.gshell.cloud',
    gShellCore: 'https://core.gshell.cloud',
    gShellRelay: 'https://relay.gshell.cloud',
    gShellAuth: 'https://auth.gshell.cloud',
  };

  const token = localStorage.getItem('userAuth');
  let url = prodUrlMap[appName];

  if (!url) {
    alert(`❌ Unknown app: ${appName}`);
    return;
  }

  // Append token if available - FIX: Base64 encode the token
if (token) {
  const parsed = JSON.parse(token); // token is JSON string from localStorage
  const encodedToken = btoa(token); // base64 encode

  url += `?owner=${encodeURIComponent(parsed.owner)}&token=${encodeURIComponent(encodedToken)}`;
    
    console.log("🔐 Sending auth to", appName);
    console.log("📦 Raw token:", token);
    console.log("🔒 Encoded token:", encodedToken);
  } else {
    console.log("❌ No auth token found for", appName);
  }

  window.open(url, '_blank');
}
