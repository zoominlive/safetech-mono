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
import { CardSkeleton } from "@/components/ui/skeletons/CardSkeleton";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import { toast } from "@/components/ui/use-toast";
import { reportService } from "@/services/api/reportService";
import { formatDate } from "@/lib/utils";
import { SquarePen } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import BackButton from "@/components/BackButton";

interface UploadedData {
  sample_id: string;
  material: string;
  quantity: string;
  location: string;
  result: string;
}

interface ReportDetails {
  id: string;
  name: string;
  created_at: string;
  site_contact_name: string;
  site_contact_title: string;
  assessment_due_to: string;
  date_of_loss: string;
  date_of_building_material: string;
  uploaded_data: UploadedData[];
  answers: {
    moisture_status?: string;
    moisture_level?: string[] | string;
    wall_condition?: string;
    [key: string]: any;
  } | null;
}

const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<ReportDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReportDetails = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const response = await reportService.getReportById(id);

        if (response.success) {
          setReport(response.data);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to load report details",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching report details:", error);
        toast({
          title: "Error",
          description: "Failed to load report details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[22px] text-sf-black-300">
            View Report
          </h2>
          <Skeleton className="w-[100px] h-10" />
        </div>
        <CardSkeleton rows={4} columns={2} />
        <TableSkeleton columns={5} rows={3} />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-red-500 text-center py-8">Report not found</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton/>
          <h2 className="font-semibold text-[22px] text-sf-black-300">
            View Report
          </h2>
        </div>
        <Button
          className="bg-safetech-gray text-black"
          onClick={() => navigate(`/project-reports/${id}/edit`)}
        >
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
              <p className="font-normal text-sf-black-300">{report.name}</p>
            </div>
            <div className="space-y-4">
              <p className="font-medium text-lg text-sf-black-300">
                Date of Assessment
              </p>
              <p className="font-normal text-sf-black-300">
                {formatDate(report.created_at)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 border-b pb-3">
            <div className="space-y-4">
              <p className="font-medium text-lg text-sf-black-300">
                Site Contact Name
              </p>
              <p className="font-normal text-sf-black-300">
                {report.site_contact_name}
              </p>
            </div>
            <div className="space-y-4">
              <p className="font-medium text-lg text-sf-black-300">
                Site Contact Title
              </p>
              <p className="font-normal text-sf-black-300">
                {report.site_contact_title}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 border-b pb-3">
            <div className="space-y-4">
              <p className="font-medium text-lg text-sf-black-300">
                Assessment Due To
              </p>
              <p className="font-normal text-sf-black-300">
                {report.assessment_due_to}
              </p>
            </div>
            <div className="space-y-4">
              <p className="font-medium text-lg text-sf-black-300">
                Date of Loss
              </p>
              <p className="font-normal text-sf-black-300">
                {report.date_of_loss
                  ? formatDate(report.date_of_loss)
                  : "Not specified"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 border-b pb-3">
            <div className="space-y-4">
              <p className="font-medium text-lg text-sf-black-300">
                Date of Building Material
              </p>
              <p className="font-normal text-sf-black-300">
                {report.date_of_building_material
                  ? formatDate(report.date_of_building_material)
                  : "Not specified"}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <p className="font-medium text-lg text-sf-black-300">
              Uploaded CSV Data
            </p>
            <div className="border rounded">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100 dark:bg-gray-800">
                    <TableHead className="text-gray-700 dark:text-gray-200">Sample ID</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200">Material</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200">Quantity</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200">Location</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200">Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.uploaded_data && report.uploaded_data.length > 0 ? (
                    report.uploaded_data.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.sample_id}</TableCell>
                        <TableCell>{item.material}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>{item.result}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No data available
                      </TableCell>
                    </TableRow>
                  )}
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
