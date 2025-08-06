import { useEffect, useRef, useState } from 'react';
import '../styles/VariableEditor.css';
import '../styles/App.css';
export default function VariableEditor({ variables, setVariables, variableColors }) {
  const [usernames, setUsernames] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const dropdownRef = useRef();

  useEffect(() => {


  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (name, value) => {
    setVariables((prev) => {
      const updated = { ...prev, [name]: value };

      // 🔁 Live update template preview
      const spans = document.querySelectorAll(`.preview-box .variable[data-var="${name}"]`);
      spans.forEach((el) => {
        el.innerText = value || `{{${name}}}`;
      });

      // 🎯 Show filtered usernames
      if (name === 'username') {
        const results = usernames.filter((u) =>
          u.toLowerCase().includes(value.toLowerCase())
        );
        setFiltered(results.slice(0, 5)); // 🔽 limit suggestions
        setShowDropdown(true);
      }

      return updated;
    });
  };

  const handleUsernameSelect = (value) => {
    handleChange('username', value);
    setShowDropdown(false);
  };

  return (
    <div className="variable-wrapper">
      <div className="variable-title-wrapper">
        <h3 className="variable-title">variables</h3>
      </div>
      <div className="variable-group-wrapper">
        <div className="variable-group" id="variables">
          {Object.entries(variables).map(([key, value]) => (
            <div
              key={key}
              className="var-input-wrapper"
              ref={key === 'username' ? dropdownRef : null}
            >
              <input
                name={key}
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={`enter ${key}`}
                className={`var-field ${key === 'username' ? 'username' : ''}`}
                style={{
                  '--var-color': variableColors?.[key] || '#76e5ff',
                }}
                autoComplete="off"
              />
              {key === 'username' && showDropdown && filtered.length > 0 && (
                <ul className="dropdown-list">
                  {filtered.map((u) => (
                    <li key={u} onClick={() => handleUsernameSelect(u)}>
                      {u}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
