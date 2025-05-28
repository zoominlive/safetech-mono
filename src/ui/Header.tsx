import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store";
import { BellDot, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router";

// Backend base URL - should ideally come from environment variables
console.log('window.location.hostname =>', window.location.hostname);

const BACKEND_URL = window.location.hostname === 'localhost' ? 
  'http://localhost:8000/api/v1' : 
  'http://15.156.127.37/api/v1';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore.getState().user;
  const title = location.pathname.slice(1).split("/").at(0);
  console.log('user', user);
  
  // Function to get the correct profile picture URL
  const getProfilePictureUrl = () => {
    if (!user?.profile_picture) return "/user/avatar-sf.png";
    if (user.profile_picture.startsWith('http')) return user.profile_picture;
    console.log(`${BACKEND_URL}${user.profile_picture}`);
    
    return `${BACKEND_URL}${user.profile_picture}`;
  };
  
  return (
    <header className="flex items-center justify-between w-full h-16.5 px-4 md:px-6 border-b mt-2 lg:mt-0">
      <h2 className="text-xl md:text-2xl font-semibold capitalize ml-8 lg:ml-0">
        {title}
      </h2>
      <div className="flex items-center gap-1 md:gap-2">
        <Button onClick={() => navigate('/settings')} className="bg-white hidden md:flex text-black">
          <Settings className="size-4" />
        </Button>
        <Button className="bg-white text-black hover:bg-white">
          <BellDot className="size-4" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline">{user?.name}</span>
          <Avatar>
            <AvatarImage 
              src={getProfilePictureUrl()} 
              onError={(e) => {
                console.error("Failed to load profile image:", e);
                // Prevent infinite error loop by removing the src attribute
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/user/avatar-sf.png";
              }}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

export default Header;
