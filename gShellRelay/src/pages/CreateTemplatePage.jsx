import { useState, useEffect, useMemo, memo } from 'react';
import PreviewBox from '../components/PreviewBox';
import ToggleBar from '../components/ToggleBar';
import '../styles/CreateTemplatePage.css';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const MemoizedPreviewBox = memo(PreviewBox);

export default function CreateTemplatePage() {
  const navigate = useNavigate();
  const [rawInput, setRawInput] = useState('');
  const [template, setTemplate] = useState('');
  const [variables, setVariables] = useState({});
  const [variableColors, setVariableColors] = useState({});
  const [selectedVariable, setSelectedVariable] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [subjectLine, setSubjectLine] = useState('');
  const { name: templateName } = useParams(); // will be undefined if you're creating
  const [viewMode, setViewMode] = useState('raw');
  const [isExpanded, setIsExpanded] = useState(false);   // optional, for expand
  const baseURL = "https://gshell.cloud";

  const colorPalette = [
    '#76e5ff', '#ffa776', '#b176ff', '#ff7676', '#76ffb3',
    '#ffd276', '#76aaff', '#ff76ea', '#84ff76', '#76fff2'
  ];

  const handleTypingChange = (e) => {
    setRawInput(e.target.value);
  };

  const handleFormat = () => {
    if (!rawInput.trim()) return;
    const formatted = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formatted Template</title>
  </head>
  <body>
    ${rawInput}
  </body>
  </html>`;
    setRawInput(formatted);
  };

  const handleVariableSelect = (variable) => {
    setDropdownOpen(false);
    const textarea = document.querySelector('.raw-editor');
    const cursorPos = textarea.selectionStart;
    const before = rawInput.slice(0, cursorPos);
    const after = rawInput.slice(cursorPos);
    const newInput = before + variable + after;
    setRawInput(newInput);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = cursorPos + variable.length;
    }, 0);
  };
 // ✨ Local helper function to build the .hbs template
 const generateHBSContent = (subject, raw) => {
    const safeSubject = subject?.trim() || 'No Subject';
    return `{{!-- subject: ${safeSubject} --}}\n\n${raw}`;
  };


  async function uploadTemplateToBackend(title, content) {
    const res = await fetch(`${baseURL}/relay/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // 🍪 Sends session cookie!
      body: JSON.stringify({ name: title, content }),
    });
  
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.path;
  }
  

  const handleCreateTemplate = async () => {
    if (!rawInput.trim() || !subjectLine.trim()) {
      alert('❗ Please fill in the subject and content');
      return;
    }

    const hbsContent = generateHBSContent(subjectLine, rawInput);
    const safeFilename = templateName || subjectLine.trim().toLowerCase().replace(/\s+/g, '-');
  
    try {
      const path = await uploadTemplateToBackend(safeFilename, hbsContent);
      alert(`✅ Template "${safeFilename}" saved to: ${path}`);
      navigate('/templates'); // optional redirect
      console.log('Sending to backend:', JSON.stringify(hbsContent)); // See if \n are here

    } catch (err) {
      console.error('Upload failed:', err);
      alert('❌ Upload failed: ' + err.message);
    }
  };
  
  
 const getNextAvailableColor = (usedColors) => {
    const availableColors = colorPalette.filter(color => !Object.values(usedColors).includes(color));
    
    if (availableColors.length > 0) {
      // Return a unique color if available
      return availableColors[Math.floor(Math.random() * availableColors.length)];
    } else {
      // Reuse colors when palette is exhausted
      return colorPalette[Math.floor(Math.random() * colorPalette.length)];
    }
  };

  useEffect(() => {
    if (templateName) {
      // fetch the existing .hbs file and load it
      (async () => {
        try {
          const res = await fetch(`${baseURL}/relay/${templateName}`, {
            credentials: 'include',
          });
          if (!res.ok) throw new Error('Failed to fetch template');

          const jsonResponse = await res.json();
          const content = jsonResponse.content;

          const subjectMatch = content.match(/{{!--\s*subject:\s*(.*?)\s*--}}/i);
          const cleaned = content.replace(/{{!--[\s\S]*?--}}/, '').trim();
          
          setSubjectLine(subjectMatch?.[1]?.trim() || '');
          setRawInput(cleaned);
          
        } catch (err) {
          console.error('❌ Failed to load template:', err);
        }
      })();
    }
  }, [templateName]);
  
  useEffect(() => {
    const matches = [...rawInput.matchAll(/{{\s*(\w+)\s*}}/g)];
    const varList = [...new Set(matches.map(m => m[1]))];
    const newColors = { ...variableColors };
    let updated = false;

    varList.forEach(v => {
      if (!newColors[v]) {
        newColors[v] = getNextAvailableColor(newColors);
        updated = true;
      }
    });

    if (updated) setVariableColors(newColors);
    setVariables(Object.fromEntries(varList.map(v => [v, ''])));
  }, [rawInput]);

  const styledTemplate = useMemo(() => {
    return rawInput.replace(/{{\s*(\w+)\s*}}/g, (_, v) =>
      `<span class="variable" data-var="${v}" style="--var-color:${variableColors[v]}; --var-bg:${variableColors[v]}22">{{${v}}}</span>`
    );
  }, [rawInput, variableColors]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTemplate(styledTemplate);
    }, 200);
    return () => clearTimeout(timeout);
  }, [styledTemplate]);

  return (
    <div className="create-template-wrapper">

        {/* Tool buttons */}
        <div className="tool-btn-wrapper">
            <div className="dropdown-container">
              <button className="variable-dropdown" onClick={() => setDropdownOpen(!dropdownOpen)}>
                Variable
              </button>
              {dropdownOpen && (
                <div className="variable-dropdown-options">
                  {["{{username}}", "{{prize}}", "{{battleName}}", "{{winnerName}}"].map(v => (
                    <div key={v} className="variable-dropdown-option" onClick={() => handleVariableSelect(v)}>
                      {v}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="format-btn" onClick={handleFormat}>format</button>
        </div>
      <div className="content-width">

  
        {/* Content Box */}
        <div className="create-box">

          {/* Header Row (NEW) */}
<div className="template-header-row">
<div className="create-title-wrapper">
<h2 className="create-template-title">
  {templateName ? 'Update Template' : 'Create Template'}
</h2>
</div>
<div className="subject-line-wrapper">
  <input
    className="subject-line"
    type="text"
    placeholder="Subject Line"
    value={subjectLine}
    onChange={(e) => setSubjectLine(e.target.value)}
  />
</div>
</div>


          <div className="create-box-whole">
  <div className="raw-editor-wrapper">
            <textarea
              className="raw-editor"
              value={rawInput}
              onChange={handleTypingChange}
              placeholder="Write your raw HTML here..."
            />
  </div>  
  
            <div className="create-preview-wrapper">
              <MemoizedPreviewBox
                className="create-preview-box"
                template={template}
                variables={variables}
                variableColors={variableColors}
                setViewMode={setViewMode}
                viewMode={viewMode}
                fullTemplate={generateHBSContent(subjectLine, rawInput)}  // ✅ Needed for iframe view
                />
              <button className="create-template-btn" onClick={handleCreateTemplate}>
                {templateName ? 'Update' : 'Create'}
              </button>
              
            </div>
          </div>
        </div>
      </div>
      </div>

  );
  
}