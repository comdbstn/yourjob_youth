import React, { useState, useRef, useEffect } from "react";
import "../../../public/css/nice-select.css";

interface NiceSelectBoxProps {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string | null) => void;
  placeholder?: string;
}

const NiceSelectBox: React.FC<NiceSelectBoxProps> = ({
  value,
  onChange,
  options,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={selectRef}
      className={`nice-select ${isOpen ? "open" : ""}`}
      tabIndex={0}
      onClick={() => setIsOpen(!isOpen)}
    >
      <span
        className="current"
        style={{
          display: "inline-block",
          verticalAlign: "middle",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "calc(100% - 15px)",
        }}
      >
        {options.find((option) => option.value === value)?.label || placeholder}
      </span>
      <ul className="list">
        {options.map((option) => (
          <li
            key={option.value}
            data-value={option.value}
            className={`option ${option.value === value ? "selected" : ""}`}
            onClick={() => handleOptionClick(option.value)}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NiceSelectBox;
