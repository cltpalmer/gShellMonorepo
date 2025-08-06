import React, { useEffect, useState } from 'react';

import '../styles/DatabasePage.css';

import deleteIcon from '../assets/delete.png';


function DatabasePage() {
  const [emails, setEmails] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newEmailTemplate, setNewEmailTemplate] = useState({
    email: '',
  });
  const [showInput, setShowInput] = useState(false);
  const baseURL = "https://gshell.cloud";

  useEffect(() => {
    fetch(`${baseURL}/api/email-templates`)
      .then(res => res.json())
      .then(data => setEmails(data.templates));
  }, []);
  
  // 💣 Delete selected emails (called ONLY after modal confirmation)
  const handleDeleteConfirmed = async () => {
    try {
      // Get the selected email objects (not just strings)
      const selectedEmailObjects = emails.filter(email => selectedEmails.has(email.email));
      
      // Delete each selected email
      for (const emailObj of selectedEmailObjects) {
        const rowIndex = emailObj.rowIndex;
        
        if (!rowIndex) {
          console.error('❌ No spreadsheet rowIndex found for email:', emailObj);
          continue;
        }

        console.log('🗑️ Attempting to delete row at index:', rowIndex);
        
        const response = await fetch(`${baseURL}/api/email-templates/id/${rowIndex}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        console.log('✅ Row deleted successfully at index:', rowIndex);
      }
      
      // Clear selections and refresh
      setSelectedEmails(new Set());
      refreshEmailTemplates();
      
    } catch (error) {
      console.error('❌ Delete failed:', error);
      alert(`Failed to delete email template: ${error.message}`);
    }
  };

  const handleAddEmailTemplate = () => {
    const newRow = {
      email: newEmailTemplate.email,
    };

    const rowValues = [
      newRow.email,
    ];

    fetch(`${baseURL}/api/email-templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ row: rowValues })
    })
      .then(res => res.json())
      .then(() => {
        console.log('✅ Email template added successfully');
        // Clear the input field
        setNewEmailTemplate({ email: '' });
        refreshEmailTemplates();
      })
      .catch(err => console.error('❌ Add failed:', err));
  };

  // 🌍 Fetch emails from Express API
  async function refreshEmailTemplates() {
    try {
      const res = await fetch(`${baseURL}/api/email-templates`);
      const json = await res.json();
      setEmails(json.templates || []);
    } catch (err) {
      console.error('❌ Failed to fetch email templates from backend:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshEmailTemplates();
  }, []);

  console.log('🗑️ Will delete:', selectedEmails);
  console.log('📋 All emails:', emails);

  return (
    <div className="database-page">

      {loading ? (
        <p>Loading...</p>
      ) : emails.length === 0 ? (
        <p>No data found.</p>
      ) : (
        <>
          <div className="email-and-header">
            <h2>database</h2>

            <ul className="email-list">
              {emails.map((row, index) => {
                const isChecked = selectedEmails.has(row.email);
                return (
                  <li key={index} className="email-item">
                    <input
                      type="checkbox"
                      className="custom-checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const updated = new Set(selectedEmails);
                        if (e.target.checked) updated.add(row.email);
                        else updated.delete(row.email);
                        setSelectedEmails(updated);
                      }}
                    />
                    <span>{row.email}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ☠️ Floating delete button that triggers modal */}
          {selectedEmails.size > 0 && (
            <button className="floating-delete-btn" onClick={() => setShowModal(true)}>
              <img src={deleteIcon} alt="Delete" className="delete-icon" />
              Delete {selectedEmails.size}
            </button>
          )}

          {/* 🔮 Custom Modal Confirmation */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Are you sure?</h3>
                <p>This will permanently delete <strong>{selectedEmails.size}</strong> email(s).</p>
                <div className="modal-actions">
                  <button className="cancel-btn" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button className="confirm-btn" onClick={() => {
                    setShowModal(false);
                    handleDeleteConfirmed();
                  }}>
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      <div className="floating-zone">
  <div 
    className="input-button-wrapper"
    onMouseEnter={() => setShowInput(true)}
    onMouseLeave={() => setShowInput(false)}
  >
    {showInput && (
      <input
        type="email"
        placeholder="Enter new email"
        value={newEmailTemplate.email}
        onChange={(e) =>
          setNewEmailTemplate((prev) => ({ ...prev, email: e.target.value }))
        }
        className="floating-email-input"
      />
    )}

    <button className="floating-add-btn" onClick={handleAddEmailTemplate}>
      <svg className="add-icon" viewBox="0 0 24 24">
        <path fill="white" d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span>add</span>
    </button>
  </div>
</div>
    </div>
  );
}

export default DatabasePage;