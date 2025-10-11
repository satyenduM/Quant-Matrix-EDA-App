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
          <div className="logo-text">
            <img src="https://quantmatrix.ai/assets/logo-BlQOt2VI.svg" alt="Logo"/>
          </div>
        </div>
      </div>
      <div className="header-right">
        <div className="project-name">
          <span className="globe-icon">🌐</span>
          <span>Satyendu Mohapatra</span>
        </div>
        <div className="user-avatar">
          <div className="avatar-circle">S</div>
        </div>
      </div>
    </header>
  );
};

export default Header;

