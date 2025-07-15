import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LocationData } from "@/types/customer";

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
  locations: LocationData[];
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
  locations,
}: CustomerDetailsProps) => {
  // Filter out the head office address from other locations
  const otherLocations = locations.filter(
    (loc) =>
      loc.address_line_1 !== address_line_1 ||
      loc.address_line_2 !== address_line_2 ||
      loc.city !== city ||
      loc.province !== province ||
      loc.postal_code !== postal_code
  );

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
        {/* Other Locations Section */}
        {otherLocations.length > 0 && (
          <div className="col-span-2">
            <Label className="font-semibold text-lg mb-2 block">
              Other Locations
            </Label>
            <div className="space-y-4">
              {otherLocations.map((loc, idx) => (
                <div key={loc.id || idx} className="border rounded p-3 bg-sf-gray-50">
                  <div className="font-semibold text-sf-gray-700">{loc.name}</div>
                  <div className="text-sf-gray-500 text-sm">
                    <div>
                      <span className="font-medium">Address Line 1:</span> {loc.address_line_1}
                    </div>
                    {loc.address_line_2 && (
                      <div>
                        <span className="font-medium">Address Line 2:</span> {loc.address_line_2}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">City:</span> {loc.city}
                    </div>
                    <div>
                      <span className="font-medium">Province:</span> {loc.province}
                    </div>
                    <div>
                      <span className="font-medium">Postal Code:</span> {loc.postal_code}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerDetails;
