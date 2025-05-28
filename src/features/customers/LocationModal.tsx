import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LocationData } from "@/types/customer";

interface LocationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (location: LocationData) => void;
  initialData?: LocationData;
}

const defaultLocation: LocationData = {
  name: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  province: "",
  postal_code: "",
  active: true,
};

const LocationModal: React.FC<LocationModalProps> = ({ open, onClose, onSave, initialData }) => {
  const [location, setLocation] = useState<LocationData>(initialData || defaultLocation);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!location.name) errs.name = "Location name is required";
    if (!location.address_line_1) errs.address_line_1 = "Address Line 1 is required";
    if (!location.city) {
      errs.city = "City is required";
    } else if (!/^[a-zA-Z\s'-]{2,}$/.test(location.city)) {
      errs.city = "Enter a valid city name";
    }
    if (!location.province) {
      errs.province = "Province is required";
    } else if (!/^[a-zA-Z\s'-]{2,}$/.test(location.province)) {
      errs.province = "Enter a valid province name";
    }
    if (!location.postal_code) {
      errs.postal_code = "Postal Code is required";
    } else if (!/^[A-Za-z0-9\s-]{3,10}$/.test(location.postal_code)) {
      errs.postal_code = "Enter a valid postal code";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation({ ...location, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (validate()) {
      onSave(location);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Location Name</Label>
            <div className="mt-1" />
            <Input id="name" name="name" value={location.name} onChange={handleChange} />
            {errors.name && <div className="text-red-500 text-xs">{errors.name}</div>}
          </div>
          <div>
            <Label htmlFor="address_line_1">Address Line 1</Label>
            <div className="mt-1" />
            <Input id="address_line_1" name="address_line_1" value={location.address_line_1} onChange={handleChange} />
            {errors.address_line_1 && <div className="text-red-500 text-xs">{errors.address_line_1}</div>}
          </div>
          <div>
            <Label htmlFor="address_line_2">Address Line 2</Label>
            <div className="mt-1" />
            <Input id="address_line_2" name="address_line_2" value={location.address_line_2} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <div className="mt-1" />
            <Input id="city" name="city" value={location.city} onChange={handleChange} />
            {errors.city && <div className="text-red-500 text-xs">{errors.city}</div>}
          </div>
          <div>
            <Label htmlFor="province">Province</Label>
            <div className="mt-1" />
            <Input id="province" name="province" value={location.province} onChange={handleChange} />
            {errors.province && <div className="text-red-500 text-xs">{errors.province}</div>}
          </div>
          <div>
            <Label htmlFor="postal_code">Postal Code</Label>
            <div className="mt-1" />
            <Input id="postal_code" name="postal_code" value={location.postal_code} onChange={handleChange} />
            {errors.postal_code && <div className="text-red-500 text-xs">{errors.postal_code}</div>}
          </div>
        </div>
        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LocationModal;
