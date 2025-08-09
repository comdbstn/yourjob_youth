import React, { useState } from 'react';

interface Option {
  value: string;
  label: string;
  style?: React.CSSProperties;
}

interface SearchSelectBoxProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  style?: React.CSSProperties;
}

const SearchSelectBox: React.FC<SearchSelectBoxProps> = ({ value, onChange, options, style }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`nice-select ${isOpen ? 'open' : ''}`} style={style} tabIndex={0} onClick={() => setIsOpen(!isOpen)}>
      <span className="current">{options.find(option => option.value === value)?.label}</span>
      <ul className="list">
        {options.map(option => (
          <li
            key={option.value}
            data-value={option.value}
            className={`option ${option.value === value ? 'selected' : ''}`}
            onClick={() => handleOptionClick(option.value)}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchSelectBox;