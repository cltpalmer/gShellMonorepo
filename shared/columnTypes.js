// columnTypes.js
const allowedTypes = ['string', 'number', 'bool', 'timestamp', 'text', 'email', 'date', 'image', 'list']; // ← Added 'image'

function detectType(val) {
  if (typeof val === "boolean") return "bool";
  if (typeof val === "number") return "number";

  // string-based checks
  if (typeof val === "string") {
    const lower = val.toLowerCase();

    // try to infer common types
    if (!isNaN(Date.parse(val))) return "timestamp";
    if (val.includes("@")) return "email";
    if (["true", "false"].includes(lower)) return "bool";
    if (val.match(/^\d{4}-\d{2}-\d{2}$/)) return "date"; // e.g. "2025-07-21"
    if (val.length > 200) return "text"; // long text
    if (val.match(/\.(png|jpg|jpeg|gif|webp)$/)) return "image"; // ✅ detect image
    if (Array.isArray(val)) return "list";

    return "string";
  }

  return "string"; // fallback
}

module.exports = { allowedTypes, detectType };