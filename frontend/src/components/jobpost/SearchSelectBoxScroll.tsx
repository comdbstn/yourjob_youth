import React, { useRef } from "react";
import { LevelCode } from "../../api/getLevelOneCodes";

interface SearchSelectBoxScrollProps {
  options: LevelCode[];
  activeOption?: LevelCode | null;
  activeValues?: string[];
  onSelect: (option: LevelCode) => void;
}

const SCROLL_AMOUNT = 50; // 한번에 스크롤할 픽셀 양

const SearchSelectBoxScroll: React.FC<SearchSelectBoxScrollProps> = ({
  options,
  activeOption,
  activeValues,
  onSelect,
}) => {
  const listRef = useRef<HTMLUListElement>(null);

  const scrollUp = () => {
    listRef.current?.scrollBy({ top: -SCROLL_AMOUNT, behavior: "smooth" });
  };

  const scrollDown = () => {
    listRef.current?.scrollBy({ top: SCROLL_AMOUNT, behavior: "smooth" });
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* 위로 스크롤 버튼 */}
      {/* <button
        type="button"
        onClick={scrollUp}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          zIndex: 1,
          background: "none",
          color: "black",
          cursor: "pointer",
        }}
      >
        ▲
      </button> */}

      {/* 스크롤 리스트 */}
      <ul
        ref={listRef}
        className="select_box-scroll"
        style={{
          maxHeight: "230px",
          overflowY: "scroll",
          scrollbarGutter: "stable",
          boxShadow:
            "inset 0 8px 8px -8px rgba(0,0,0,0.2), inset 0 -8px 8px -8px rgba(0,0,0,0.2)",
          paddingRight: "4px",
          margin: 0,
          padding: 0,
          listStyle: "none",
        }}
      >
        {options.map((option) => {
          const isActive = activeValues
            ? activeValues.includes(option.code)
            : activeOption?.code === option.code;
          return (
            <li
              key={option.code}
              className={isActive ? "active" : ""}
              onClick={() => onSelect(option)}
              style={{
                padding: "8px",
                cursor: "pointer",
                background: isActive ? "#eef" : "transparent",
              }}
            >
              {option.levelValue}
            </li>
          );
        })}
      </ul>

      {/* 아래로 스크롤 버튼 */}
      {/* <button
        type="button"
        onClick={scrollDown}
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,

          zIndex: 1,
          background: "none",
          borderRadius: "50%",
          cursor: "pointer",
          color: "black",
        }}
      >
        ▼
      </button> */}
    </div>
  );
};

export default SearchSelectBoxScroll;
