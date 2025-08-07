import { portMap } from './portMap';

const baseURL = "https://gshell.cloud";

export function handleDevMode(input, devMode, setApiKey, setDevMode, setLog, getAPI) {
  if (devMode === 'devAwaitingApiKey') {
    setApiKey(input); // Store in Zustand
    setLog(prev => [...prev, { type: 'system', text: `✅ API key set.` }]);
    setDevMode('normal');

    // Use the input directly for API call
    getAPI(input);
    return true;
  }

  if (input.trim() === 'devMode') {
    setLog(prev => [...prev, { type: 'system', text: `🔐 Please enter your API key:` }]);
    setDevMode('devAwaitingApiKey');
    return true;
  }

  return false;
}



export function formatInput(inputText) {
  let commandName = '';
  let args = [];

  const parsed = inputText.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  commandName = parsed[0];
  args = parsed.slice(1);

  // Special case: addRow with key=value inputs
  if (commandName === "addRow" && args.length > 2 && !args[2].startsWith("{")) {
    const kvPairs = args.slice(2);
    const rowObj = {};

    kvPairs.forEach(pair => {
      const [key, ...rest] = pair.split('=');
      const value = rest.join('=');
      rowObj[key] = value;
    });

    args = [args[0], args[1], JSON.stringify(rowObj)];
  }

  return { commandName, args };
}

export function formatSpecificCMDResponse(command, json) {
  // ✅ Check for json.owner (backend now returns owner)
  if (command === 'getCurrentUser' && json.owner) {
    return [
      { type: 'response', text: `👤 Connected as: ${json.owner}` }
    ];
  }

  if (command === 'deleteRow' && json.success) {
    return [{ type: 'response', text: '🗑️ Row deleted successfully.' }];
  }

  if (command === 'deleteField' && json.success) {
    return [{ type: 'response', text: '🗑️ Field deleted successfully.' }];
  }

  if (command === 'addRow' && json.success) {
    return [{ type: 'response', text: '✅ Row added successfully.' }];
  }

  if (command === 'createApp' && json.success) {
    return [{ type: 'response', text: `✅ ${json.message}` }];
  }

  if (command === 'createSheet' && json.success) {
    return [{ type: 'response', text: `✅ ${json.message}` }];
  }

  if (command === 'getApps' && typeof json.apps === 'object') {
    const parts = Object.entries(json.apps).map(([app, sheets]) => {
      const sheetCount = sheets.length;
      return `<span style="background: rgba(0, 255, 102, 0.2); padding: 4px 10px; margin: 3px; border-radius: 8px; font-weight: bold; display: inline-block;">${app} (${sheetCount})</span>`;
    });
  
    return [{
      type: 'response',
      text: `📁 Apps: ${parts.join(' | ')}`,
      html: true
    }];
  }

  return null;
}

export function formatResponse(data) {
  // 🌟 Step 1: unwrap `.data` if it exists
  if (data?.data) data = data.data;

  // 🌟 Step 2: format array of objects into nice lines
  if (Array.isArray(data)) {
    const lines = data.map(row =>
      Object.entries(row)
        .map(([key, val]) => `${key}: ${val}`)
        .join(' | ')
    );
    return [{ type: 'response', text: lines.join('\n') }];
  }

  // fallback: show JSON
  return [{ type: 'response', text: JSON.stringify(data, null, 2) }];
}

export async function runAutomationJob(args, apiKey) {
  if (!args || args.length < 3) {
    return `❌ Needs at least: app, sheet, and one value.`;
  }

  const [app, sheet, ...values] = args;
  const endpoint = `${baseURL}/sheet/${app}/${sheet}/addRow`;

  const row = values.reduce((acc, val, i) => {
    acc[`col${i + 1}`] = val;
    return acc;
  }, {});

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify({ row })
  });

  const json = await res.json();
  if (!json.success) throw new Error(json.message);

  return `✅ Row added: ${JSON.stringify(row)}`;
}

const sessionOnlyCommands = ["getCurrentUser", "deleteField", "logOut", "getApps", "createApp", "createSheet", "addRow", "deleteRow", "addIntegration", "addAutomation", "renameApp"]; // add more as needed

