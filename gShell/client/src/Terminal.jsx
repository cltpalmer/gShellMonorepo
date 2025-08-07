import { useState, useEffect, useRef } from 'react';
import { runCommand } from './utils/CommandFunctions';
import { formatInput, handleDevMode } from './utils/CommandFunctions';
import { portMap } from './utils/portMap';
import { loadAuthFromStorage, clearAuthStorage } from "@shared/authUtils";

import ToggleSlider from './components/toggleSlider';

import './styles/Terminal.css'

import cmdIcon from './assets/cmd.svg';
import logoutIcon from './assets/logoutExit.svg';

export default function Terminal({ isDark, setIsDark, toggleCommandOverlay }) {
    
  const [input, setInput] = useState('');
  const [log, setLog] = useState([]);
  const [commands, setCommands] = useState({});
  const [promptKeywords, setPromptKeywords] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [apps, setApps] = useState([]);
  const [status, setStatus] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [devMode, setDevMode] = useState('normal'); // normal | devAwaitingApiKey
  const [apiKey, setApiKey] = useState('');
  const [username, setUsername] = useState('');
  
  const welcomedRef = useRef(false); // 🚫 No double greetings
  const logRef = useRef(null);

 const baseURL = "https://api.gshell.cloud";


function getSession() {
  try {
    const authData = localStorage.getItem('userAuth');
    
    if (!authData) {
      setLog(prev => [...prev, { type: 'error', text: '❌ Not logged in' }]);
      return false;
    }

    const userData = JSON.parse(authData);
    
    // Optional: Check if login is still valid (e.g., within 24 hours)
    const loginAge = Date.now() - userData.loginTime;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (loginAge > maxAge) {
      localStorage.removeItem('userAuth');
      setLog(prev => [...prev, { type: 'error', text: '❌ Session expired' }]);
      return false;
    }

    // ✅ Check and set the ref to prevent repeats
    if (!welcomedRef.current) {
      setLog(prev => [
        ...prev,
        { type: 'response', text: `👋 Welcome back, ${userData.owner}` }
      ]);
      welcomedRef.current = true;
    }

    setUsername(userData.owner);
    return true;

  } catch (err) {
    console.error('Error reading auth data:', err);
    localStorage.removeItem('userAuth'); // Clean up corrupted data
    setLog(prev => [...prev, { type: 'error', text: '❌ Failed to verify session' }]);
    return false;
  }
}

  


  useEffect(() => {
    getSession(); 
  }, []);

  useEffect(() => {
    // Fetch command config once
    fetch('/commands.json')
      .then(res => res.json())
      .then(data => setCommands(data));
  }, []);
 
  useEffect(() => {
    fetch('/commandPrompts.json')
      .then(res => res.json())
      .then(data => {
        const promptList = Object.values(data);
        setPromptKeywords(promptList);
      });
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);


  

  async function handleSubmit(e) {
    e.preventDefault();
  
    const { commandName, args } = formatInput(input.trim());
    const cmd = commands[commandName];
  
    // Show user's command in terminal
    setLog(prev => [...prev, { type: 'user', text: input }]);
    setInput('');
  
    // ✅ Handle devMode API key prompt and call getAPI after setting it
    if (handleDevMode(input, devMode, setApiKey, setDevMode, setLog, getSession)) {
      setInput('');
      return;
    }
  
    // ⚠️ If command doesn't exist, show error
    if (!cmd) {
      const errorMsg = `⚠️ Unknown command: "${commandName}"`;
      setLog(prev => [...prev, { type: 'error', text: errorMsg }]);
      window.showToast?.(errorMsg, 'error');
      return;
    }
  
    // 🧠 Run the matched command
    const output = await runCommand(commandName, cmd, args, apiKey);
  
    // 🎨 Handle each message in the output (response, error, etc.)
    for (const msg of output) {
      if (msg.type === 'response') {
        if (msg.html === true) {
          // 💥 Render HTML output instantly
          setLog(prev => [...prev, msg]);
        } else {
          // ✨ Typing animation for plain text
          typeMessage(msg.text, setLog, 20); // you can make it faster here
        }
      } else {
        setLog(prev => [...prev, msg]);
        if (msg.type === 'error') {
          window.showToast?.(msg.text, 'error');
        }
      }
    }
  }
  
  function typeMessage(fullText, setLog, delay = 35, isHtml = false) {
    let currentText = '';
    let i = 0;
    const id = Date.now(); // unique ID for this log line
  
    setLog(prev => [...prev, { id, type: 'response', text: '', html: isHtml }]);
  
    const interval = setInterval(() => {
      currentText += fullText[i];
      i++;
  
      setLog(prev =>
        prev.map(entry => {
          if (entry.id === id) {
            return { ...entry, text: currentText };
          }
          return entry;
        })
      );
  
      if (i >= fullText.length) {
        clearInterval(interval);
      }
    }, delay);
  }
  





  return (
    <div className="page-container">
      <button
        className="logout-button"
        onClick={async () => {
          await fetch(`${baseURL}/user/logout`, {
            method: "POST",
            credentials: "include",
          });
          clearAuthStorage(); //
          window.location.href = `${baseURL}:${portMap.gShellAuth}`;
        }}
      >
        <img src={logoutIcon} alt="Logout" />
        <span>Logout</span>
      </button>
        <span className="version-tag">BETA v1.0.0</span>

      <div className="terminal-page-wrapper">

          {/* Header */}
          <h1 className={`header ${isDark ? 'dark' : ''}`}>
            welcome to g.<span className={`gshell-name ${isDark ? 'dark' : ''}`}>
              <span>S</span><span>h</span><span>e</span><span>l</span><span>l</span><span> &gt; .</span>
            </span><span>👋</span>
          </h1>
  
          {/* Tools */}

            <ToggleSlider isDark={isDark} setIsDark={setIsDark} />

  
          {/* Terminal Area */}
          <div className="terminal">
            <input className="search-input" type="text" placeholder="Search..." />
              
            <div className="log-area" ref={logRef}>
              {log.map((line, i) => {
                console.log('Rendering line:', line); // Debug log
                return (
                    <div
                      key={i}
                      className={`log-line ${line.type} ${isDark ? 'dark' : ''}`}
                    >
                    {line.html ? (
                      <div dangerouslySetInnerHTML={{ __html: line.text }} />
                    ) : (
                      line.text
                    )}
                  </div>
                );
              })}
            </div>

  
            <div className="terminal-input-area-wrapper">
              {/* 🔼 Suggestions ABOVE input */}
              {suggestions.length > 0 && (
                <ul className="suggestions-dropup">
                  {suggestions.map((sug, i) => (
                    <li
                      key={i}
                      className="suggestion-item"
                      onClick={() => {
                        setInput(sug);
                        setSuggestions([]);
                      }}
                    >
                      {sug}
                    </li>
                  ))}
                </ul>
              )}
  
              {/* Form input */}
              <form onSubmit={handleSubmit} className="terminal-input-area">
                <button className="cmd-button">
                  <img src={cmdIcon} onClick={toggleCommandOverlay} className="chevron-icon" alt="Command" />
                </button>
                <input
                  value={input}
                  onChange={e => {
                    const value = e.target.value;
                    setInput(value);
                    const match = promptKeywords.filter(prompt =>
                      prompt.toLowerCase().startsWith(value.toLowerCase())
                    );
                    setSuggestions(value ? match : []);
                  }}
                  autoFocus
                  className={`terminal-input ${isDark ? 'dark' : ''}`}
                  placeholder="how can gShell help today?"
                />
              </form>
            </div>
          </div>
        </div>
      </div>
  );
}
