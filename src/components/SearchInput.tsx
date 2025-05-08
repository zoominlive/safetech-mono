import React, { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchInput({
  placeholder = "Search...",
  onSearch,
  className,
}: SearchInputProps) {
  const [query, setQuery] = useState("");

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

  return (
    <div className={`flex w-full items-center space-x-2 ${className}`}>
      <div className="w-full relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pr-12 bg-safetech-gray h-[60px]"
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
