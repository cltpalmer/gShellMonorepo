// src/components/CustomDropdown.jsx
import { useState, useRef, useEffect } from "react";

export default function CustomDropdown({ options = [], selected, onChange }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="dropdown-wrapper" ref={wrapperRef}>
      <div
        className="dropdown-header"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{selected || "Select a template"}</span>
        <svg
          className={`chevron ${open ? "rotate" : ""}`}
          viewBox="0 0 24 24"
          width={20}
          height={20}
        >
          <path d="M7 10l5 5 5-5" fill="none" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      {open && (
        <ul className="dropdown-list">
          {options.map((option) => (
            <li
              key={option}
              className={`dropdown-item ${option === selected ? "active" : ""}`}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
