import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/store";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-[1.2rem] w-[1.2rem] text-gray-700 dark:text-gray-300" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem] text-gray-700 dark:text-gray-300" />
      )}
    </Button>
  );
}
