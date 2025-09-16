import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import MainNav from "./MainNav";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onCloseMobileMenu?: () => void;
  onSetExpanded?: () => void;
  expanded: boolean;
}

function Sidebar({ onCloseMobileMenu, expanded, onSetExpanded }: SidebarProps) {
  return (
    <aside
      className={cn("border-r border-sf-gray-400 h-screen bg-white w-full")}
    >
      <div className="border-b py-1 relative">
        <Logo expanded={expanded} />
        <Button
          variant="outline"
          size="icon"
          className="hidden lg:flex absolute -right-4 -bottom-4 rounded-full"
          onClick={onSetExpanded}
        >
          {expanded ? <ChevronLeft /> : <ChevronRight />}
        </Button>
      </div>
      <MainNav onItemClick={onCloseMobileMenu} expanded={expanded} />
    </aside>
  );
}

export default Sidebar;
