import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type CustomerDetailsProps = {
  customerName: string;
  status: string;
  email: string;
  phoneNumber: string;
};

const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  customerName,
  status,
  email,
  phoneNumber,
}: CustomerDetailsProps) => {
  return (
    <Card>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-14">
        <div className="grid w-full items-center gap-3">
          <Label htmlFor="customerName">Customer Name</Label>
          <strong className="text-sf-gray-500 font-medium">
            {customerName}
          </strong>
        </div>
        <div className="grid w-full  items-center gap-3">
          <Label htmlFor="status">Status</Label>
          <p className="text-sf-gray-500 font-normal">{status}</p>
        </div>
        <div className="grid w-full  items-center gap-3">
          <Label htmlFor="email">Email</Label>
          <p className="text-sf-gray-500 font-normal">{email}</p>
        </div>
        <div className="grid w-full  items-center gap-3">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <p className="text-sf-gray-500 font-normal">{phoneNumber}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerDetails;
