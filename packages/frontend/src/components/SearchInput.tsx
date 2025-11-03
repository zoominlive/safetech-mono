import React, { useState, useRef } from "react";
import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  value?: string;
}

export function SearchInput({
  placeholder = "Search...",
  onSearch,
  className,
  value,
}: SearchInputProps) {
  const [query, setQuery] = useState("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Sync from external value when provided
  React.useEffect(() => {
    if (value !== undefined) {
      setQuery(value);
    }
  }, [value]);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Debounced search on every keystroke
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      if (onSearch) onSearch(e.target.value);
    }, 300);
  };

  return (
    <div
      className={`flex w-full lg:w-auto items-center space-x-2 ${className}`}
    >
      <div className="w-full relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="w-full md:w-[332px] pr-12 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 h-[60px]"
        />
        <Button
          type="submit"
          onClick={handleSearch}
          className="absolute right-0 top-0 w-[68px] h-full rounded-l-none bg-sf-prefix-btn"
          size="icon"
          variant="ghost"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
