import React, { useState, useRef, useEffect } from "react";
import { schoolSearchService } from "../../../../api/schoolSearch";
import "./SearchableInputMobile.css";
interface SearchableInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  placeholder?: string;
  dataField: "level1" | "level2" | "level3";
  dataType: string;
  level1Query?: string;
  level2Query?: string;
  level3Query?: string;
  keywordQuery?: string;
}

const SearchableInputMobile: React.FC<SearchableInputProps> = ({
  value,
  onChange,
  onSelect,
  placeholder,
  dataField,
  dataType,
  level1Query,
  level2Query,
  level3Query,
  keywordQuery,
}) => {
  const [showResults, setShowResults] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!value.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        let results: string[] = [];

        if (dataType === "국내대학" || dataType === "해외대학") {
          const searchData = await schoolSearchService.searchSchools(
            value,
            100,
            dataType,
            level1Query,
            level2Query,
          );

          if (dataField === "level3") {
            results = searchData
              .map((item) => item.schoolName)
              .filter((name): name is string => Boolean(name));
          } else if (dataField === "level2") {
            const level2Values = searchData
              .map((item) => item.level2)
              .filter((val): val is string => Boolean(val));
            results = [...new Set(level2Values)];
          } else if (dataField === "level1") {
            const level1Values = searchData
              .map((item) => item.level1)
              .filter((val): val is string => Boolean(val));
            results = [...new Set(level1Values)];
          }
        } else if (dataType === "국내대학전공") {
          let searchKeyword = "";
          let schoolFilter = "";

          if (
            dataField === "level1" ||
            dataField === "level2" ||
            dataField === "level3"
          ) {
            searchKeyword = value;
          }

          if (keywordQuery && keywordQuery.trim()) {
            schoolFilter = keywordQuery;
          } else if (level1Query && level1Query.trim()) {
            schoolFilter = level1Query;
          }

          const searchData = await schoolSearchService.searchMajors(
            searchKeyword,
            100,
            "국내전공",
            schoolFilter,
            level2Query,
          );

          if (dataField === "level1") {
            const level1Values = searchData
              .map((item) => item.level1)
              .filter((val): val is string => Boolean(val));
            results = [...new Set(level1Values)];
          } else if (dataField === "level2") {
            const level2Values = searchData
              .map((item) => item.level2)
              .filter((val): val is string => Boolean(val));
            results = [...new Set(level2Values)];
          } else if (dataField === "level3") {
            const level3Values = searchData
              .map((item) => item.level3)
              .filter((val): val is string => Boolean(val));
            results = [...new Set(level3Values)];
          }
        } else {
          const searchData = await schoolSearchService.searchForAutocomplete(
            value,
            dataType,
            10,
          );
          results = searchData
            .map((item) => item.value)
            .filter((val): val is string => Boolean(val));
        }

        setSearchResults(results.slice(0, 10));
      } catch (error) {
        console.error("Error fetching search results:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(fetchSearchResults, 300);
  }, [
    value,
    dataType,
    dataField,
    level1Query,
    level2Query,
    level3Query,
    keywordQuery,
  ]);

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setShowResults(false);
  };

  const handleDirectInputClick = () => {
    setShowResults(false);
  };

  return (
    <div className="searchable-input-mobile">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowResults(true);
        }}
        onFocus={() => setShowResults(true)}
        onBlur={() => {
          setTimeout(() => {
            setShowResults(false);
          }, 200);
        }}
        className="field"
        placeholder={placeholder}
      />
      {showResults && (
        <div className="results">
          <div className="results-wrapper">
            {loading ? (
              <div className="no-results">검색 중...</div>
            ) : searchResults.length > 0 ? (
              <>
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className={`item ${
                      hoveredIndex === index ? "hovered" : ""
                    }`}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {result}
                  </div>
                ))}
                <div
                  className="direct-input-button"
                  onClick={handleDirectInputClick}
                >
                  {`"${value}"`} 직접입력
                </div>
              </>
            ) : (
              <>
                <div className="no-results">
                  {value ? "검색 결과가 없습니다." : "검색어를 입력해주세요."}
                </div>
                <div
                  className="direct-input-button"
                  onClick={handleDirectInputClick}
                >
                  {`"${value}"`} 직접입력
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableInputMobile;
