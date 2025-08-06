import React, { useState } from "react";
import GroupedListOverlay from "../Overlays/GroupedListOverlay";

export default function ListInputChooser({ onSubmit }) {
  const [mode, setMode] = useState("normal"); // "normal" or "grouped"
  const [showOverlay, setShowOverlay] = useState(false);
  const [normalText, setNormalText] = useState("");

  const handleGroupedSave = (groupedData) => {
    setShowOverlay(false);
    onSubmit(groupedData); // send grouped format back
  };

  const handleNormalSubmit = () => {
    const list = normalText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onSubmit(list); // send simple array
  };

  return (
    <div>
      <label>
        <input
          type="radio"
          value="normal"
          checked={mode === "normal"}
          onChange={() => setMode("normal")}
        />
        Normal List
      </label>
      <label style={{ marginLeft: "1rem" }}>
        <input
          type="radio"
          value="grouped"
          checked={mode === "grouped"}
          onChange={() => setMode("grouped")}
        />
        Grouped List
      </label>

      {mode === "normal" && (
        <div>
          <textarea
            placeholder="Enter comma-separated values"
            value={normalText}
            onChange={(e) => setNormalText(e.target.value)}
            style={{ width: "100%", marginTop: "1rem" }}
          />
          <button onClick={handleNormalSubmit} style={{ marginTop: "0.5rem" }}>
            Save List
          </button>
        </div>
      )}

      {mode === "grouped" && (
        <button onClick={() => setShowOverlay(true)} style={{ marginTop: "1rem" }}>
          Open Grouped List Editor
        </button>
      )}

      <GroupedListOverlay
        show={showOverlay}
        onClose={() => setShowOverlay(false)}
        onSave={handleGroupedSave}
      />
    </div>
  );
}
