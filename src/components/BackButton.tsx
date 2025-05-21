import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import React from "react";

interface BackButtonProps {
  className?: string;
  title?: string;
  onClick?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  className = "", 
  title = "Go back",
  onClick
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.history.back();
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={`hover:bg-sf-secondary-100 ${className}`}
      title={title}
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
};

export default BackButton;
