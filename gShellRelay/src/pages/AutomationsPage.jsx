import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useTemplateLoader } from '../hooks/useTemplateLoader';

import ChangeApp from '../components/changeApp';
import AutomationFlow from '../components/AutomationFlow';
import '../styles/AutomationPage.css';

import closeIcon from '../assets/delAuto.png';
import autoEditIcon from '../assets/autoEdit.png';
import cardIcon from '../assets/cardView.png';
import flowIcon from '../assets/flowView.png';
import confirmIcon from '../assets/confirm.svg';

export default function AutomationPage() {
  const [viewMode, setViewMode] = useState('flow');
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const [selected, setSelected] = useState(null);
  const [automations, setAutomations] = useState([]);
  const [fullAutomations, setFullAutomations] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAutomation, setNewAutomation] = useState({
    thing: '',
    action: '',
    value: '',
    response: '',
  });
  const navigate = useNavigate();
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    type: '',
  });
  const [listOptions, setListOptions] = useState({
    thing: [],
    action: [],
    value: [],
    response: [],
  });

  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [selectedApp, setSelectedApp] = useState("");

  const { templates, refetchTemplates } = useTemplateLoader();

  const baseURL = "https://gshell.cloud";


    // ✅ ADD THIS: Refresh automations when selectedApp changes
    useEffect(() => {
      if (selectedApp) {
        refreshAutomations();
      }
    }, [selectedApp]);


  const fetchGlobalDropdowns = async () => {
    try {

      console.log('🔍 Fetching GLOBAL dropdown options...');
      const res = await fetch(`${baseURL}/global/options`, {
        credentials: 'include'
      });
      
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error! status: ${res.status}, body: ${errorText}`);
      }
      
      const globalData = await res.json();
      console.log('🌐 Global options received:', globalData);
      
      const globalOptions = {
          thing: globalData.thing || [],
          action: globalData.action || [],
          value: globalData.value || [],
          response: templates || [],
      };

      console.log('🔄 Setting GLOBAL options:', globalOptions);
      
      setListOptions(prevOptions => ({
        ...prevOptions,
        ...globalOptions
      }));
      console.log('✅ Final listOptions:', globalOptions);

    } catch (err) {
      console.error('❌ Error fetching global dropdowns:', err);
    }
  };



  const refreshAutomations = async () => {
    if (!selectedApp) {
      console.log('⛔ No selectedApp, skipping refresh');
      return;
    }
  
    console.log(`🔄 [FRONTEND] Refreshing automations for app: ${selectedApp}`);
  
    try {
      const url = `${baseURL}/relay/automations/${selectedApp}`;
      console.log(`📡 [FRONTEND] Fetching from: ${url}`);
      
      const response = await fetch(url, {
        credentials: 'include',
      });
  
      console.log(`📡 [FRONTEND] Response status: ${response.status}`);
      console.log(`📡 [FRONTEND] Response ok: ${response.ok}`);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [FRONTEND] HTTP Error ${response.status}:`, errorText);
        
        if (response.status === 404) {
          console.error(`❌ [FRONTEND] Route not found. This suggests:
            1. Backend route handler is not being called
            2. Route may not be properly registered
            3. Middleware might be blocking the request
            4. Check backend console for route handler logs`);
        }
        
        // Set empty automations on error
        setFullAutomations([]);
        setAutomations([]);
        return;
      }
  
      const data = await response.json();
      console.log('📡 [FRONTEND] Response data:', data);
      
      const rows = data.automations || [];
      console.log(`📋 [FRONTEND] Found ${rows.length} automations`);
  
      setFullAutomations(rows);
      setAutomations(
        selected ? rows.filter(row => row.trigger === selected) : rows
      );
  
    } catch (error) {
      console.error('❌ [FRONTEND] Error refreshing automations:', error);
      console.error('❌ [FRONTEND] Error details:', {
        message: error.message,
        stack: error.stack,
        selectedApp,
        timestamp: new Date().toISOString()
      });
      
      // Set empty automations on error
      setFullAutomations([]);
      setAutomations([]);
    }
  };
  
  

  const onChange = (value) => {
    console.log('Filter changed to:', value);
    setSelected(value);
    const filtered = fullAutomations.filter(row => row.trigger === value);
    console.log('Original automations count:', fullAutomations.length);
    console.log('Filtered automations count:', filtered.length);
    setAutomations(filtered);
  };

  const generateTriggerSentence = ({ thing, action, value }) => {
    if (!thing || !action || !value) return '';
    return `${thing} ${action} ${value}`;
  };

  const handleSubmit = () => {
    if (isEditing && editRowIndex !== null) {
      handleEditAutomation();
    } else {
      handleAddAutomation();
    }
  };

