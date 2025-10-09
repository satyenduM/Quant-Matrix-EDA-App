import React from 'react';
import './Header.css';

const Header = ({ activeTab, setActiveTab }) => {
  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-icon">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="logo">
          <div className="logo-brackets">[ ]</div>
          <div className="logo-text">
            <div className="logo-quant">QUANT</div>
            <div className="logo-matrix">MATRIX AI</div>
          </div>
        </div>
      </div>
      <div className="header-right">
        <div className="project-name">
          <span className="globe-icon">🌐</span>
          <span>Project Name</span>
        </div>
        <button className="icon-button">✉️</button>
        <button className="icon-button">🔔</button>
        <div className="user-avatar">
          <div className="avatar-circle">U</div>
          <div className="status-dot"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;

