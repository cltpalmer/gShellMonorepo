// utils/navHelpers.js
export function openApp(appKey) {
  const baseUrl = portMap[appKey];
  if (!baseUrl) {
    alert(`❌ Unknown app: ${appKey}`);
    return;
  }

  // Get userAuth from localStorage
  const userData = localStorage.getItem('userAuth');
  const tokenParam = userData ? `?auth=${btoa(userData)}` : '';

  window.open(`${baseUrl}${tokenParam}`, '_blank');
}
