import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";

interface MaterialOption {
  value: string;
  label: string;
  isCustom: boolean;
  usageStats?: { count: number; samplesCollected: number };
}

interface MaterialSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: MaterialOption[];
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  customAddText?: string;
  showOtherOnlyWhenHasItems?: boolean;
}

export const MaterialSelect: React.FC<MaterialSelectProps> = ({
  value,
  onValueChange,
  options,
  placeholder = "Select material type",
  disabled = false,
  loading = false,
  customAddText,
  showOtherOnlyWhenHasItems = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<MaterialOption[]>(options);

  // Filter options based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchQuery, options]);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleCustomMaterial = () => {
    onValueChange("__custom__");
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "ring-2 ring-ring ring-offset-2"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-foreground" : "text-muted-foreground"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
                autoFocus
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-2 text-sm text-muted-foreground">Loading materials...</div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground">
                {searchQuery ? "No materials found" : "No materials available"}
              </div>
            ) : (
              <>
                {(!showOtherOnlyWhenHasItems || filteredOptions.length > 0) && (
                  <div className="border-b">
                    <div
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-accent text-blue-600"
                      onClick={handleCustomMaterial}
                    >
                      {customAddText || "Add Other Material..."}
                    </div>
                  </div>
                )}
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "px-3 py-2 text-sm cursor-pointer hover:bg-accent",
                      value === option.value && "bg-accent font-medium"
                    )}
                    onClick={() => handleSelect(option.value)}
                  >
                    {option.label}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}; 