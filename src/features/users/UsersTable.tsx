import Table, { Column, StatusBadge } from "@/ui/Table";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { userService } from "@/services/api/userService";
import { useAuthStore } from "@/store";
import { toast } from "@/components/ui/use-toast";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status: string;
  profile_picture?: string;
}

interface UsersTableProps {
  searchQuery?: string;
  sortBy?: string;
}

const BACKEND_URL = window.location.hostname === 'localhost' ? 
  'http://localhost:8000/api/v1' : 
  'http://15.156.127.37/api/v1';

function UsersTable({ searchQuery, sortBy }: UsersTableProps) {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const token = useAuthStore.getState().token;
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  
  const getProfilePictureUrl = (user: any) => {
    if (!user?.profile_picture) return "/user/avatar-sf.png";
    if (user.profile_picture.startsWith('http')) return user.profile_picture;
    console.log(`${BACKEND_URL}${user.profile_picture}`);
    
    return `${BACKEND_URL}${user.profile_picture}`;
  };
  
  const columns: Column<User>[] = [
    {
      header: "User",
      accessorKey: "first_name",
      cell: (user) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={getProfilePictureUrl(user)} 
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/user/avatar-sf.png";
              }}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous" 
            />
            <AvatarFallback>{user.first_name?.charAt(0) + '' + user.last_name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <span>{user.first_name + ' ' + user.last_name}</span>
        </div>
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Role",
      accessorKey: "role",
      cell: (user) => <span className="capitalize">{user.role}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (user) => <StatusBadge status={user.status} />,
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, [token, searchQuery, sortBy, currentPage, pageSize]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getAllUsers(searchQuery, sortBy, undefined, pageSize, currentPage);
      
      if (response.success) {
        // Map API response to our User interface
        const mappedUsers = response.data.rows.map(user => ({
          id: user.id.toString(),
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role || 'user',
          status: user.deactivated_user ? 'inactive' : 'active',
          profile_picture: user.profile_picture,
        }));
        
        setUsers(mappedUsers);
        setTotalCount(response.data.count);
        setError(null);
      } else {
        setError(response.message || "Failed to load users data");
      }
    } catch (err) {
      console.error("Error fetching users data:", err);
      setError("Failed to load users data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleDetails = (user: User) => {
    navigate(`/staff/${user.id}`);
  };
  
  const handleEdit = (user: User) => {
    navigate(`/staff/${user.id}/edit`);
  };
  
  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setIsLoading(true);
      const response = await userService.deleteUser(userToDelete.id);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Error deleting user:", err);      
      const errorMessage = err?.data?.message ||
        err.message ||
        "Failed to delete user";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  if (isLoading && users.length === 0) {
    return <TableSkeleton columns={4} rows={5} hasActions={true} />;
  }

  if (error && users.length === 0) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <>
      <div>
        <Table
          columns={columns}
          data={users}
          hasActions={true}
          onDetails={handleDetails}
          onDelete={openDeleteDialog}
          onEdit={handleEdit}
          pagination={true}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {userToDelete?.first_name}'s account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default UsersTable;
