export function openApp(appName) {
  console.log("🚀 openApp() CALLED with:", appName);

  const prodUrlMap = {
    gShellTerminal: 'https://terminal.gshell.cloud',
    gShellCore:     'https://core.gshell.cloud',
    gShellRelay:    'https://relay.gshell.cloud',
    gShellAuth:     'https://auth.gshell.cloud',
  };

  const raw = localStorage.getItem('userAuth');
  let url = prodUrlMap[appName];
  if (!url) return alert(`❌ Unknown app: ${appName}`);

  if (raw) {
    const parsed = JSON.parse(raw);
    const encoded = btoa(raw);

    const qp = new URLSearchParams({
      auth: encoded,
      owner: parsed.owner,
      token: encoded,
    });

    const finalUrl = `${url}?${qp.toString()}`;
    console.log("🔐 Passing auth →", appName, finalUrl);

    // 🔔 Popup confirm
    alert(`Opening ${appName} with auth:\n\n${finalUrl}`);

    window.open(finalUrl, '_blank');
  } else {
    alert(`❌ No auth found for ${appName}`);
  }
}
