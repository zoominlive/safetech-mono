import { useState } from "react";
import UsersTable from "@/features/users/UsersTable";
import UsersTableOperations from "@/features/users/UsersTableOperations";

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleSort = (sortByValue: string) => {
    setSortBy(sortByValue);
  };
  
  return (
    <div className="space-y-4">
      <UsersTableOperations 
        onSearch={handleSearch}
        onSort={handleSort}
      />
      <UsersTable 
        searchQuery={searchQuery}
        sortBy={sortBy}
      />
    </div>
  );
}
