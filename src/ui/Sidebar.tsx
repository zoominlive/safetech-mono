import Logo from "./Logo";
import MainNav from "./MainNav";

function Sidebar() {
  return (
    <aside className="w-[316px] border-r border-gray-500 h-screen">
      <div className="border-b py-1">
        <Logo />
      </div>
      <MainNav />
    </aside>
  );
}

export default Sidebar;
