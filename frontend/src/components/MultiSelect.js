import React, { useState, useRef, useEffect } from 'react';
import './MultiSelect.css';

const MultiSelect = ({ label, options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (value) => {
    const newSelected = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const displayText = selected.length === 0 ? 'All' : 
                      selected.length === 1 ? selected[0] :
                      `${selected.length} selected`;

  return (
    <div className="multiselect" ref={dropdownRef}>
      <label className="multiselect-label">{label}</label>
      <div 
        className="multiselect-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{displayText}</span>
        <span className={`arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>
      
      {isOpen && (
        <div className="multiselect-dropdown">
          <div className="multiselect-option" onClick={() => onChange([])}>
            <input 
              type="checkbox" 
              checked={selected.length === 0}
              readOnly
            />
            <span>All</span>
          </div>
          {options.map(option => (
            <div 
              key={option} 
              className="multiselect-option"
              onClick={() => handleToggle(option)}
            >
              <input 
                type="checkbox" 
                checked={selected.includes(option)}
                readOnly
              />
              <span>{option}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;

