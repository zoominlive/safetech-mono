import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardSkeleton } from "@/components/ui/skeletons/CardSkeleton";
import { toast } from "@/components/ui/use-toast";
import { projectService } from "@/services/api/projectService";
import { Formik, Form, Field, FormikHelpers } from "formik";
import { SquarePen } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { DatePicker } from "@/components/ui/date-picker";

interface ProjectDetails {
  id: number;
  name: string;
  site_name: string;
  site_email: string;
  status: string;
  location_id: string;
  location: {
    name: string;
  };
  pm_id: string;
  technician: {
    name: string;
  };
  company: {
    name: string;
  };
  start_date: string;
  // Add report details
  report_id: string;
  report: {
    id: number;
    name: string;
  };
}

interface ReportFormValues {
  report_name: string;
  date_of_assessment: Date | undefined;
  site_contact_name: string;
  site_contact_title: string;
  assessment_due_to: string;
  date_of_loss: Date | undefined;
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await projectService.getProjectById(id);
        
        if (response.success) {
          setProject(response.data);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to load project details",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching project details:", error);
        toast({
          title: "Error",
          description: "Failed to load project details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleSaveReport = async (values: ReportFormValues, actions: FormikHelpers<ReportFormValues>) => {
    try {
      // Handle the form submission here
      // Example: await projectService.saveProjectReport(id, values);
      
      toast({
        title: "Success",
        description: "Report saved successfully",
      });
      actions.setSubmitting(false);
    } catch (error) {
      console.error("Error saving report:", error);
      toast({
        title: "Error",
        description: "Failed to save report",
        variant: "destructive",
      });
      actions.setSubmitting(false);
    }
  };

  if (isLoading) {
    return <CardSkeleton rows={3} columns={2} />;
  }

  if (!project) {
    return <div className="text-center py-8">Project not found</div>;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex justify-between">
          <h2 className="font-semibold text-xl">Project Details</h2>
          <div className="space-x-4">
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
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 pt-6">
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="customerName">Customer</Label>
              <strong className="text-sf-gray-500 font-medium">
                {project.company?.name || '-'}
              </strong>
            </div>
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="projectName">Project Name</Label>
              <strong className="text-sf-gray-500 font-medium">
                {project.name}
              </strong>
            </div>
            <div className="grid w-full items-center gap-3 md:col-span-2 border-y-2 py-3">
              <Label htmlFor="location">Location</Label>
              <p className="text-sf-gray-500 font-normal">{project.location?.name || '-'}</p>
            </div>
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="siteName">Site Name</Label>
              <p className="text-sf-gray-500 font-normal">{project.site_name}</p>
            </div>
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="siteEmail">Site Email</Label>
              <p className="text-sf-gray-500 font-normal">{project.site_email || '-'}</p>
            </div>
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="technician">Technician</Label>
              <p className="text-sf-gray-500 font-normal">{project.technician?.name || '-'}</p>
            </div>
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="startDate">Start Date</Label>
              <p className="text-sf-gray-500 font-normal">{formatDate(project.start_date)}</p>
            </div>
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="status">Status</Label>
              <p className="text-sf-gray-500 font-normal capitalize">{project.status}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Report Section */}
      <div className="space-y-6">
        <h2 className="font-semibold text-xl">Project Report</h2>
        <Card>
          <CardContent className="p-6">
            <Formik<ReportFormValues>
              initialValues={{
                report_name: project?.report?.name || "",
                date_of_assessment: undefined,
                site_contact_name: "",
                site_contact_title: "",
                assessment_due_to: "",
                date_of_loss: undefined,
              }}
              onSubmit={handleSaveReport}
              enableReinitialize
            >
              {({ values, setFieldValue, isSubmitting }) => (
                <Form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Report Name */}
                  <div className="space-y-2">
                    <Label htmlFor="report_name">Report name</Label>
                    <Field
                      as={Input}
                      id="report_name"
                      name="report_name"
                      className="bg-gray-50"
                      readOnly
                    />
                  </div>
                  
                  {/* Date of Assessment */}
                  <div className="space-y-2">
                    <Label htmlFor="date_of_assessment">Date of Assessment</Label>
                    <DatePicker 
                      date={values.date_of_assessment} 
                      setDate={(date) => setFieldValue("date_of_assessment", date)}
                    />
                  </div>
                  
                  {/* Site Contact Name */}
                  <div className="space-y-2">
                    <Label htmlFor="site_contact_name">Site Contact Name</Label>
                    <Field
                      as={Input}
                      id="site_contact_name"
                      name="site_contact_name"
                    />
                  </div>
                  
                  {/* Site Contact Title */}
                  <div className="space-y-2">
                    <Label htmlFor="site_contact_title">Site Contact Title</Label>
                    <Field
                      as={Input}
                      id="site_contact_title"
                      name="site_contact_title"
                    />
                  </div>
                  
                  {/* Assessment Due To */}
                  <div className="space-y-2">
                    <Label htmlFor="assessment_due_to">Assessment Due To</Label>
                    <Field
                      as={Input}
                      id="assessment_due_to"
                      name="assessment_due_to"
                    />
                  </div>
                  
                  {/* Date of Loss */}
                  <div className="space-y-2">
                    <Label htmlFor="date_of_loss">Date of Loss</Label>
                    <DatePicker 
                      date={values.date_of_loss} 
                      setDate={(date) => setFieldValue("date_of_loss", date)}
                    />
                  </div>
                  
                  <div className="mt-6 flex justify-end md:col-span-2">
                    <Button 
                      type="submit" 
                      className="bg-safetech-gray text-black font-medium px-10"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                    <Button 
                      type="button" 
                      className="ml-4 bg-gray-100 text-black font-medium px-8"
                      onClick={() => window.history.back()}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDetail;
