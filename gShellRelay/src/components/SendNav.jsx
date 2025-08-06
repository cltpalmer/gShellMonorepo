// src/components/SendNav.jsx
import { Link, useLocation } from "react-router-dom";
import "../styles/SendNav.css"; // if needed for styling
import { useState } from "react";

export default function SendNav() {
  const location = useLocation();


  return (
    <div className="send-sub-buttons">
      <Link to="/" className={location.pathname === "/" ? "nav-link active" : "nav-link"}>Send</Link>
      <Link to="/templates" className={location.pathname === "/templates" ? "nav-link active" : "nav-link"}>Templates</Link>
      <Link to="/create" className={location.pathname === "/create" ? "nav-link active" : "nav-link"}>Create</Link>
      <Link to="/automations" className={location.pathname === "/automations" ? "nav-link active" : "nav-link"}>Automations</Link>
    </div>
  );
}
