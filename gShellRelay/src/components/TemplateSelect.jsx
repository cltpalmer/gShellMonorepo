import { useState, useEffect, useRef } from 'react';
import '../styles/TemplateSelect.css';
import down from '../assets/down.png';

export default function TemplateSelect({ templates, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  return (
    <div className="custom-select-wrapper" ref={ref}>
    <div
      className="custom-select-box"
      onClick={() => setOpen(!open)}
    >
      <img src={down} alt="icon" className="select-icon" />
      {selected || 'choose template'}
    </div>
  
        {open && (
          <ul className="custom-select-dropdown">
            {templates.map((t) => (
              <li
                key={t.name || t}
                onClick={() => {
                  onChange(t.name || t);
                  setOpen(false);
                }}
              >
                {(t.name || t).replace(/([A-Z])/g, ' $1').toLowerCase()}
              </li>
            ))}
          </ul>
        )}
      </div>
  );
}