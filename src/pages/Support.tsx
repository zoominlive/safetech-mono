import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

const Support: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-8">
      <div className="flex items-center gap-3">
        <Mail className="w-8 h-8 text-sf-secondary-300" />
        <h2 className="text-2xl font-bold">Support Inbox</h2>
      </div>
      <div className="bg-white rounded-lg shadow p-6 min-h-[200px] flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">No support tickets yet.</p>
        <Button className="bg-sf-secondary-300 text-black w-[180px] h-[44px]">
          <a href="mailto:support@safetech.com?subject=Support%20Request">
            Create New Ticket
          </a>
        </Button>
      </div>
    </div>
  );
};

export default Support;
