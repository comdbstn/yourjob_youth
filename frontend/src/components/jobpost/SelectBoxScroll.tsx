import React from "react";
import { JobPostSearchFilterOption } from "../../types/jobPost";

interface SelectBoxScrollProps {
  options: JobPostSearchFilterOption[];

  activeOption?: JobPostSearchFilterOption | null;

  activeValues?: string[];
  onSelect: (option: JobPostSearchFilterOption) => void;
}

const SelectBoxScroll: React.FC<SelectBoxScrollProps> = ({
  options,
  activeOption,
  activeValues,
  onSelect,
}) => {
  return (
    <ul className="select_box-scroll">
      {options.map((option) => {
        const isActive = activeValues
          ? activeValues.includes(option.value)
          : activeOption?.value === option.value;
        return (
          <li
            key={option.value}
            className={isActive ? "active" : ""}
            onClick={() => onSelect(option)}
          >
            {option.label}
          </li>
        );
      })}
    </ul>
  );
};

export default SelectBoxScroll;
