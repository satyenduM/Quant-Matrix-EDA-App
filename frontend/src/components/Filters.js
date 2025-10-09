import React from 'react';
import './Filters.css';
import MultiSelect from './MultiSelect';

const Filters = ({ filterOptions, selectedFilters, onFilterChange, onReset }) => {
  return (
    <div className="filters-container">
      <div className="filters-row">
        <MultiSelect
          label="Channel"
          options={filterOptions.channels}
          selected={selectedFilters.channels}
          onChange={(values) => onFilterChange('channels', values)}
        />
        
        <MultiSelect
          label="Brand"
          options={filterOptions.brands}
          selected={selectedFilters.brands}
          onChange={(values) => onFilterChange('brands', values)}
        />
        
        <MultiSelect
          label="Pack Type"
          options={filterOptions.packTypes}
          selected={selectedFilters.packTypes}
          onChange={(values) => onFilterChange('packTypes', values)}
        />
        
        <MultiSelect
          label="PPG"
          options={filterOptions.ppgs}
          selected={selectedFilters.ppgs}
          onChange={(values) => onFilterChange('ppgs', values)}
        />
        
        <MultiSelect
          label="Year"
          options={filterOptions.years}
          selected={selectedFilters.years}
          onChange={(values) => onFilterChange('years', values)}
        />
        
        <button className="reset-button" onClick={onReset}>
          <span className="reset-icon">↻</span>
          Reset
        </button>
      </div>
    </div>
  );
};

export default Filters;

