import { useEffect, useState } from 'react';
import '../styles/toggleSlider.css';
import darkIcon from '../assets/dark.png';
import lightIcon from '../assets/light.png';

export default function ToggleSlider() {
  
  const [isToggled, setIsToggled] = useState(() => {
    // ✅ Load from localStorage if it exists
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    // ✅ Apply body class
    document.body.className = isToggled ? 'dark' : 'light';
    localStorage.setItem('theme', isToggled ? 'dark' : 'light');
  }, [isToggled]);

  const handleToggle = () => {
    setIsToggled(prev => !prev);
  };

  return (
    <div className="toggle-slider-container">
      <img
        src={isToggled ? darkIcon : lightIcon}
        className="toggle-label"
        alt={isToggled ? "Light Mode" : "Dark Mode"}
      />

      <div className="toggle-switch-container">
        <input
          type="checkbox"
          id="myToggleCheckbox"
          className="hidden-checkbox"
          checked={isToggled}
          onChange={handleToggle}
        />
        <label
          htmlFor="myToggleCheckbox"
          className="toggle-slider"
          role="switch"
          aria-checked={isToggled}
        />
      </div>
    </div>
  );
}
