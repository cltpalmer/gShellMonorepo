import React, { useState } from 'react';
import Overlay from './Overlay';
import './OverlayStyles/AutomationOverlay.css';

export default function AutomationOverlay({
  show,
  onClose,
  onSave,
  defaultConfig = {}
}) {
  const [watchSheet, setWatchSheet] = useState(defaultConfig.watchSheet || '');
  const [watchColumn, setWatchColumn] = useState(defaultConfig.watchColumn || '');
  const [triggerValue, setTriggerValue] = useState(defaultConfig.triggerValue || '*');

  const [targetSheet, setTargetSheet] = useState(defaultConfig.targetSheet || '');
  const [updateField, setUpdateField] = useState(defaultConfig.updateField || '');
  const [newValue, setNewValue] = useState(defaultConfig.newValue || '');
  const [useWatchValue, setUseWatchValue] = useState(defaultConfig.useWatchValue || false);

  const [action, setAction] = useState(defaultConfig.action || 'push');
  const [matchField, setMatchField] = useState(defaultConfig.matchField || 'id');
  const [targetIdColumn, setTargetIdColumn] = useState(defaultConfig.targetIdColumn || 'user_id');
  const [alsoInclude, setAlsoInclude] = useState(defaultConfig.alsoInclude || []);

  const isMatchBased = action !== 'fillFirstEmpty';

  const handleSave = () => {
    const automation = {
      watchSheet,
      watchColumn,
      triggerValue,
      targetSheet,
      updateField,
      newValue: useWatchValue ? '__USE_TRIGGER_VALUE__' : newValue,
      useWatchValue,
      action,
      alsoInclude,
    };

    if (isMatchBased) {
      automation.matchField = matchField;
      automation.targetIdColumn = targetIdColumn;
    }
    if (alsoInclude.length > 0) {
      automation.alsoInclude = alsoInclude;
    }
    
    onSave(automation);
    onClose();
  };

  return (
<Overlay show={show} onClose={onClose}>
  <div className="automation-overlay-container">
  <h2>🤖 Automation Rule Builder</h2>
  <button className="cancel-btn" onClick={onClose}>Cancel</button>

  <div className="automation-logic-builder">
    <span className="logic-label">if</span>

    <input className="pill-input" value={watchColumn} onChange={e => setWatchColumn(e.target.value)} placeholder="columnName" />

    <span className="logic-label">=</span>

    <input className="pill-input" value={triggerValue} onChange={e => setTriggerValue(e.target.value)} placeholder="value or *" />

    <span className="logic-label">then</span>

    <select className="pill-input action-select" value={action} onChange={e => setAction(e.target.value)}>
      <option value="push">add</option>
      <option value="replace">replace</option>
      <option value="fillFirstEmpty">fill</option>
    </select>

    <span className="logic-label">to</span>

    <input className="pill-input" value={updateField} onChange={e => setUpdateField(e.target.value)} placeholder="targetColumn" />

    <span className="logic-label">from</span>

    <input className="pill-input" value={targetSheet} onChange={e => setTargetSheet(e.target.value)} placeholder="/users" />
  </div>

  <div className="also-include-section">
    <div className="include-header">
      <h4>Also include:</h4>
      <button
        className="include-add-btn"
        onClick={() =>
          setAlsoInclude([...alsoInclude, { targetField: '', sourceField: '' }])
        }
      >
        ＋ new field
      </button>
    </div>
      {alsoInclude.map((pair, index) => (
        <div key={index} className="include-row">
          <input
            className="pill-input"
            placeholder="targetField"
            value={pair.targetField}
            onChange={e => {
              const updated = [...alsoInclude];
              updated[index].targetField = e.target.value;
              setAlsoInclude(updated);
            }}
          />
          <span>←</span>
          <input
            className="pill-input"
            placeholder="sourceField"
            value={pair.sourceField}
            onChange={e => {
              const updated = [...alsoInclude];
              updated[index].sourceField = e.target.value;
              setAlsoInclude(updated);
            }}
          />
          <button
            className="include-remove-btn"
            onClick={() => {
              const updated = [...alsoInclude];
              updated.splice(index, 1);
              setAlsoInclude(updated);
            }}
          >
            ❌
          </button>
    </div>
  ))}


</div>

  {/* 💡 Optional: advanced logic */}
  {action !== 'fillFirstEmpty' && (
    <div className="match-options">
      <div className="match-option">
      <label>Match Field (source)</label>
      <input value={matchField} onChange={e => setMatchField(e.target.value)} />
      </div>
      <div className="match-option-target">
      <label>Target Column (target)</label>
      <input value={targetIdColumn} onChange={e => setTargetIdColumn(e.target.value)} />
      </div>
    </div>
  )}

  <div className="value-options">
    <label>
      <input
        type="checkbox"
        checked={useWatchValue}
        onChange={() => setUseWatchValue(prev => !prev)}
      />
      Use value from watched column?
    </label>
    {!useWatchValue && (
      <input
        className="value-input"
        value={newValue}
        onChange={e => setNewValue(e.target.value)}
        placeholder="custom value"
      />
    )}
  </div>

  <div className="button-row">
    <button className="confirm-btn" onClick={handleSave}>Save</button>
  </div>
</div>
</Overlay>

  );
}
