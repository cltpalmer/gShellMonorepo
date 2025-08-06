export default function fallbackFormatCommands(rawCommands, categoryPrefix) {
  return Object.entries(rawCommands)
    .filter(([key]) => categoryPrefix === '' || key.toLowerCase().startsWith(categoryPrefix.toLowerCase()))
    .map(([key, val]) => ({
      text: val.label || val.response || val.endpoint || 'No description',
      bg: 'blue',
      textCol: 'dark',
    }));
}

export function formatMB(valueMB) {
  const num = parseFloat(valueMB); // Convert string to number

  if (isNaN(num)) return "0 MB"; // fallback if invalid

  if (num >= 1024) {
    return `${(num / 1024).toFixed(2)} GB`;
  } else {
    return `${num.toFixed(2)} MB`;
  }
}


