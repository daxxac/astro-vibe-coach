import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, LogOut, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface UserMenuProps {
  user: any;
  profile: any;
}

export const UserMenu = ({ user, profile }: UserMenuProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "До свидания! 👋",
        description: "Вы успешно вышли из системы",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка выхода",
        description: error.message || "Что-то пошло не так",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Пользователь';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarFallback className="bg-gradient-cosmic text-white font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="glass-card border-white/20 min-w-[200px] z-50"
        align="end"
        sideOffset={5}
      >
        <div className="flex items-center gap-3 p-3">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarFallback className="bg-gradient-cosmic text-white font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        
        <DropdownMenuSeparator className="bg-white/10" />
        
        <DropdownMenuItem 
          className="flex items-center gap-2 text-foreground hover:bg-white/10 cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          <User className="h-4 w-4" />
          <span>Профиль</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="flex items-center gap-2 text-foreground hover:bg-white/10 cursor-pointer"
          onClick={() => navigate("/settings")}
        >
          <Sparkles className="h-4 w-4" />
          <span>Настройки</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-white/10" />
        
        <DropdownMenuItem 
          className="flex items-center gap-2 text-red-400 hover:bg-red-500/10 cursor-pointer"
          onClick={handleSignOut}
          disabled={isLoading}
        >
          <LogOut className="h-4 w-4" />
          <span>{isLoading ? "Выход..." : "Выйти"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};