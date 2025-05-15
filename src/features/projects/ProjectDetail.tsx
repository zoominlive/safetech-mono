import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CardSkeleton } from "@/components/ui/skeletons/CardSkeleton";
import { toast } from "@/components/ui/use-toast";
import { projectService } from "@/services/api/projectService";
import { SquarePen } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

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
    </div>
  );
};

export default ProjectDetail;