export async function runCommand(commandName, cmdObj, args, apiKey) {
    // 🧪 Built-in static response
    if (cmdObj.response) {
      return [{ type: 'response', text: cmdObj.response }];
    }
  
    // 🧠 Special automation cases
    if (commandName.startsWith("addIntegration") || commandName.startsWith("addAutomation")) {
      try {
        const result = await runAutomationJob(args, apiKey);
        return [{ type: 'response', text: result }];
      } catch (err) {
        return [{ type: 'error', text: `❌ ${err.message}` }];
      }
    }
  
    // 🔒 Logout
    if (commandName === "logOut") {
      try {
        const res = await fetch(`${baseURL}/user/me`, {
          credentials: 'include'
        });
        const json = await res.json();
        const username = json.owner || "unknown";
  
        localStorage.removeItem("apiKey");
        localStorage.removeItem("userAuth");
  
        return [
          { type: "response", text: `👋 Logged out user: ${username}` },
          {
            type: "response",
            html: true,
            text: `<script>window.location.href = "${baseURL}:${portMap.gShellAuth}"</script>`
          }
        ];
      } catch (err) {
        return [{ type: "error", text: "❌ Error logging out: " + err.message }];
      }
    }
  
    // 🌐 Dynamic fetch logic
    if (cmdObj.endpoint) {
      try {
        // 🔁 Replace dynamic keys in endpoint URL
        let endpoint = cmdObj.endpoint;
        const keys = ['{{app}}', '{{sheet}}', '{{id}}', '{{key}}'];
        keys.forEach((k, i) => {
          if (args[i]) endpoint = endpoint.replace(k, args[i]);
        });
  
        const isAddRow = commandName === "addRow";
        const isCreateApp = commandName === "createApp";
        const isCreateSheet = commandName === "createSheet";
        const isRenameApp = commandName === "renameApp";
        const isDeleteField = commandName === "deleteField";
        const isSessionCommand = sessionOnlyCommands.includes(commandName);
  
        const headers = {
          'Content-Type': 'application/json'
        };
  
        // 🔐 API key protection
        if (!isSessionCommand) {
          if (!apiKey) {
            return [{ type: 'error', text: '❌ Missing API key. Please log in again.' }];
          }
          headers['x-api-key'] = apiKey;
        }
  
        const options = {
          method: (isAddRow || isCreateApp || isCreateSheet) ? 'POST' : 'GET',
          headers,
          credentials: 'include'
        };
  
        // 🧠 Special body handlers
        if (isAddRow) {
          try {
            const parsedRow = JSON.parse(args[2]);
            options.body = JSON.stringify({ row: parsedRow });
          } catch (err) {
            return [{ type: 'error', text: `❌ Invalid row JSON: ${err.message}` }];
          }
  
        } else if (isCreateApp) {
          try {
            const requestBody = {
              appName: args[0],
              sheetName: args[1] || null,
              initialData: args[2] ? JSON.parse(args[2]) : []
            };
            options.body = JSON.stringify(requestBody);
          } catch (err) {
            return [{ type: 'error', text: `❌ Invalid initial data JSON: ${err.message}` }];
          }
  
        } else if (isCreateSheet) {
          const [appName, sheetName] = args;
          const defaultColumns = [
            { name: "task", type: "text" },
            { name: "done", type: "bool" }
          ];
          options.body = JSON.stringify({ sheetName, columns: defaultColumns });
  
        } else if (isDeleteField) {
          options.method = "DELETE";
        }
  
// 🧠 Inject tokenAuth query params if available
const userData = JSON.parse(localStorage.getItem("userAuth") || "{}");
if (userData.owner && userData.loginTime) {
  // Create token with just the auth data
  const token = btoa(JSON.stringify({
    owner: userData.owner,
    loginTime: userData.loginTime
  }));
  
  const url = new URL(endpoint);
  if (!url.searchParams.has("user")) {  // ← Change to "user"
    url.searchParams.set("user", userData.owner);  // ← Change to "user"
    url.searchParams.set("token", token);
    endpoint = url.toString();
  }
}
  
        // 📡 Make the request
        const res = await fetch(endpoint, options);
        const json = await res.json();
  
        const formatted = formatSpecificCMDResponse(commandName, json);
        return formatted || formatResponse(json);
      } catch (err) {
        return [{ type: 'error', text: `❌ Request failed: ${err.message}` }];
      }
    }
  
    return [{ type: 'error', text: `⚠️ No logic defined for "${commandName}"` }];
  }
