import React from 'react';
import '../styles/HeaderBar.css'; // optional, or use your main CSS
import { Link } from 'react-router-dom';

function HeaderBar() {
  return (
    <div className="header-bar">
      <div className="header-left">
        <img src="/favicon.png" alt="SendIO Logo" className="logo" />
        <h1>SendIO</h1>
      </div>
      <div className="header-right">
  <Link to="/database" className="nav-link">Database</Link>
  <Link to="/" className="nav-link">Send</Link>
  <Link to="/templates" className="nav-link">Templates</Link>
<Link to="/create" className="nav-link">Create</Link>
<Link to="/automations" className="nav-link">Automations</Link>
</div>
    </div>  
  );
}

export default HeaderBar;
