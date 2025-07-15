import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { X, Plus } from 'lucide-react';

export interface Option {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  options: Option[];
  selected: string[] | Option[];
  onChange: (selected: string[] | Option[]) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  showOtherOption?: boolean;
  otherOptionLabel?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onChange,
  className,
  placeholder,
  disabled = false,
  showOtherOption = false,
  otherOptionLabel = "Other",
}) => {
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherInputValue, setOtherInputValue] = useState('');
  const [isOtherSelected, setIsOtherSelected] = useState(false);

  // Type guard to check if selected is string array
  const isStringArray = (arr: any[]): arr is string[] => {
    return arr.length === 0 || typeof arr[0] === 'string';
  };

  const handleSelect = (value: string) => {
    if (value === 'other') {
      setIsOtherSelected(true);
      setShowOtherInput(true);
      return;
    }

    const option = options.find((opt) => opt.value === value);
    if (option) {
      const isSelected = isStringArray(selected)
        ? selected.includes(option.value)
        : selected.some((s: Option) => s.value === option.value);
      
      if (isSelected) {
        if (isStringArray(selected)) {
          onChange(selected.filter((s: string) => s !== option.value));
        } else {
          onChange(selected.filter((s: Option) => s.value !== option.value));
        }
      } else {
        if (isStringArray(selected)) {
          onChange([...selected, option.value]);
        } else {
          onChange([...selected, option]);
        }
      }
    }
  };

  const handleAddOther = () => {
    if (otherInputValue.trim()) {
      const customOption: Option = {
        value: `other_${Date.now()}`,
        label: otherInputValue.trim(),
      };
      
      if (isStringArray(selected)) {
        onChange([...selected, customOption.label]);
      } else {
        onChange([...selected, customOption]);
      }
      
      setOtherInputValue('');
      setShowOtherInput(false);
      setIsOtherSelected(false);
    }
  };

  const handleRemoveOption = (optionToRemove: string | Option) => {
    if (isStringArray(selected)) {
      const valueToRemove = typeof optionToRemove === 'string' ? optionToRemove : optionToRemove.label;
      onChange(selected.filter((s: string) => s !== valueToRemove));
    } else {
      const valueToRemove = typeof optionToRemove === 'string' ? optionToRemove : optionToRemove.value;
      onChange(selected.filter((s: Option) => s.value !== valueToRemove));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddOther();
    }
  };

  const filteredOptions = showOtherOption 
    ? [...options, { value: 'other', label: otherOptionLabel }]
    : options;

  // Convert selected values to display format
  const selectedForDisplay = isStringArray(selected) 
    ? selected.map(s => ({ value: s, label: s }))
    : selected;

  const currentValue = selectedForDisplay.length > 0 
    ? selectedForDisplay[selectedForDisplay.length - 1].value 
    : undefined;

  return (
    <div className={className}>
      <Select
        value={currentValue}
        onValueChange={handleSelect}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {filteredOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className={selectedForDisplay.some((s) => s.value === option.value) ? 'bg-accent' : ''}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Other input field */}
      {showOtherInput && (
        <div className="mt-2 flex items-center gap-2">
          <Input
            value={otherInputValue}
            onChange={(e) => setOtherInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter other value"
            className="flex-1"
            disabled={disabled}
          />
          <Button
            size="sm"
            onClick={handleAddOther}
            disabled={!otherInputValue.trim() || disabled}
            className="px-3"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setShowOtherInput(false);
              setOtherInputValue('');
              setIsOtherSelected(false);
            }}
            disabled={disabled}
            className="px-3"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Selected chips/tags */}
      {selectedForDisplay.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedForDisplay.map((option) => (
            <div
              key={option.value}
              className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-sm"
            >
              <span>{option.label}</span>
              <button
                type="button"
                onClick={() => handleRemoveOption(option)}
                className="ml-1 rounded-full hover:bg-accent-foreground/20 p-0.5"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
