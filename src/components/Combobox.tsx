import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string | number;
  label: string;
}

interface ComboboxProps {
  value: string | number | null;
  onChange: (value: string | number | null, option?: ComboboxOption) => void;
  fetchOptions: (query: string) => Promise<ComboboxOption[]>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
  value,
  onChange,
  fetchOptions,
  placeholder = "Select...",
  className,
  disabled,
  label,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<ComboboxOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ComboboxOption | undefined>(undefined);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Fetch initial options on mount only
  useEffect(() => {
    setLoading(true);
    fetchOptions("").then((opts) => {
      setOptions(opts);
      setLoading(false);
    });
  }, [fetchOptions]);

  // Only fetch options when user types and combobox is open
  useEffect(() => {
    if (!isOpen || inputValue.trim().length === 0) {
      setSearchPerformed(false);
      return;
    }
    setSearchPerformed(true);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setLoading(true);
      fetchOptions(inputValue).then((opts) => {
        setOptions(opts);
        setLoading(false);
      });
    }, 1000);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [inputValue, fetchOptions, isOpen]);

  // Cancel pending fetch when combobox is closed
  useEffect(() => {
    if (!isOpen && debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    if (!isOpen) {
      setInputValue("");
    }
  }, [isOpen]);

  // On edit, if value is not in options, fetch and append
  useEffect(() => {
    if (!hasOpened || value == null || options.find((o) => o.value === value)) return;
    fetchOptions("").then((opts) => {
      if (!opts.find((o) => o.value === value)) {
        fetchOptions(String(value)).then((extra) => {
          if (extra.length > 0) setOptions((prev) => [...prev, ...extra]);
        });
      }
    });
  }, [hasOpened, value, options, fetchOptions]);

  useEffect(() => {
    setSelectedOption(options.find((o) => o.value === value));
  }, [value, options]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const handleSelect = (option: ComboboxOption) => {
    onChange(option.value, option);
    setInputValue("");
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)} ref={rootRef}>
      {label && <label className="block mb-1 text-sm font-medium">{label}</label>}
      <Input
        value={selectedOption ? selectedOption.label : inputValue}
        onChange={(e) => {
          if (selectedOption && e.target.value === "") {
            // If backspace pressed on selected option, clear selection
            setSelectedOption(undefined);
            onChange(null, undefined);
            setInputValue("");
            setIsOpen(true);
          } else {
            setInputValue(e.target.value);
            setIsOpen(true);
            if (selectedOption) {
              setSelectedOption(undefined);
              onChange(null, undefined);
            }
          }
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-auto">
          {loading ? (
            <div className="p-2 text-gray-500">Loading...</div>
          ) : options.length === 0 && searchPerformed ? (
            <div className="p-2 text-gray-500">No such record exists</div>
          ) : options.length === 0 ? (
            <div className="p-2 text-gray-500">No options</div>
          ) : (
            options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "cursor-pointer px-3 py-2 hover:bg-gray-100",
                  value === option.value && "bg-gray-100 font-semibold"
                )}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
