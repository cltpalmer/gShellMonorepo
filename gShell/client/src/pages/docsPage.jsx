import '../styles/docsPage.css';

export default function DocsPage() {
  // ✅ Define your hardcoded list first
  const fileNames = [
    "/docs/readMe.html",
    "/docs/howToUse.html",
    "/docs/learnCommands.html",
  ];

  // ✅ Then map over it
  const files = fileNames.map(file => {
    const parts = file.split('/');
    const name = parts[parts.length - 1].replace('.html', '');
    return {
      path: file,
      label: name,
    };
  });

  
  return (
    <div className="docs-page">
      <div className="docs-header">
        <h1 className="app-title">gShell <span className="docs">Docs &gt; .</span></h1>
        <input className="search-docs" type="text" placeholder="Search..." />
      </div>
  
      <div className="file-grid">
        {files.map((doc, index) => (
          <a
            key={index}
            href={doc.path}
            target="_blank"
            rel="noopener noreferrer"
            className="file-pill"
          >
            <div className="circle" />
            {doc.label}
          </a>
        ))}
      </div>
    </div>
  );
  
}
