import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CardSkeleton } from "@/components/ui/skeletons/CardSkeleton";
import { toast } from "@/components/ui/use-toast";
import { userService } from "@/services/api/userService";
import { SquarePen } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

interface UserDetails {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  last_login: string;
}

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetails | null>(null);
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
          <h2 className="font-semibold text-xl">User Details</h2>
          <div className="space-x-4">
            <Button
              className="bg-sf-secondary-300 px-4 py-2.5 text-black"
              asChild
            >
              <Link to={`/staff/${id}/edit`}>
                Edit User <SquarePen />
              </Link>
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 pt-6">
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="userName">Name</Label>
              <strong className="text-sf-gray-500 font-medium">
                {user.name}
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
