import Overlay from "./Overlay";

import "./OverlayStyles/IntergrationsOverlay.css";

import { useState, useEffect } from 'react'; // ⬅️ Make sure this is imported
import { showToast } from '../components/Toast';

export default function IntegrationOverlay({
    show,
    onClose,
    onSave,
    title,
    message,
    app,
    sheets,
}) {

    const [generatedCode, setGeneratedCode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [typedText, setTypedText] = useState("");
    const [showInstructions, setShowInstructions] = useState(false);
    const [success, setSuccess] = useState(false);
    const baseURL = "https://gshell.cloud";

    const handleGenerate = async () => {
        try {
          setLoading(true);
          console.log("📤 Sending to backend:", { app, sheets });
      
          const res = await fetch(`${baseURL}/user/generate-integration-code`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ app, sheets }),
          });
      
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`❌ Server error (${res.status}): ${text}`);
          }
      
          const json = await res.json();
          console.log("✅ Generated code:", json.code);
      
          setGeneratedCode(json.code); // ✅ THIS LINE makes it appear in the UI
          setTimeout(() => showToast("Code generated successfully"), 500);
        } catch (err) {
          console.error("❌ Failed to generate code:", err.message);
        } finally {
          setLoading(false);
          setSuccess(true);

        }
      };

      
      useEffect(() => {
        if (!generatedCode) return;
      
        // 🐛 DEBUG: Log what we actually received
        console.log("🔍 generatedCode:", generatedCode);
        console.log("🔍 generatedCode type:", typeof generatedCode);
        console.log("🔍 generatedCode length:", generatedCode.length);
      
        const rawCode = generatedCode.replace(/^access\.key\./, "");
        console.log("🔍 rawCode after replacement:", rawCode);
        
        const fullText = `access.key.${rawCode}`;
        console.log("🔍 fullText to type:", fullText);
        console.log("🔍 fullText length:", fullText.length);
      
        setTypedText(""); 
        setShowInstructions(false);
      
        let index = 0;
        const interval = setInterval(() => {
          const nextChar = fullText.charAt(index);
          console.log(`🔍 Typing char ${index}: "${nextChar}"`);
          setTypedText(prev => prev + nextChar);
          index++;
          if (index >= fullText.length) {
            clearInterval(interval);
            setTimeout(() => setShowInstructions(true), 500);
          }
        }, 40);
      
        return () => clearInterval(interval);
      }, [generatedCode]);
      




return (
    <Overlay show={show} onClose={onClose}>
        <div className="integration-overlay-content">
            <div className="integration-overlay-header">
                <h2>{title}</h2>
            </div>
            <div className="integration-overlay-body">
            <button
  className={`generate-btn ${loading ? 'loading' : ''} ${success ? 'success' : ''}`}
  onClick={handleGenerate}
  disabled={loading || success}
>
  {loading ? (
    <div className="spinner"></div>
  ) : success ? (
    <div className="checkmark">&#10003;</div> // ✅ Unicode check
  ) : (
    "generate"
  )}
</button>


                {generatedCode && (
  <div className="generated-code-box">

    {/* 🔑 TYPING ACCESS KEY LINE */}
    <div className="generated-code-box-access-key">
      <p><strong>{typedText}</strong></p>
      <button
        className="copy-btn"
        onClick={() => {
          navigator.clipboard.writeText(`access.key.${generatedCode}`);
          showToast("Copied to clipboard");
        }}
      >
        📋 copy
      </button>
    </div>

    {/* 🔧 CODE SNIPPET LINE */}
    <div className="generated-code-box-code">
      <code>await gShell.connect.{title}.users;</code>
      <button
        className="copy-btn"
        onClick={() => {
          navigator.clipboard.writeText(`await gShell.connect.${title}.users;`);
          showToast("Copied to clipboard");
        }}
      >
        📋 copy
      </button>
    </div>

    {/* 🧠 INSTRUCTIONS */}
    {showInstructions && (
      <div className="instruction-text">
        <p>🔐 Use this access key to connect to your <strong>{app}</strong> sheets.</p>
      </div>
    )}
  </div>
)}



{!generatedCode && <p>{message}</p>}
            </div>

            <div className="button-row">
                <button onClick={onSave} className="initiate-btn">done</button>
            </div>
        </div>
    </Overlay>
);

}