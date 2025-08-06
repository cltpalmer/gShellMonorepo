import React, { useMemo } from 'react';
import "./SmartInput.css";

export default function SmartInput({ value, onChange, columnKey, allRows }) {
  const datalistId = `smart-${columnKey}`;

  const suggestions = useMemo(() => {
    const raw = allRows.map(row => row?.[columnKey]);
    return [...new Set(raw)].filter(Boolean);
  }, [allRows, columnKey]);

  return (
    <>
      <input
        type="text"
        list={datalistId}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoFocus
      />
      <datalist id={datalistId}>
        {suggestions.map((item, idx) => (
          <option key={idx} value={item} />
        ))}
      </datalist>
    </>
  );
}
