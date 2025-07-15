import { cn } from "@/lib/utils";
import {
  ChartNoAxesCombined,
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
  showLabel: boolean;
  path: string;
  active?: boolean;
  onClick?: () => void;
};

const SidebarItem = ({
  icon: Icon,
  label,
  showLabel,
  path,
  active,
  onClick,
}: SidebarItemProps) => {
  return (
    <Link
      to={path}
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
        active
          ? "bg-safetech-gray text-gray-900"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100",
        showLabel ? "" : "justify-center"
      )}
      onClick={onClick}
    >
      <Icon className="w-5 h-5" />
      {showLabel && <span>{label}</span>}
      {/* <span>{label}</span> */}
    </Link>
  );
};

interface MainNavProps {
  onItemClick?: () => void;
  expanded: boolean;
}

function MainNav({ onItemClick, expanded }: MainNavProps) {
  const location = useLocation();
  const currentPath = "/" + location.pathname.slice(1).split("/").at(0);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: FileCog, label: "Projects", path: "/projects" },
    { icon: UserRoundPlus, label: "Customers", path: "/customers" },
    // { icon: FileChartLine, label: "Project Reports", path: "/project-reports" },
    { icon: FileChartLine, label: "Report Templates", path: "/reports" },
    { icon: Users, label: "Staff", path: "/staff" },
    { icon: ChartNoAxesCombined, label: "Analytics", path: "/analytics" },
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
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-gray-400 cursor-not-allowed",
                  expanded ? "" : "justify-center"
                )}
              >
                <Icon className="w-5 h-5" />
                {expanded && <span>{item.label}</span>}
              </div>
            );
          }

          return (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              showLabel={expanded}
              path={item.path}
              active={currentPath === item.path}
              onClick={onItemClick}
            />
          );
        })}
      </div>
      <div className="mt-auto px-2">
        {expanded ? (
          <a
            href="mailto:support@dastech.ca?subject=Support%20Request"
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-gray-500 hover:text-gray-900 hover:bg-gray-100",
              expanded ? "" : "justify-center"
            )}
            style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <HandHeart className="w-5 h-5" />
            <span style={{ marginLeft: 8 }}>Support</span>
          </a>
        ) : (
          <a
            href="mailto:support@dastech.ca?subject=Support%20Request"
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-gray-500 hover:text-gray-900 hover:bg-gray-100 justify-center"
            )}
            style={{ textDecoration: 'none' }}
          >
            <HandHeart className="w-5 h-5" />
          </a>
        )}
      </div>
    </nav>
  );
}

export default MainNav;
