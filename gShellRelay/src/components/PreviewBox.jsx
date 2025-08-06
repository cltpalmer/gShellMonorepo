// src/components/PreviewBox.jsx
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../styles/PreviewBox.css';
import ToggleBar from '../components/ToggleBar';

export default function PreviewBox({ template, variables, setViewMode, viewMode, fullTemplate, className = '' }) {
  const iframeRef = useRef();
  const [isExpanded, setIsExpanded] = useState(false);

  function renderWithVars(raw, vars) {
    if (!raw) return ""; 
  
    return raw.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
      const val = vars[key];
      return val ? val : `{{${key}}}`;
    });
  }

  // Handle body scroll lock when overlay is open
  useEffect(() => {
    if (isExpanded) {
      document.body.classList.add('overlay-open');
      // Also disable scrolling on html element for better compatibility
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('overlay-open');
      document.documentElement.style.overflow = 'auto';
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('overlay-open');
      document.documentElement.style.overflow = 'auto';
    };
  }, [isExpanded]);

  // Handle escape key to close overlay
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isExpanded]);
  
  useEffect(() => {
    if (viewMode !== 'raw') return;
  
    const previewBox = document.querySelector('.preview-box');
  
    function delegatedClick(e) {
      const el = e.target.closest('.variable');
      if (!el) return;
  
      const varName = el.dataset.var;
      const input   = document.querySelector(`input[name="${varName}"]`);
      if (!input) return;
  
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
      previewBox.querySelectorAll('.variable').forEach(span =>
        span.classList.toggle('active', span === el)
      );
  
      const orb  = document.createElement('div');
      orb.className = 'orb';
      orb.style.color = getComputedStyle(el).getPropertyValue('--var-color').trim();
      document.body.appendChild(orb);
  
      const start = el.getBoundingClientRect();
      const end   = input.getBoundingClientRect();
      orb.style.left = `${start.left + start.width / 2}px`;
      orb.style.top  = `${start.top  + start.height / 2}px`;
      orb.style.position = 'fixed';
      orb.getBoundingClientRect();
      orb.style.transform = `translate(${end.left - start.left}px, ${end.top - start.top}px) scale(2)`;
      orb.style.opacity   = '0';
      setTimeout(() => orb.remove(), 600);
    }
  
    previewBox.addEventListener('click', delegatedClick);
    return () => previewBox.removeEventListener('click', delegatedClick);
  }, [viewMode]); 
  
  useEffect(() => {
    if (viewMode !== 'raw') return;
  
    const html = renderWithVars(template, variables);
  
    const box = document.querySelector('.preview-box .raw-view');
    if (box) box.innerHTML = html;
  }, [variables, template, viewMode]);
  
  useEffect(() => {
    if (viewMode !== 'iframe' || !fullTemplate || !iframeRef.current) return;

    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    const renderedHTML = renderWithVars(fullTemplate, variables);

    doc.open();
    doc.write(renderedHTML);
    doc.close();
  }, [viewMode, fullTemplate, variables]);

  const overlayContent = isExpanded && (
    <div className="iframe-overlay" onClick={(e) => {
      if (e.target.className === 'iframe-overlay') {
        setIsExpanded(false);
      }
    }}>
      <button className="close-btn" onClick={() => setIsExpanded(false)}>
        ✖
      </button>
      <iframe
        srcDoc={renderWithVars(fullTemplate, variables)}
        title="Expanded Styled Email"
        className="expanded-iframe"
      />
    </div>
  );

  return (
    <>
<div className={`preview-box-wrapper ${className}`}>
<div className="preview-box">
  
          <ToggleBar
            viewMode={viewMode}
            setViewMode={setViewMode}
            setIsExpanded={setIsExpanded}
          />
  
  {viewMode === 'raw' ? (
  <div
    className="raw-view"
    dangerouslySetInnerHTML={{ __html: renderWithVars(template, variables) }}
  />

          ) : (
            <iframe
              ref={iframeRef}
              title="Styled Email Preview"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '12px',
                backgroundColor: '#fff',
              }}
            />
          )}
  
        </div>
      </div>
  
      {/* Render overlay at document.body level using createPortal */}
      {overlayContent && createPortal(overlayContent, document.body)}
    </>
  );
}