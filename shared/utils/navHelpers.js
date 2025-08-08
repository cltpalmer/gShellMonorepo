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
    const parsed = JSON.parse(raw);  // { owner, loginTime, ... }
    const encoded = btoa(raw);       // base64(JSON)

    const qp = new URLSearchParams({
      auth:  encoded,        // for getSession() in receiver
      owner: parsed.owner,   // for backend
      token: encoded,        // for backend
    });

    url += `?${qp.toString()}`;
    console.log("🔐 Passing auth →", appName, { owner: parsed.owner });
  } else {
    console.log("❌ No auth token found for", appName);
  }

  // Show URL in console and popup for debugging
  console.log("openApp URL →", url);
  window.alert(`Opening ${appName} with URL:\n\n${url}`);

  window.open(url, '_blank');
}
