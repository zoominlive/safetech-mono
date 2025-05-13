import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SquarePen } from "lucide-react";
import React from "react";

const ReportDetail: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[22px] text-sf-black-300">
          View Report
        </h2>
        <Button className="bg-safetech-gray text-black">
          Edit <SquarePen />
        </Button>
      </div>
      <Card>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 border-b pb-3">
            <div className="space-y-4">
              <p className="font-medium text-lg text-sf-black-300">
                Report name
              </p>
              <p className="font-normal text-sf-black-300">Mould Assessment</p>
            </div>
            <div className="space-y-4">
              <p className="font-medium text-lg text-sf-black-300">
                Date of Assessment
              </p>
              <p className="font-normal text-sf-black-300">Dec 8, 2024</p>
            </div>
          </div>
          <div className="grid grid-cols-2 border-b pb-3">
            <div className="space-y-4">
              <p className="font-medium text-lg text-sf-black-300">
                Site Contact Name
              </p>
              <p className="font-normal text-sf-black-300">Lakeside Property</p>
            </div>
            <div className="space-y-4">
              <p className="font-medium text-lg text-sf-black-300">
                Site Contact Title
              </p>
              <p className="font-normal text-sf-black-300">4 store fire loss</p>
            </div>
          </div>
          <div className="grid grid-cols-2 border-b pb-3">
            <div className="space-y-4">
              <p className="font-medium text-lg text-sf-black-300">
                Assessment Due To
              </p>
              <p className="font-normal text-sf-black-300">Water loss</p>
            </div>
            <div className="space-y-4">
              <p className="font-medium text-lg text-sf-black-300">
                Date of Loss
              </p>
              <p className="font-normal text-sf-black-300">
                Select the date of the incident
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 border-b pb-3">
            <div className="space-y-4">
              <p className="font-medium text-lg text-sf-black-300">
                Date of Building Material
              </p>
              <p className="font-normal text-sf-black-300">Dec 8, 2024</p>
            </div>
          </div>
          <div className="space-y-4">
            <p className="font-medium text-lg text-sf-black-300">
              Uploaded CSV Data
            </p>
            <div className="border rounded">
              <Table>
                <TableHeader>
                  <TableRow className="bg-safetech-gray">
                    <TableHead>Sample ID</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>001</TableCell>
                    <TableCell>Drywall</TableCell>
                    <TableCell>20 Sqft</TableCell>
                    <TableCell>Kitchen Ceiling</TableCell>
                    <TableCell>Asbestos-Free</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>002</TableCell>
                    <TableCell>Drywall</TableCell>
                    <TableCell>20 Sqft</TableCell>
                    <TableCell>Kitchen Ceiling</TableCell>
                    <TableCell>Asbestos-Free</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>003</TableCell>
                    <TableCell>Drywall</TableCell>
                    <TableCell>20 Sqft</TableCell>
                    <TableCell>Kitchen Ceiling</TableCell>
                    <TableCell>Asbestos-Free</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportDetail;
