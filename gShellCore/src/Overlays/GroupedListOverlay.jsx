import React, { useState } from "react";
import Overlay from "./Overlay";
import "./OverlayStyles/groupedListOverlay.css";

export default function GroupedListOverlay({ show, onClose, onSave, initialData }) {
  const [groups, setGroups] = useState(initialData || []);

  const handleGroupNameChange = (i, newName) => {
    const updated = [...groups];
    updated[i].name = newName;
    setGroups(updated);
  };

  const handleOptionChange = (i, j, newValue) => {
    const updated = [...groups];
    updated[i].options[j] = newValue;
    setGroups(updated);
  };

  const addGroup = () => setGroups([...groups, { name: "", options: [] }]);

  const addOptionToGroup = (i) => {
    const updated = [...groups];
    updated[i].options.push("");
    setGroups(updated);
  };

  return (
    <Overlay show={show} onClose={onClose}>
      <div className="grouped-list-overlay">
        <h3>Grouped List Editor</h3>

        {groups.map((group, i) => (
          <div key={i} className="group-block">
            <input
              type="text"
              value={group.name}
              onChange={(e) => handleGroupNameChange(i, e.target.value)}
              placeholder="Group Name"
              className="group-name-input"
            />
            <ul>
              {group.options.map((opt, j) => (
                <li key={j}>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(i, j, e.target.value)}
                    placeholder="Option"
                  />
                </li>
              ))}
            </ul>
            <button onClick={() => addOptionToGroup(i)}>+ Add Option</button>
          </div>
        ))}

        <button onClick={addGroup}>+ Add Group</button>

        <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
          <button onClick={() => onSave(groups)}>✅ Save</button>
          <button onClick={onClose}>❌ Cancel</button>
        </div>
      </div>
    </Overlay>
  );
}
