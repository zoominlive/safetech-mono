import { useState, useRef, useCallback, useEffect } from "react";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selected?: Option[];
  placeholder?: string;
  onChange?: (selectedOptions: Option[]) => void;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  placeholder = "Select options...",
  onChange,
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>(selected || []);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update internal state when selected prop changes
  useEffect(() => {
    if (selected !== undefined) {
      setSelectedOptions(selected);
    }
  }, [selected]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const toggleOption = (option: Option) => {
    let newSelectedOptions: Option[];

    if (selectedOptions.some((item) => item.value === option.value)) {
      newSelectedOptions = selectedOptions.filter(
        (item) => item.value !== option.value
      );
    } else {
      newSelectedOptions = [...selectedOptions, option];
    }

    setSelectedOptions(newSelectedOptions);
    onChange?.(newSelectedOptions);
  };

  const clearAll = () => {
    setSelectedOptions([]);
    onChange?.([]);
  };

  const removeOption = (optionToRemove: Option) => {
    const newSelectedOptions = selectedOptions.filter(
      (option) => option.value !== optionToRemove.value
    );
    setSelectedOptions(newSelectedOptions);
    onChange?.(newSelectedOptions);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          "cursor-pointer"
        )}
      >
        <div className="flex flex-wrap gap-1 max-w-full">
          {selectedOptions.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="flex items-center gap-1 pl-2 pr-1 py-0 h-6"
                >
                  {option.label}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOption(option);
                    }}
                    className="ml-1 rounded-full hover:bg-muted p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center">
          {selectedOptions.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              className="mr-2 rounded-full hover:bg-muted p-1"
              aria-label="Clear all"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          {isOpen ? (
            <ChevronUp className="h-4 w-4 opacity-50" />
          ) : (
            <ChevronDown className="h-4 w-4 opacity-50" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute mt-1 w-full z-50 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="p-1">
            {options.map((option) => {
              const isSelected = selectedOptions.some(
                (item) => item.value === option.value
              );
              return (
                <div
                  key={option.value}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none",
                    isSelected
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted"
                  )}
                  onClick={() => {
                    toggleOption(option);
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    {isSelected && <Check className="h-4 w-4" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
