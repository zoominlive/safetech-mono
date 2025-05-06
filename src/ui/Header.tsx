import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BellDot, Settings } from "lucide-react";
import { useLocation } from "react-router";

function Header() {
  const location = useLocation();
  const title = location.pathname.slice(1);

  return (
    <header className="flex items-center justify-between w-full h-16.5 px-4 border-b">
      <h2 className="text-2xl font-semibold capitalize">{title}</h2>
      <div className="flex gap-2">
        <Button className="bg-white">
          <Settings className="size-4" />
        </Button>
        <Button className="bg-white">
          <BellDot className="size-4" />
        </Button>
        <div className="flex items-center gap-2">
          <span>Mary Smith</span>
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
