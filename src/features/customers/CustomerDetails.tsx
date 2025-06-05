import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type CustomerDetailsProps = {
  companyName: string;
  customerName: string;
  status: string;
  email: string;
  phoneNumber: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  province: string;
  postal_code: string;
};

const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  companyName,
  customerName,
  status,
  email,
  phoneNumber,
  address_line_1,
  address_line_2,
  city,
  province,
  postal_code,
}: CustomerDetailsProps) => {
  return (
    <Card>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-14">
        <div className="grid w-full items-center gap-3">
          <Label htmlFor="companyName">Company Name</Label>
          <strong className="text-sf-gray-500 font-medium">
            {companyName}
          </strong>
        </div>
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
        {/* Head Office Address Section */}
        <div className="col-span-2">
          <Label className="font-semibold text-lg mb-2 block">
            Head Office Address
          </Label>
          <div className="text-sf-gray-500 font-normal">
            <div>
              <span className="font-medium">Address Line 1:</span>{" "}
              {address_line_1}
            </div>
            {address_line_2 && (
              <div>
                <span className="font-medium">Address Line 2:</span>{" "}
                {address_line_2}
              </div>
            )}
            <div>
              <span className="font-medium">City:</span> {city}
            </div>
            <div>
              <span className="font-medium">Province:</span> {province}
            </div>
            <div>
              <span className="font-medium">Postal Code:</span> {postal_code}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerDetails;
