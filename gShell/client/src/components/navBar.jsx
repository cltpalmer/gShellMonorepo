import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { openApp } from '../../../shared/utils/navHelpers'; // adjust path if needed

import './navBar.css';

import sendIcon from './assets/send.png';
import homeIcon from './assets/home.png';
import settingsIcon from './assets/settings.png';
import docsIcon from './assets/docs.png';
import integrateIcon from './assets/integrate.png';
import terminalIcon from './assets/terminal.png';
import databaseIcon from './assets/database.png';
import showIcon from './assets/show.png';
import exitIcon from './assets/backExit.png';

const iconMap = {
  gShellTerminal: terminalIcon,
  gShellCore: databaseIcon,
  gShellRelay: sendIcon,
  gShellIntegrate: integrateIcon,
  gShellDocs: docsIcon,
  gShellSettings: settingsIcon,
};

const launchableApps = ['gShellCore', 'gShellRelay', 'gShellTerminal'];

function NavBar() {
  const navigate = useNavigate();
  const [navBar, showNavBar] = useState(false);

  return (
    <div className="whole-nav">
      <nav className="left-navbar" style={{ display: navBar ? 'none' : 'flex' }}>
        <div className="gradient-border"></div>

        {/* Home */}
        <ul className="nav-section top-nav">
          <li>
            <button className="nav-icon-button" title="Home">
              <img
                src={homeIcon}
                className="nav-icon"
                alt="home"
                onClick={() => openApp('gShellTerminal')}
              />
            </button>
          </li>
        </ul>

        {/* Apps */}
        <ul className="nav-section middle-nav">
          {launchableApps.map((appName) => {
            const icon = iconMap[appName] || terminalIcon;
            return (
              <li key={appName}>
                <button className="nav-icon-button" title={appName}>
                  <img
                    src={icon}
                    className="nav-icon"
                    alt={appName}
                    onClick={() => openApp(appName)}
                  />
                </button>
              </li>
            );
          })}
        </ul>

        {/* Bottom nav */}
        <ul className="nav-section bottom-nav">
          <li>
            <button
              className="nav-icon-button"
              title="Integrations"
              onClick={() => window.open('https://core.gshell.cloud/integrations', '_blank')}
            >
              <img src={iconMap.gShellIntegrate} className="nav-icon" alt="Integrations" />
            </button>
          </li>

          <li>
            <button
              className="nav-icon-button"
              title="Docs"
              onClick={() => window.open('https://cltpalmer.github.io/gShellDocs/index.html', '_blank')}
            >
              <img src={iconMap.gShellDocs} className="nav-icon" alt="docs" />
            </button>
          </li>

          <li>
            <button className="nav-icon-button" title="Settings">
              <img
                src={iconMap.gShellSettings}
                className="nav-icon"
                alt="settings"
                onClick={() => window.open('https://terminal.gshell.cloud/settings', '_blank')}
              />
            </button>
          </li>
        </ul>
      </nav>

      {/* Right side */}
      <div className="right-navbar">
        <button className="exit-btn" onClick={() => navigate('/')}>
          <img src={exitIcon} alt="exit" />
          <span>back</span>
        </button>

        <button
          className="show-navbar-btn-icon"
          title={navBar ? 'Hide Navigation' : 'Show Navigation'}
          onClick={() => showNavBar(!navBar)}
        >
          <img
            src={showIcon}
            style={{
              transform: navBar ? 'scaleX(1)' : 'scaleX(-1)',
              transition: 'transform 0.3s ease',
            }}
            alt="show"
          />
          <span>{navBar ? 'show' : 'hide'}</span>
        </button>
      </div>
    </div>
  );
}

export default NavBar;
