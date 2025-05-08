import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, SquarePen } from "lucide-react";

const ReportsTable: React.FC = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Report Name</TableHead>
          <TableHead>Created Date</TableHead>
          <TableHead>Completed Reports</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Enable/Disable</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Mould Assessment</TableCell>
          <TableCell>Dec 8, 2024</TableCell>

          <TableCell>3</TableCell>
          <TableCell>
            <Badge className="bg-[#178D17] rounded py-1.5 px-3">Enabled</Badge>
          </TableCell>
          <TableCell>
            <Button>
              <Eye />
            </Button>
            <Button>
              <SquarePen />
            </Button>
          </TableCell>
          <TableCell>
            <Switch />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default ReportsTable;
