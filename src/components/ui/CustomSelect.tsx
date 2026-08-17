'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  className = '',
  triggerClassName = '',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left font-sans ${className}`}>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-slate-50 border border-slate-300 hover:border-slate-900 px-3 py-2 text-xs font-bold text-slate-900 uppercase cursor-pointer flex items-center justify-between space-x-2 transition-colors select-none ${triggerClassName}`}
      >
        <span className="truncate flex items-center space-x-1.5">
          {selectedOption?.icon && <span>{selectedOption.icon}</span>}
          <span>{selectedOption?.label || placeholder}</span>
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3.5 h-3.5 text-slate-700 flex-shrink-0" />
        </motion.div>
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 top-full mt-1 z-50 bg-white border border-slate-900 shadow-2xl overflow-hidden min-w-full w-max max-w-xs"
          >
            <div className="py-1 max-h-60 overflow-y-auto font-sans">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-bold uppercase flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate flex items-center space-x-2">
                      {option.icon && <span>{option.icon}</span>}
                      <span>{option.label}</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white flex-shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
