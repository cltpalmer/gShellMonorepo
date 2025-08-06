// src/hooks/useTemplateLoader.js
import { useState, useEffect } from 'react';

export function useTemplateLoader() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [currentTemplate, setCurrentTemplate] = useState('');
  const [variables, setVariables] = useState({});
  const [viewMode, setViewMode] = useState('raw');
  const [variableColors, setVariableColors] = useState({});
  const [fullTemplate, setFullTemplate] = useState('');
  const [template, setTemplate] = useState('');
  const [fullTemplateUrl, setFullTemplateUrl] = useState('');
  const baseURL = "https://gshell.cloud";

  // Helper function to clean up text content
  const cleanTextContent = (html) => {
    // First, handle any escaped newlines that might be in the HTML
    let cleanedHtml = html.replace(/\\n/g, '\n').replace(/\\t/g, ' ');
    
    // Create a temporary DOM element to properly extract text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanedHtml;
    
    // Get text content which automatically handles whitespace properly
    let textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Clean up excessive whitespace while preserving intentional line breaks
    textContent = textContent
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple line breaks with double
      .replace(/^\s+|\s+$/g, '') // Trim start and end
      .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space
      .replace(/\n /g, '\n') // Remove spaces after line breaks
      .replace(/\s*\n\s*/g, '\n'); // Clean up spacing around line breaks
    
    return textContent;
  };

  // 🔃 Load template names on mount
  const loadTemplateNames = async () => {
    try {
      const res = await fetch(`${baseURL}/relay/list`, {
        credentials: 'include'
      });
      const json = await res.json();
      setTemplates(json.templates);
      setSelectedTemplate(json.templates[0]?.name || '');
    } catch (err) {
      console.error("❌ Failed to load templates:", err);
    }
  };

  const refetchTemplates = () => loadTemplateNames();

  useEffect(() => {
    loadTemplateNames();
  }, []);

  // 🔃 Load the actual template content when one is selected
  useEffect(() => {
    if (!selectedTemplate) return;

    console.log(`🔄 Loading template: ${selectedTemplate}`);

    fetch(`${baseURL}/relay/${selectedTemplate}`, { credentials: 'include' })
      .then(res => res.text())
      .then(raw => {
        if (!raw) {
          console.log("❌ No template content received");
          return;
        }

        console.log({ rawPreview: raw.slice(0, 300) });
        setFullTemplate(raw);

        const uniqueVars = [...new Set(
          [...raw.matchAll(/{{\s*(\w+)\s*}}/g)]
            .map(m => m[1])
            .filter(v => v !== 'trackingPixel')
        )];

        const palette = ["#76e5ff", "#ffa776", "#b176ff", "#ff7676", "#76ffb3",
                         "#ffd276", "#76aaff", "#ff76ea", "#84ff76", "#76fff2"];
        const colour = {};
        uniqueVars.forEach(v => {
          let c;
          do { c = palette[Math.floor(Math.random() * palette.length)]; }
          while (Object.values(colour).includes(c));
          colour[v] = c;
        });

        const bodyMatch = raw.match(/<body[^>]*>((.|[\r\n])*)<\/body>/im);
        const bodyHTML = bodyMatch ? bodyMatch[1] : raw;

        const clean = bodyHTML.replace(
          /<div class="container"[^>]*>([\s\S]*?)<\/div>/i,
          '$1'
        );

        // Use the new cleaning function instead of simple regex
        const textOnly = cleanTextContent(clean);
        
        const hrefMatches = [...clean.matchAll(/href="{{\s*(\w+)\s*}}"/g)];
        const hrefVars = hrefMatches.map(m => m[1]);
        const hrefNotes = hrefVars.map(v => `🔗 This link is powered by: {{${v}}}`).join('\n');
        const extendedText = textOnly + (hrefNotes ? `\n\n${hrefNotes}` : '');

        const styledRaw = extendedText.replace(/{{\s*(\w+)\s*}}/g, (_, v) =>
          `<span class="variable" data-var="${v}" style="--var-color:${colour[v]};
           --var-bg:${colour[v]}22">{{${v}}}</span>`
        );

        // Create a styled HTML version for iframe view
        const styledFullTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Preview</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      background: #f9f9f9;
    }
    .email-content {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .variable {
      background-color: var(--var-bg, #e3f2fd);
      color: var(--var-color, #1976d2);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
    }
    p { margin: 0 0 15px 0; }
    .link-note {
      color: #666;
      font-size: 14px;
      font-style: italic;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="email-content">
    ${extendedText.split('\n').map(line => {
      if (line.trim() === '') return '<br>';
      if (line.startsWith('🔗')) return `<div class="link-note">${line}</div>`;
      return `<p>${line}</p>`;
    }).join('')}
  </div>
</body>
</html>`.replace(/{{\s*(\w+)\s*}}/g, (_, v) =>
          `<span class="variable" data-var="${v}" style="--var-color:${colour[v]};
           --var-bg:${colour[v]}22">{{${v}}}</span>`
        );

        setCurrentTemplate(styledRaw);
        setTemplate(styledRaw);
        setFullTemplate(styledFullTemplate); // Use the styled version instead of raw HTML
        setVariableColors(colour);
        setVariables(Object.fromEntries(uniqueVars.map(v => [v, ''])));
        console.log({ styledRawPreview: styledRaw.slice(0, 300) });
      })
      .catch(err => {
        console.error("❌ Failed to fetch template file:", err);
      });
  }, [selectedTemplate]);

  return {
    templates,
    selectedTemplate,
    setSelectedTemplate,
    currentTemplate,
    viewMode,
    setViewMode,
    variables,
    setVariables,
    variableColors,
    fullTemplate,
    setFullTemplate,
    template,
    setTemplate,
    fullTemplateUrl,
    setFullTemplateUrl,
    refetchTemplates,
  };
}