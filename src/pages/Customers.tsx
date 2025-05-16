import { CustomersTable } from "@/features/customers/CustomersTable";
import CustomersTableOperations from "@/features/customers/CustomersTableOperations";
import { useState } from "react";

function Customers() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  
  return (
    <div className="space-y-4">
      <CustomersTableOperations 
        onSearch={setSearchQuery} 
        onSort={setSortBy} 
      />
      <CustomersTable 
        searchQuery={searchQuery}
        sortBy={sortBy}
      />
    </div>
  );
}

export default Customers;
