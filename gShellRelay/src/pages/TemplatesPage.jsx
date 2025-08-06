import { useTemplateLoader } from '../hooks/useTemplateLoader';
import { Link } from 'react-router-dom';
import { useState } from 'react';

import '../styles/TemplatesPage.css';

import ChangeApp from '../components/changeApp';

export default function TemplatesPage() {
  const { templates, refetchTemplates } = useTemplateLoader(); // ✅ expose setTemplates in the hook
  const [selectedTemplates, setSelectedTemplates] = useState(new Set());
  const baseURL = "https://gshell.cloud";



  async function deleteSelectedTemplates() {
    const confirmDelete = window.confirm("Are you sure you want to delete selected templates?");
    if (!confirmDelete) return;
  
    for (let name of selectedTemplates) {
      try {
        const res = await fetch(`${baseURL}/relay/${name}`, {
          method: 'DELETE',
          credentials: 'include', // required if using cookie sessions
        });
  
        const json = await res.json();
        if (!json.success) {
          console.error(`❌ Failed to delete ${name}:`, json.message);
        } else {
          console.log(`✅ Deleted: ${name}`);
        }
  
      } catch (err) {
        console.error(`❌ Network error deleting ${name}:`, err);
      }
    }
  
    // Refresh list
    refetchTemplates();
    setSelectedTemplates(new Set());
    alert('✅ Templates deleted!');
  }
  

  return (
    <div className="templates-page">

      <ChangeApp />
      <div className="templates-container">
      <h1 className="template-title">
        Your 
        <span className="template-title-span">Templates</span>
        </h1>

      <div className="template-grid">
        {templates.map((template, index) => (
          <div
  className={`template-card-wrapper ${
    selectedTemplates.has(template.name) ? 'selected' : ''
  }`}
  key={index}
>
            <input
              type="checkbox"
              className="card-checkbox"
              onChange={(e) => {
                const updated = new Set(selectedTemplates);
                e.target.checked
                  ? updated.add(template.name)
                  : updated.delete(template.name);
                setSelectedTemplates(updated);
              }}
            />
<Link to={`/create/${template.name}`} className="template-card">
<div className="template-preview-wrapper">
  <iframe
    src={`${baseURL}/relay/${template.name}`}
    className="template-preview-frame"
    sandbox=""
  ></iframe>
</div>


  <p className="template-name">{template.name}</p>
</Link>


          </div>
        ))}
      </div>
      </div>

      <Link to="/create" className="floating-create-btn">
        <svg className="plus-icon" viewBox="0 0 24 24">
          <path fill="white" d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span>create</span>
      </Link>

      {selectedTemplates.size > 0 && (
        <button className="delete-template-btn" onClick={deleteSelectedTemplates}>
          Delete Selected ({selectedTemplates.size})
        </button>
      )}
   
    </div>
  );
}
