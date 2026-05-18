import React, { useState, useRef, useEffect } from 'react';

export default function AutoSuggestInput({ value, onChange, onKeyDown, placeholder, suggestionsList, style, inputStyle, id }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  const filteredSuggestions = value
    ? suggestionsList.filter(s => s.toLowerCase().includes(value.toLowerCase()))
    : suggestionsList;

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSuggestionClick = (suggestion) => {
    onChange({ target: { value: suggestion } });
    setShowSuggestions(false);
  };

  return (
    <div 
      className="autosuggest-wrapper" 
      ref={wrapperRef} 
      style={style}
      onMouseEnter={() => setShowSuggestions(true)}
      onMouseLeave={() => setShowSuggestions(false)}
    >
      <input
        type="text"
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={onKeyDown}
        style={inputStyle}
        autoComplete="off"
      />
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="autosuggest-dropdown">
          {filteredSuggestions.map((s, idx) => (
            <li key={idx} onClick={() => handleSuggestionClick(s)}>
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
