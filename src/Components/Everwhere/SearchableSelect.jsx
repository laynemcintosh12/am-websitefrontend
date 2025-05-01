import React, { useState, useRef, useEffect } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const SearchableSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  isMulti = false,
  getOptionLabel = (option) => option.name,
  getOptionValue = (option) => option.id,
  filterOption = null,
  formatSelectedOption = null
}) => {
  const { isDarkMode } = useDarkMode();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (isMulti && e.key === 'Backspace' && searchTerm === '') {
      e.preventDefault();
      if (value.length > 0) {
        const newValue = value.slice(0, -1);
        onChange(newValue);
      }
    }
  };

  const filteredOptions = options.filter(option =>
    filterOption 
      ? filterOption(option, searchTerm)
      : getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    if (isMulti) {
      const newValue = value.includes(getOptionValue(option))
        ? value.filter(v => v !== getOptionValue(option))
        : [...value, getOptionValue(option)];
      onChange(newValue);
    } else {
      onChange(getOptionValue(option));
      setIsOpen(false);
    }
    setSearchTerm('');
  };

  const selectedOptions = options.filter(option => 
    isMulti 
      ? value.includes(getOptionValue(option))
      : getOptionValue(option) === value
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        className={`w-full p-2 rounded border ${
          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
        } ${isOpen ? 'ring-2 ring-blue-500' : ''} cursor-text`}
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        <div className="flex flex-wrap gap-1 items-center">
          {selectedOptions.map((option, index) => (
            <span key={getOptionValue(option)} className="inline-flex items-center">
              {formatSelectedOption ? formatSelectedOption(option) : getOptionLabel(option)}
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            className={`flex-1 min-w-[50px] outline-none ${
              isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'
            }`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedOptions.length === 0 ? placeholder : ''}
          />
        </div>
      </div>

      {isOpen && (
        <div className={`absolute z-10 w-full mt-1 rounded-md shadow-lg ${
          isDarkMode ? 'bg-gray-700' : 'bg-white'
        }`}>
          <div className="max-h-60 overflow-auto">
            {filteredOptions.map((option) => {
              const isSelected = isMulti 
                ? value.includes(getOptionValue(option))
                : value === getOptionValue(option);
              
              return (
                <div
                  key={getOptionValue(option)}
                  className={`p-2 cursor-pointer ${
                    isDarkMode 
                      ? isSelected ? 'bg-gray-600' : 'hover:bg-gray-600'
                      : isSelected ? 'bg-gray-100' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  {getOptionLabel(option)}
                  {isSelected && <span className="ml-2">✓</span>}
                </div>
              );
            })}
            {filteredOptions.length === 0 && (
              <div className="p-2 text-gray-500">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;