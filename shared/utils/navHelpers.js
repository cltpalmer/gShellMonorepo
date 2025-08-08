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
    try {
      const parsed = JSON.parse(raw);
      const encoded = btoa(raw);

      const qp = new URLSearchParams({
        auth:  encoded,
        owner: parsed.owner,
        token: encoded,
      });

      url += `?${qp.toString()}`;
      console.log("🔐 Passing auth →", appName, { owner: parsed.owner });
    } catch (e) {
      console.error("❌ Failed to parse userAuth in sender tab", e);
    }
  } else {
    console.log("❌ No auth token found for", appName);
  }

  // Log in console AND show popup
  console.log("openApp URL →", url);
  alert(`Opening ${appName} with URL:\n\n${url}`);

  window.open(url, '_blank');
}
