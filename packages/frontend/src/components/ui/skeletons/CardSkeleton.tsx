import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface CardSkeletonProps {
  rows?: number;
  columns?: 1 | 2;
  withFooter?: boolean;
}

export function CardSkeleton({ 
  rows = 3, 
  columns = 2, 
  withFooter = false 
}: CardSkeletonProps) {
  return (
    <Card>
      <CardContent className={`grid gap-6 py-6 ${columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {Array(rows * columns).fill(null).map((_, index) => (
          <div key={index} className="grid w-full items-center gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </CardContent>
      {withFooter && (
        <CardFooter className="flex justify-end space-x-6">
          <Skeleton className="h-10 w-[150px]" />
          <Skeleton className="h-10 w-[150px]" />
        </CardFooter>
      )}
    </Card>
  );
}
