import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bookmark, CircleX, SquarePen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams } from "react-router";
import { useState } from "react";

function CreateCustomerForm() {
  const { id } = useParams<{ id: string }>();
  const [isEdit, setIsEdit] = useState<boolean>(false);

  return (
    <div className="space-y-7">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-xl">Customer Details</h2>
        {id && (
          <Button
            className="bg-sf-secondary-300 text-black w-[150px] h-[48px]"
            onClick={() => setIsEdit(!isEdit)}
          >
            Edit <SquarePen />
          </Button>
        )}
      </div>
      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-14">
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              type="text"
              id="customerName"
              placeholder="John Doe"
              className="py-7.5"
            />
          </div>
          <div className="grid w-full  items-center gap-3">
            <Label htmlFor="status">Status</Label>
            <Select>
              <SelectTrigger className="w-full py-7.5">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full  items-center gap-3">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              placeholder="john@example.com"
              className="py-7.5"
            />
          </div>
          <div className="grid w-full  items-center gap-3">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              type="number"
              id="phoneNumber"
              placeholder="Phone number"
              className="py-7.5"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-6">
          <Button className="bg-sf-gray-600 text-white w-[150px] h-[48px]">
            Save <Bookmark />
          </Button>
          <Button className="w-[150px] h-[48px] bg-sf-secondary text-black">
            Cancel <CircleX />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default CreateCustomerForm;
