import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store";
import { Settings } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.logout);
  const avatarRef = useRef(null);
  const title = location.pathname.slice(1).split("/").at(0);
  console.log('user', user);
  
  const handleSignOut = () => {
    signOut();
    navigate("/login");
  };

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        avatarRef.current &&
        !(avatarRef.current as HTMLElement).contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <header className="flex items-center justify-between w-full h-16.5 px-4 md:px-6 border-b mt-2 lg:mt-0">
      <h2 className="text-xl md:text-2xl font-semibold capitalize ml-8 lg:ml-0">
        {title}
      </h2>
      <div className="flex items-center gap-1 md:gap-2">
        <ThemeToggle />
        <Button onClick={() => navigate('/settings')} className="bg-white dark:bg-gray-800 hidden md:flex text-black dark:text-white">
          <Settings className="size-4" />
        </Button>
        <div className="flex items-center gap-2 relative">
          <span className="hidden md:inline">{user?.first_name + ' ' + user?.last_name}</span>
          <div ref={avatarRef}>
            <Avatar className="cursor-pointer" onClick={() => setDropdownOpen((v) => !v)}>
              <AvatarImage 
                src={user?.profile_picture} 
                onError={(e) => {
                  console.error("Failed to load profile image:", e);
                  // Prevent infinite error loop by removing the src attribute
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/user/avatar-sf.png";
                }}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
              />
              <AvatarFallback>{user?.first_name?.charAt(0) + '' + user?.last_name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow z-50">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white"
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
