// src/App.jsx
import './styles/App.css';
import TemplateSelect from './components/TemplateSelect';
import ToggleBar from './components/ToggleBar';
import PreviewBox from './components/PreviewBox';
import VariableEditor from './components/VariableEditor';
import { useTemplateLoader } from './hooks/useTemplateLoader';
import { useState } from 'react';
import './styles/VariableEditor.css';
import { Link } from 'react-router-dom';

function App() {
  const {
    templates,
    selectedTemplate,
    setSelectedTemplate,
    viewMode,
    setViewMode,
    currentTemplate,
    variables,
    setVariables,
    variableColors,
    fullTemplate,
    setFullTemplate,
  } = useTemplateLoader();
  const [showPopup, setShowPopup] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  
  async function handleSend() {
    const payload = {
      templateName: selectedTemplate,
      to: recipientEmail,
      variables,
    };
  
    console.log("📦 Sending Email Payload:", payload);
    setShowPopup(false); // close popup
  
    // Optionally, send it:
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  
    const data = await res.json();
    if (res.ok) {
      alert("✅ Email sent!");
    } else {
      alert("❌ Failed to send.");
      console.error(data);
    }
  }
  
  return (
    <>

      <div className="send-page">
        <div className="send-container-wrapper">

        <div className="send-container">
          <div className="left">
            <TemplateSelect
              templates={templates}
              selected={selectedTemplate}
              onChange={setSelectedTemplate}
            />
            <div className="send-preview-wrapper">
            <PreviewBox
              className="send-preview-box"
              template={currentTemplate}
              variables={variables}
              setViewMode={setViewMode}
              viewMode={viewMode}
              fullTemplate={fullTemplate}
            />
          </div>
          </div>

          <div className="right">
            <VariableEditor
              variables={variables}
              setVariables={setVariables}
              variableColors={variableColors}
              updatePreview={(name, value) => {}}
            />
          </div>
        </div> 
        </div>
        <div className="send-wrapper">
          <button id="sendBtn" onClick={() => setShowPopup(true)}>next</button>
        </div>
  
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h2>Who should receive this email?</h2>
              <input
                type="email"
                placeholder="Enter recipient email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
              <button className="send-Btn" onClick={handleSend}>Send Email</button>
              <button onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;