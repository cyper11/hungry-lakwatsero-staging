import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

export default function CustomDropdown({ options, value, onChange, placeholder = "Select option" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full min-w-[200px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-transparent border-none focus:ring-0 text-primary font-bold text-sm cursor-pointer outline-none py-2"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown size={16} className={`text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-primary/20 rounded-2xl shadow-xl z-50 overflow-hidden backdrop-blur-md animate-fade-in-down">
          <div className="p-2 border-b border-primary/10">
            <div className="flex items-center px-3 py-2 bg-background/50 rounded-xl">
              <Search size={14} className="text-muted mr-2" />
              <input 
                type="text" 
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-sm text-primary placeholder-muted outline-none"
                onClick={e => e.stopPropagation()}
              />
            </div>
          </div>
          
          <ul className="max-h-60 overflow-y-auto custom-scrollbar p-1" role="listbox">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted text-center">No results found</li>
            ) : (
              filteredOptions.map(opt => (
                <li 
                  key={opt}
                  role="option"
                  aria-selected={value === opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`flex items-center justify-between px-4 py-2.5 text-sm rounded-xl cursor-pointer transition-colors ${
                    value === opt 
                      ? 'bg-emerald-500/10 text-emerald-500 font-bold' 
                      : 'text-primary hover:bg-emerald-500/5'
                  }`}
                >
                  {opt}
                  {value === opt && <Check size={14} className="text-emerald-500" />}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
