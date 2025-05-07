import { CustomersTable } from "@/features/customers/CustomersTable";
import CustomersTableOperations from "@/features/customers/CustomersTableOperations";

function Customers() {
  return (
    <div className="space-y-6">
      <CustomersTableOperations />
      <CustomersTable />
    </div>
  );
}

export default Customers;
