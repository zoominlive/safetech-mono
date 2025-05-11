import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, SquarePen } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useNavigate } from "react-router";

const ReportsTable: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="rounded border">
      <Table>
        <TableHeader>
          <TableRow className="bg-safetech-gray h-[70px]">
            <TableHead>Report Name</TableHead>
            <TableHead className="text-center">Created Date</TableHead>
            <TableHead className="text-center">Completed Reports</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Action</TableHead>
            <TableHead className="text-center">Enable/Disable</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Mould Assessment</TableCell>
            <TableCell className="text-center">Dec 8, 2024</TableCell>

            <TableCell className="text-center">3</TableCell>
            <TableCell className="text-center">
              <Badge className="bg-[#178D17] rounded py-1.5 px-3">
                Enabled
              </Badge>
            </TableCell>
            <TableCell className="text-center">
              <Button
                variant="outline"
                className="rounded-r-none"
                onClick={() => navigate(`/reports/${12}`)}
              >
                <Eye />
              </Button>
              <Button
                variant="outline"
                className="rounded-l-none"
                onClick={() => navigate(`/reports/${12}/edit`)}
              >
                <SquarePen />
              </Button>
            </TableCell>
            <TableCell className="text-center">
              <Switch />
            </TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Showing 1-12 of 100</TableCell>
            <TableCell colSpan={3}>
              <Pagination className="justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      2
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default ReportsTable;
