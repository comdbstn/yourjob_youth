import React, { useState } from 'react';
import { JobPostSearchFilterOption } from '../../../types/jobPost';

interface SelectBoxScrollProps {
  options: JobPostSearchFilterOption[];
  activeOption: JobPostSearchFilterOption | null;
  onSelect: (option: JobPostSearchFilterOption) => void;
}

const SelectBoxScroll: React.FC<SelectBoxScrollProps> = ({ options, activeOption, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: JobPostSearchFilterOption) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="select-box">
      <div className="selected" onClick={() => setIsOpen(!isOpen)}>
        {activeOption ? activeOption.label : '선택하세요'}
      </div>
      {isOpen && (
        <ul className="options">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option)}
              className={activeOption?.value === option.value ? 'active' : ''}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SelectBoxScroll; 