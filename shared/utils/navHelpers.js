// shared/utils/navHelpers.js
export function openApp(appName) {
  const prodUrlMap = {
    gShellTerminal: 'https://terminal.gshell.cloud',
    gShellCore:     'https://core.gshell.cloud',
    gShellRelay:    'https://relay.gshell.cloud',
    gShellAuth:     'https://auth.gshell.cloud',
  };

  const raw = localStorage.getItem('userAuth'); // JSON string
  let url = prodUrlMap[appName];
  if (!url) return alert(`❌ Unknown app: ${appName}`);

  if (raw) {
    const parsed = JSON.parse(raw);          // { owner, loginTime, ... }
    const encoded = btoa(raw);               // base64(JSON)

    // Send BOTH formats:
    // - auth=...  → Terminal uses this to seed localStorage on that subdomain
    // - owner & token → Core/Relay backend middleware reads these
    const qp = new URLSearchParams({
      auth:  encoded,
      owner: parsed.owner,
      token: encoded,
    });
    url += `?${qp.toString()}`;

    console.log("🔐 Passing auth →", appName, { owner: parsed.owner });
  } else {
    console.log("❌ No auth token found for", appName);
  }

  window.open(url, '_blank');
}
