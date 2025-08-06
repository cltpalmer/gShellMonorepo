// sheetControls.jsx ✅ Updated for session-based auth

const baseURL = "https://gshell.cloud";

export async function addRow(appName, sheetName, newRow) {
    const res = await fetch(`${baseURL}/sheet/${appName}/${sheetName}/addRow`, {
      method: 'POST',
      credentials: 'include', // ✅ Use session auth
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ row: newRow })
    });
  
    return await res.json();
}
  
export async function addColumn(appName, sheetName, columnName, selectedType, options ) {
  console.log("🛰 Sending column to backend:", {
    appName,
    sheetName,
    columnName,
    selectedType,
    options
  });
  
  
  try {
    const res = await fetch(`${baseURL}/sheet/${appName}/${sheetName}/addColumn`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: columnName,
        defaultValue: "",
        type: selectedType,
        options
      })
    });

    const contentType = res.headers.get("content-type");

    if (!res.ok || !contentType?.includes("application/json")) {
      const text = await res.text(); // fallback to raw HTML or error
      throw new Error(`❌ Bad response from server:\n${text.slice(0, 200)}`);
    }

    return await res.json();
  } catch (err) {
    console.error("❌ Failed to add column:", err.message);
    throw err; // so UI still sees the failure
  }
}

export async function handleSyncUsers(appName, sheetName) {
  console.log("🔍 App info for sync:", appName, sheetName); // Check if it's a string or object
  if (typeof appName !== 'string') {
    console.warn("❌ appName should be a string but got:", appName);
  }
  if (!sheetName) {
    console.warn("❌ sheetName is missing:", sheetName);
  }
  
  try {
    const res = await fetch(`${baseURL}/user/${appName}/${sheetName}/sync-users`, {
      method: 'POST',
      credentials: 'include'
    });

    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    alert(`✅ Synced ${json.rows} users to ${sheetName} sheet!`);
  } catch (err) {
    alert("❌ Sync failed: " + err.message);
  }
};

export async function createApp(appName) {
    const trimmed = appName.trim();
    if (!trimmed) {
      return { success: false, message: "App name is required." };
    }
  
    const res = await fetch(`${baseURL}/sheet/createApp`, {
      method: 'POST',
      credentials: 'include', // ✅ Use session auth
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        appName: trimmed,
        sheetName: "starter", // optional: auto-make a starter sheet
        initialData: [{ id: 1, status: "empty" }]
      })
    });
  
    return await res.json();
}