// shared/utils/navHelpers.js
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

  // Append token if available
  if (token) {
    url += `?auth=${encodeURIComponent(token)}`;
  }

  window.open(url, '_blank');
}
