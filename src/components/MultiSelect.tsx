import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onChange,
  className,
  placeholder,
  disabled = false,
}) => {
  const handleSelect = (value: string) => {
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

  return (
    <div className={className}>
      <Select
        value={selected.length > 0 ? selected[0].value : undefined}
        onValueChange={handleSelect}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
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
                onClick={() => onChange(selected.filter((s) => s.value !== option.value))}
                className="ml-1 rounded-full hover:bg-accent-foreground/20"
                disabled={disabled}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
