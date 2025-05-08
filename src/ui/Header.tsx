import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BellDot, Settings } from "lucide-react";
import { useLocation } from "react-router";

function Header() {
  const location = useLocation();
  const title = location.pathname.slice(1).split("/").at(0);

  return (
    <header className="flex items-center justify-between w-full h-16.5 px-4 md:px-6 border-b mt-2 lg:mt-0">
      <h2 className="text-xl md:text-2xl font-semibold capitalize ml-8 lg:ml-0">{title}</h2>
      <div className="flex items-center gap-1 md:gap-2">
        <Button className="bg-white hidden md:flex">
          <Settings className="size-4" />
        </Button>
        <Button className="bg-white">
          <BellDot className="size-4" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline">Mary Smith</span>
          <Avatar>
            <AvatarImage src="/user/avatar-sf.png" />
            <AvatarFallback>MS</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

export default Header;
