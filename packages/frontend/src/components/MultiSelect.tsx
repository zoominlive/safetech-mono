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
  selected: Option[];
  onChange: (selected: Option[]) => void;
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

  const handleSelect = (value: string) => {
    if (value === 'other') {
      setShowOtherInput(true);
      return;
    }

    const option = options.find((opt) => opt.value === value);
    if (option) {
      const isSelected = selected.some((s) => s.value === option.value);
      
      if (isSelected) {
        onChange(selected.filter((s) => s.value !== option.value));
      } else {
        onChange([...selected, option]);
      }
    }
  };

  const handleAddOther = () => {
    if (otherInputValue.trim()) {
      const customOption: Option = {
        value: otherInputValue.trim(),
        label: otherInputValue.trim(),
      };
      
      onChange([...selected, customOption]);
      setOtherInputValue('');
      setShowOtherInput(false);
    }
  };

  const handleRemoveOption = (optionToRemove: Option) => {
    onChange(selected.filter((s) => s.value !== optionToRemove.value));
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

  const currentValue = selected.length > 0 
    ? selected[selected.length - 1].value 
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
              className={selected.some((s) => s.value === option.value) ? 'bg-accent' : ''}
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
            }}
            disabled={disabled}
            className="px-3"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Selected chips/tags */}
      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selected.map((option) => (
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
