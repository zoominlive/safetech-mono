import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store";
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
import { Link, useLocation, useNavigate } from "react-router";

type SidebarItemProps = {
  icon: React.ElementType;
  label: string;
  path: string;
  active?: boolean;
  onClick?: () => void;
};

const SidebarItem = ({ icon: Icon, label, path, active, onClick }: SidebarItemProps) => {
  return (
    <Link
      to={path}
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
        active
          ? "bg-safetech-gray text-gray-900"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
      )}
      onClick={onClick}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
};

interface MainNavProps {
  onItemClick?: () => void;
}

function MainNav({ onItemClick }: MainNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const handleSignOut = async () => {
    try {
      console.log('token', useAuthStore.getState().token);
      useAuthStore.getState().logout();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
    <nav className="flex flex-col h-[calc(100vh-75px)]">
      <div className="flex flex-col gap-1 px-2 pt-8">
        {menuItems.map((item) => {
          // Make Analytics menu item not clickable
          if (item.label === "Analytics") {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-gray-400 cursor-not-allowed"
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
            );
          }
          
          return (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              path={item.path}
              active={currentPath === item.path}
              onClick={onItemClick}
            />
          );
        })}
      </div>
      <div className="mt-auto px-2">
        <SidebarItem
          path=""
          icon={CircleArrowOutUpLeft}
          label="Sign Out"
          onClick={handleSignOut}
        />
      </div>
    </nav>
  );
}

export default MainNav;
