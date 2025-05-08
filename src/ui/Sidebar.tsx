import Logo from "./Logo";
import MainNav from "./MainNav";

interface SidebarProps {
  onCloseMobileMenu?: () => void;
}

function Sidebar({ onCloseMobileMenu }: SidebarProps) {
  return (
    <aside className="w-[316px] border-r border-gray-500 h-screen bg-white">
      <div className="border-b py-1">
        <Logo />
      </div>
      <MainNav onItemClick={onCloseMobileMenu} />
    </aside>
  );
}

export default Sidebar;
