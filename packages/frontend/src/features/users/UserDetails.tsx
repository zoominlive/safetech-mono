import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CardSkeleton } from "@/components/ui/skeletons/CardSkeleton";
import { toast } from "@/components/ui/use-toast";
import { userService } from "@/services/api/userService";
import { useAuthStore } from "@/store";
import { SquarePen } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

interface UserDetails {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  phone: string;
  last_login: string;
}

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetails | null>(null);
  const loggedInUser = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await userService.getUserById(id);
        
        if (response.success) {
          setUser(response.data);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to load user details",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast({
          title: "Error",
          description: "Failed to load user details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (isLoading) {
    return <CardSkeleton rows={3} columns={2} />;
  }

  if (!user) {
    return <div className="text-center py-8">User not found</div>;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <BackButton/>
            <h2 className="font-semibold text-xl">User Details</h2>
          </div>
          <div className="space-x-4">
            {loggedInUser.user?.role !== "Technician" && 
            <Button
              className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2.5"
              asChild
            >
              <Link to={`/staff/${id}/edit`}>
                Edit User <SquarePen />
              </Link>
            </Button>
            }
          </div>
        </div>
        <Card>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 pt-6">
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="userName">Name</Label>
              <strong className="text-sf-gray-500 font-medium">
                {user.first_name + ' ' + user.last_name}
              </strong>
            </div>
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="userEmail">Email</Label>
              <strong className="text-sf-gray-500 font-medium">
                {user.email}
              </strong>
            </div>
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="phone">Phone</Label>
              <p className="text-sf-gray-500 font-normal">{user.phone || '-'}</p>
            </div>
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="role">Role</Label>
              <p className="text-sf-gray-500 font-normal">{user.role}</p>
            </div>
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="lastLogin">Last Login</Label>
              <p className="text-sf-gray-500 font-normal">{formatDate(user.last_login)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDetail;
