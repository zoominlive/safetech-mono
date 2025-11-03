import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useParams } from "react-router";
import UserDetails from "./UserDetails";
import UserForm from "./UserForm";
import { CardSkeleton } from "@/components/ui/skeletons/CardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { SquarePen } from "lucide-react";

function UserLayout() {
  const { id } = useParams<{ id: string }>();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [loading, _setLoading] = useState<boolean>(false);

  if (loading && id) {
    return (
      <div className="space-y-9">
        <div className="space-y-7">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-xl">User Details</h2>
            <Skeleton className="w-[150px] h-[48px]" />
          </div>
          <CardSkeleton rows={3} columns={2} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-9">
      <div className="space-y-7">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl">
            {id ? "User Details" : "Add New User"}
          </h2>
          {id && !isEdit && (
            <Button
              className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 w-[150px] h-[48px]"
              onClick={() => setIsEdit(true)}
            >
              Edit <SquarePen />
            </Button>
          )}
        </div>
        {isEdit && id ? (
          <UserForm 
            userId={id} 
            onCancel={() => {
              setIsEdit(false);
            }}
          />
        ) : id && !isEdit ? (
          <UserDetails />
        ) : (
          <UserForm />
        )}
      </div>
    </div>
  );
}

export default UserLayout;