const handleAddAutomation = async () => {
  if (!selectedApp) {
    console.error('❌ No app selected for automation');
    return;
  }

  console.log("📤 Selected App:", selectedApp);

  try {
    const id = Date.now();
    const newRow = {
      id,
      thing: newAutomation.thing,
      action: newAutomation.action,
      value: newAutomation.value,
      response: newAutomation.response,
    };

    const response = await fetch(`${baseURL}/relay/automations/${selectedApp}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newRow),
    });

    if (!response.ok) throw new Error('Failed to save automation');

    console.log('✅ Automation saved!');
    resetModalState();
    refreshAutomations();
  } catch (err) {
    console.error('❌ Error saving automation:', err);
  }
};

  

  const handleEditAutomation = async () => {
    try {
      const triggerSentence = generateTriggerSentence(newAutomation);

      const updates = {
        thing: newAutomation.thing,
        action: newAutomation.action,
        value: newAutomation.value,
        trigger: triggerSentence,
        response: newAutomation.response,
      };

      const response = await fetch(`${baseURL}/relay/automations/${selectedApp}/${selectedNode.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ updates })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Automation updated successfully:', result);
      resetModalState();
      refreshAutomations();
    } catch (err) {
      console.error('❌ Edit failed:', err);
    }
  };

  const resetModalState = () => {
    setShowAddModal(false);
    setNewAutomation({
      thing: '',
      action: '',
      value: '',
      response: '',
    });
    setIsEditing(false);
    setEditRowIndex(null);
    setSelectedNode(null);
  };

  const handleOptionSelect = (selectedOption) => {
    if (contextMenu.type === 'response') {
      setNewAutomation((prev) => ({ ...prev, response: selectedOption }));
    } else if (contextMenu.type === 'thing') {
      setNewAutomation((prev) => ({ ...prev, thing: selectedOption }));
    } else if (contextMenu.type === 'action') {
      setNewAutomation((prev) => ({ ...prev, action: selectedOption }));
    } else if (contextMenu.type === 'value') {
      setNewAutomation((prev) => ({ ...prev, value: selectedOption }));
    }
    setContextMenu({ visible: false });
  };
  
  const formatEventName = (name) => {
    if (!name) return '';
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  const contextRef = useRef();

  const showAllAutomations = () => {
    console.log('Showing all automations');
    setSelected(null);
    setAutomations(fullAutomations);
  };

  useEffect(() => {
    if (selectedNode) {
      setNewAutomation({
        thing: selectedNode.thing,
        action: selectedNode.action,
        value: selectedNode.value,
        response: selectedNode.response,
      });
      setIsEditing(true);
      setEditRowIndex(selectedNode.rowIndex);
    }
  }, [selectedNode]);
  
  // ✅ Load global dropdown options on component mount
  useEffect(() => {
    fetchGlobalDropdowns();
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextRef.current && !contextRef.current.contains(event.target)) {
        setContextMenu({ visible: false, x: 0, y: 0, type: '' });
      }
    };
  
    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu.visible]);
  
  useEffect(() => {
    if (!contextMenu.visible || contextMenu.type !== 'response') return;
  
    // ✅ Use already-loaded templates
    const templateNames = templates.map(t => t.name);
  
    setListOptions(prev => ({
      ...prev,
      response: templateNames,
    }));
  }, [contextMenu.visible, contextMenu.type, templates]);
  
  
  




  return (
    <div className="automation-page">
      <ChangeApp selectedApp={selectedApp} setSelectedApp={setSelectedApp} />
      <button
            className="addBtn"
            onClick={() => {
              setShowAddModal(true);
              setSelectedNode(null);
              setNewAutomation({
                thing: '',
                action: '',
                value: '',
                response: '',
              });
              setIsEditing(false);
              setEditRowIndex(null);
            }}
          >
            add automation
          </button>

      <div className="utilityTab">
        {showAddModal && (
          <div className="add-modal-overlay">
            <div className="add-modal">
              <div className="inside-modal">
              <button
    className="modal-close-btn"
    onClick={resetModalState}
    aria-label="Close modal"
  >
    ×
  </button>
              <h2>{selectedNode ? "Edit Automation" : "Add Automation"}</h2>

              <div className="trigger-row">
                <div
                  className="menu-trigger thing"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const dropdownType = 'thing';
                    console.log(`🧩 Opening menu for '${dropdownType}'`);
                    console.table(listOptions[dropdownType] || []);
                    if (!listOptions[dropdownType]?.length) {
                      console.warn(`⚠️ No options loaded for '${dropdownType}' yet.`);
                    }
                    
                    setContextMenu({
                      visible: true,
                      x: rect.left,
                      y: rect.top - 10,
                      type: 'thing',
                    });
                  }}
                >
                  {newAutomation.thing || <span className="placeholder">Select Thing</span>}
                </div>

                <div
                  className="menu-trigger action"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    console.log('🧩 Opening context menu for: action');
                    console.log('📋 Current listOptions:', listOptions);
                    setContextMenu({
                      visible: true,
                      x: rect.left,
                      y: rect.top - 10,
                      type: 'action',
                    });
                  }}
                >
                  {newAutomation.action || <span className="placeholder">Select Action</span>}
                </div>

                <div
                  className="menu-trigger value"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    console.log('🧩 Opening context menu for: value');
                    console.log('📋 Current listOptions:', listOptions);
                    setContextMenu({
                      visible: true,
                      x: rect.left,
                      y: rect.top - 10,
                      type: 'value',
                    });
                  }}
                >
                  {newAutomation.value || <span className="placeholder">Select Value</span>}
                </div>
              </div>

              <div
                className="menu-trigger response"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setContextMenu({
                    visible: true,
                    x: rect.left,
                    y: rect.top - 10,
                    type: 'response',
                  });
                }}
              >
                <div className="response-content">
                  <span>
                    {newAutomation.response || <span className="placeholder">Select Response</span>}
                  </span>

                  {newAutomation.response && (
                    <Link to={`/create/${newAutomation.response}`} className="auto-edit-link" onClick={(e) => e.stopPropagation()}>
                      <img
                        src={autoEditIcon}
                        alt="edit"
                        className="auto-edit-icon"
                      />
                    </Link>
                  )}
                </div>
              </div>

              <div className="add-modal-buttons">

                <button className="confirm-btn" onClick={handleSubmit}>
                  <img src={confirmIcon} alt="confirm" />      
                  </button>
              </div>
            </div>
          </div>
          </div>

        )}

        <div className="leftTab">


        </div>
