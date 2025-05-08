import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SquarePen } from "lucide-react";
import React from "react";
import { Link, useParams } from "react-router";

const ProjectDetails: React.FC = () => {
  const { id } = useParams();
  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex justify-between">
          <h2 className="font-semibold text-xl">Project Details</h2>
          <div className="space-x-4">
            <Button className="bg-[#D5F6DC] text-sf-black-300 px-3 py-1.5 hover:bg-[#D5F6DC] hover:text-inherit">
              Send
            </Button>
            <Button
              className="bg-sf-secondary-300 px-4 py-2.5 text-black"
              asChild
            >
              <Link to={`/projects/${id}/edit`}>
                Edit Project <SquarePen />
              </Link>
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="customerName">Customer</Label>
              <strong className="text-sf-gray-500 font-medium">
                {/* {customerName} */} Acme Inc.
              </strong>
            </div>
            <div className="grid w-full  items-center gap-3">
              <Label htmlFor="status">Project Name</Label>
              {/* <p className="text-sf-gray-500 font-normal">{status}</p> */}4
              Story Fire Assessment
            </div>
            <div className="grid w-full  items-center gap-3 md:col-span-2 border-y-2 py-3">
              <Label htmlFor="status">Location</Label>
              <p className="text-sf-gray-500 font-normal">Wood sq</p>
            </div>
            <div className="grid w-full  items-center gap-3">
              <Label htmlFor="email">Site Name</Label>
              {/* <p className="text-sf-gray-500 font-normal">{email}</p> */}
              Lakeside Property
            </div>
            <div className="grid w-full  items-center gap-3">
              <Label htmlFor="phoneNumber">Site Email</Label>
              {/* <p className="text-sf-gray-500 font-normal">{phoneNumber}</p> */}
              contact@example.com
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <h2 className="font-semibold text-xl">Project Report</h2>
        <Card>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="customerName">Customer</Label>
              <strong className="text-sf-gray-500 font-medium">
                {/* {customerName} */} Acme Inc.
              </strong>
            </div>
            <div className="grid w-full  items-center gap-3">
              <Label htmlFor="status">Project Name</Label>
              {/* <p className="text-sf-gray-500 font-normal">{status}</p> */}4
              Story Fire Assessment
            </div>
            <div className="grid w-full  items-center gap-3 md:col-span-2 border-y-2 py-3">
              <Label htmlFor="status">Location</Label>
              <p className="text-sf-gray-500 font-normal">Wood sq</p>
            </div>
            <div className="grid w-full  items-center gap-3">
              <Label htmlFor="email">Site Name</Label>
              {/* <p className="text-sf-gray-500 font-normal">{email}</p> */}
              Lakeside Property
            </div>
            <div className="grid w-full  items-center gap-3">
              <Label htmlFor="phoneNumber">Site Email</Label>
              {/* <p className="text-sf-gray-500 font-normal">{phoneNumber}</p> */}
              contact@example.com
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDetails;
