import { cn } from "@/lib/utils";
import {
  ChartNoAxesCombined,
  CircleArrowOutUpLeft,
  FileChartLine,
  FileCog,
  HandHeart,
  LayoutDashboard,
  UserRoundPlus,
  Users,
} from "lucide-react";
import { Link, useLocation } from "react-router";

type SidebarItemProps = {
  icon: React.ElementType;
  label: string;
  path: string;
  active?: boolean;
};

const SidebarItem = ({ icon: Icon, label, path, active }: SidebarItemProps) => {
  return (
    <Link
      to={path}
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
        active
          ? "bg-gray-200 text-gray-900"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
};

function MainNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: FileCog, label: "Projects", path: "/projects" },
    { icon: UserRoundPlus, label: "Customers", path: "/customers" },
    { icon: FileChartLine, label: "Reports", path: "/reports" },
    { icon: Users, label: "Staff", path: "/staff" },
    { icon: ChartNoAxesCombined, label: "Analytics", path: "/analytics" },
    { icon: HandHeart, label: "Support", path: "/support" },
  ];
  return (
    <nav className="flex flex-col h-[90%]">
      <div className="flex flex-col gap-1 px-2 pt-8">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            path={item.path}
            active={currentPath === item.path}
          />
        ))}
      </div>
      <div className="mt-auto">
        <SidebarItem
          path="/login"
          icon={CircleArrowOutUpLeft}
          label="Sign Out"
        />
      </div>
    </nav>
  );
}

export default MainNav;