<div className="flow-controls-container">

        <div className="view-toggle">
          <button
            className={viewMode === 'cards' ? 'active' : ''}
            onClick={() => setViewMode('cards')}
          >
            <div className="view-toggle-icon">
              <img src={cardIcon} alt="card view" className="view-toggle-img"/>Card View
            </div>
          </button>
          <button
            className={viewMode === 'flow' ? 'active' : ''}
            onClick={() => setViewMode('flow')}
          >
            <div className="view-toggle-icon">
              <img src={flowIcon} alt="flow view" className="view-toggle-img"/>Flow View
            </div>
          </button>
        </div>
        <div className="automateSelect-wrapper" ref={ref}>
 
 <div
   className="automateSelect-box"
   onClick={() => setOpen(!open)}
 >
   {formatEventName(selected) || 'automations'}
   <span className={`automateSelect-chevron ${open ? 'up' : ''}`}>⌄</span>
 </div>

 {open && (
   <ul className="automateSelect-dropdown">
     <li
       key="all"
       onClick={() => {
         showAllAutomations();
         setOpen(false);
       }}
     >
       All automations
     </li>
     {[...new Set(fullAutomations.map(row => row.trigger))].map((action) => (
       <li
         key={action}
         onClick={() => {
           onChange(action);
           setOpen(false);
         }}
       >
         {formatEventName(action)}
       </li>
     ))}
   </ul>
 )}
</div>

        </div>
      </div>

      {contextMenu.visible && (
        <div
          className="context-menu"
          ref={contextRef}
          style={{
            position: 'absolute',
            left: contextMenu.x,
            top: contextMenu.y,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '6px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 9999,
            padding: '8px',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {(listOptions[contextMenu.type] || []).length === 0 ? (
            <div style={{ padding: '5px 10px', color: '#666' }}>
              No options available
            </div>
          ) : (
            (listOptions[contextMenu.type] || []).map((option) => (
              <div
                key={option}
                className="context-menu-item"
                onClick={() => {
                  handleOptionSelect(option);
                  setNewAutomation((prev) => ({
                    ...prev,
                    [contextMenu.type]: option,
                  }));
                  setContextMenu({ visible: false, x: 0, y: 0, type: '' });
                }}
                style={{
                  padding: '5px 10px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                }}
              >
                {option}
              </div>
            ))
          )}
        </div>
      )}

      {viewMode === 'cards' ? (
        <div className="automation-content-width">
          <div className="automation-card-content">
          <h1 className="automation-title">your
            <span className="automation-title-span">Automations</span>
          </h1>
          <div className="automation-card-grid">
            {automations.map((row, i) => (
              <div key={i} className="automation-card">
                <span className="automation-card-delete" onClick={() => handleDelete(row.id)}>
                  <img src={closeIcon} alt="delete" />
                </span>
                <p><span className="automation-card-trigger"><strong>Trigger:</strong> {row.trigger}</span></p>
                <p><span className="automation-card-action"><strong>Action:</strong> {row.action}</span></p>
                <p><span className="automation-card-value"><strong>Value:</strong> {row.value}</span></p>
                <p><span className="automation-card-response"><strong>Response:</strong> {row.response}</span></p>
              </div>
            ))}
          </div>
          </div>
        </div>
      ) : (
<AutomationFlow
  appName={selectedApp}
  automations={automations}
  setSelectedNode={setSelectedNode}
  setShowAddModal={setShowAddModal}
  onDeleteSuccess={refreshAutomations}
  selectedApp={selectedApp}            // ✅ ADD THIS
  setSelectedApp={setSelectedApp}      // ✅ ADD THIS
/>

      )}
    </div>
  );
}