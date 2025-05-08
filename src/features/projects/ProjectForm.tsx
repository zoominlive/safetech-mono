import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Bookmark, CircleX } from "lucide-react";
import React from "react";

const ProjectForm: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <h2 className="font-semibold text-xl text-sf-black-300 mb-8">
        Add Project
      </h2>
      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-14 h-[calc(100vh-350px)] overflow-y-auto">
          <div className="grid w-full  items-center gap-3">
            <Label htmlFor="customer">Customer</Label>
            <Select>
              <SelectTrigger className="w-full py-7.5">
                <SelectValue placeholder="Select customer" />
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
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              type="text"
              id="projectName"
              placeholder="Enter project name"
              className="py-7.5"
            />
          </div>
          <div className="grid w-full gap-3 col-span-2">
            <Label htmlFor="location">Location</Label>
            <Textarea
              placeholder="Enter project location"
              id="location"
              className="h-64"
            />
          </div>
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="contactName">Contact Name</Label>
            <Input
              type="text"
              id="contactName"
              placeholder="Enter contact name"
              className="py-7.5"
            />
          </div>
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              type="text"
              id="contactEmail"
              placeholder="Enter contact email"
              className="py-7.5"
            />
          </div>
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="customerName">Project Type</Label>
            <Select>
              <SelectTrigger className="w-full py-7.5">
                <SelectValue placeholder="Select customer" />
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
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="customerName">Start Date</Label>
            <Input
              type="text"
              id="customerName"
              placeholder="Enter project name"
              className="py-7.5"
            />
          </div>
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="customerName">Technician</Label>
            <Select>
              <SelectTrigger className="w-full py-7.5">
                <SelectValue placeholder="Select customer" />
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
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="customerName">Office</Label>
            <Select>
              <SelectTrigger className="w-full py-7.5">
                <SelectValue placeholder="Select customer" />
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
        </CardContent>
      </Card>
      <div className="text-end bg-white py-5 pe-8 space-x-6 absolute bottom-0 w-full left-0">
        <Button className="bg-sf-gray-600 text-white w-[150px] h-[48px]">
          Save <Bookmark />
        </Button>
        <Button className="bg-sf-secondary text-black w-[150px] h-[48px]">
          Cancel <CircleX />
        </Button>
      </div>
    </div>
  );
};

export default ProjectForm;
