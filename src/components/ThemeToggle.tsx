import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="w-[1.2rem] h-[1.2rem] text-foreground" />
      ) : (
        <Sun className="w-[1.2rem] h-[1.2rem] text-foreground" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
