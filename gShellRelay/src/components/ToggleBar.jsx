import { useState } from 'react';
import rawIcon from '../assets/raw.png'; // Or use online link
import prettyIcon from '../assets/pretty.png';
import expandIcon from '../assets/expand.png';


export default function ToggleBar({ setIsExpanded, viewMode, setViewMode }) {
  return (


    <div className="controls-bar">
{viewMode === 'iframe' && (
  <div className="expand-btn">
    <button className="expand-btn-icon" onClick={() => setIsExpanded(true)}>
      <img src={expandIcon} alt="Expand" />
    </button>
  </div>
)}

    <div className="preview-toggle-slide">
      <div
        className="toggle-bg"
        style={{ left: viewMode === 'raw' ? '9px' : '42px' }}
      />
      <button onClick={() => setViewMode('raw')}>
        <img src={rawIcon} alt="Raw" />
      </button>
      <button onClick={() => setViewMode('iframe')}>
        <img src={prettyIcon} alt="Styled" />
      </button>
    </div>
  </div>
  );
}
