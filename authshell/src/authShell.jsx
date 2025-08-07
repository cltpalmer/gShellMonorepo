// ===== FIXED authShell.jsx =====
import React, { useState, useEffect } from "react";

import "./authShell.css";

import cmdIcon from "./assets/cmd.svg";
import cmdReadyIcon from "./assets/cmdReady.png";

export default function AuthForm() {
  const [mode, setMode] = useState("login");
  const [isFilled, setIsFilled] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: ""
  });

  const baseURL = "https://api.gshell.cloud";

const handleLogin = async () => {
  setIsLoading(true);

  // 👇 Check for a redirect_uri in the current URL, or fallback to your default app
  const redirectUri = new URLSearchParams(window.location.search).get("redirect_uri") 
    || "https://terminal.gshell.cloud";

  try {
    // 👇 Send redirect_uri as a query param — server will use it to redirect after login
    const res = await fetch(`${baseURL}/user/login?redirect_uri=${encodeURIComponent(redirectUri)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ✅ So session cookie is stored
      body: JSON.stringify({
        owner: form.username,
        password: form.password,
      }),
    });

    // If redirect works, browser will change URL, so this part only runs if no redirect happened
    const json = await res.json();
    console.log("📡 Login response:", json);

    if (json.success) {
      // fallback in case server didn't redirect (API client, test env, etc.)
      window.location.href = redirectUri;
    } else {
      alert(json.message || "Login failed");
    }

  } catch (err) {
    console.error("Login error:", err);
    alert("Something went wrong");
  } finally {
    setIsLoading(false);
  }
};

  
  

  const handleRegister = async () => {
    if (isLoading) return;
  
    if (form.password !== form.confirm) {
      alert("Passwords do not match");
      return;
    }
  
    setIsLoading(true);
  
    try {
      console.log("📝 Starting registration process...");
      
      const res = await fetch(`${baseURL}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: form.username,
          email: form.email,
          password: form.password,
        }),
      });
  
      const json = await res.json();
      console.log("📡 Register response:", json);
  
      if (json.success && json.apiKey) {
  
        setTimeout(() => {
          console.log("🚀 Redirecting to terminal...");
          window.location.href = `google.com`;
        }, 500); // LocalStorage is instant
  
      } else {
        console.error("❌ Registration failed:", json.message);
        alert(json.message || "Registration failed");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("💥 Registration error:", error);
      alert("Registration failed. Please check your connection and try again.");
      setIsLoading(false);
    }
  };
  
  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setIsFilled(true);
  };



  const sloganLines = [
    "run your world",
    "from one shell.",
    "powered by command.",
  ];


  useEffect(() => {
    const currentLine = sloganLines[lineIndex];

    if (charIndex < currentLine.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + currentLine[charIndex]);
        setCharIndex(prev => prev + 1);
      }, 40);
      return () => clearTimeout(timeout);
    } else {
      // wait, then clear and type next line
      const wait = setTimeout(() => {
        setDisplayedText('');
        setCharIndex(0);
        setLineIndex(prev => (prev + 1) % sloganLines.length); // loop
      }, 1800);
      return () => clearTimeout(wait);
    }
  }, [charIndex, lineIndex]);



  useEffect(() => {
    let filled = false;

    if (mode === "login") {
      // For login: only check username and password
      filled = form.username.trim() !== "" && form.password.trim() !== "";
    } else {
      // For register: check all required fields
      filled = form.username.trim() !== "" && 
               form.email.trim() !== "" && 
               form.password.trim() !== "" && 
               form.confirm.trim() !== "";
    }

    setIsFilled(filled);
  }, [form, mode]);






  return (
    <div className="auth-container">
      <p className="slogan-typewriter">{displayedText}</p>

      <div className="auth-header">
      <h1>
        hello {form.username && <span className="username-preview">{form.username}</span>} 👋.
      </h1>
      </div>

      <div className="card-wrapper">
        <div className="card">
          <div className="toggle">
            <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>login</button>
            <div className="cmd-bubble-wrapper">
              <button
                type="button"
                onClick={mode === "login" ? handleLogin : handleRegister}
                className={`cmd-icon ${isFilled ? "cmd-icon-ready" : ""}`}
                disabled={isLoading}
              >
                <img
                  src={cmdIcon}
                  alt="cmd"
                  className={`cmd-img ${isFilled ? "cmd-img-ready" : ""}`}
                />
              </button>

              {isFilled && !isLoading && (
                <div className="cmd-bubble">click here to boot</div>
              )}
              
              {isLoading && (
                <div className="cmd-bubble">loading...</div>
              )}
            </div>
            <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>register</button>
          </div>

          <form>
            <div className="username-group">
              <label className="label" htmlFor="username">username</label>
              <input
                type="username"
                placeholder="username"
                value={form.username}
                onChange={(e) => handleChange("username", e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="password-group">
              <label className="label" htmlFor="password">password</label>
              <input
                type="password"
                placeholder="password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
                disabled={isLoading}
              />
              {mode === "login" && (
                <a href="#" className="forgot-password">forgot password?</a>
              )}
            </div>
            {mode === "register" && (
              <>
                <input
                  type="password"
                  placeholder="password again"
                  value={form.confirm}
                  onChange={(e) => handleChange("confirm", e.target.value)}
                  required
                  disabled={isLoading}
                />
                
                <div className="email-group">
                  <label className="label" htmlFor="email">email</label>
                  <input
                    type="email"
                    placeholder="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
