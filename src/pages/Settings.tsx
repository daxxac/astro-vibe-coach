import { useState, useEffect } from "react";
import { CosmicBackground } from "@/components/CosmicBackground";
import { CosmicHeader } from "@/components/CosmicHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, ArrowLeft, Moon, Sun, Bell, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import type { User as SupabaseUser } from '@supabase/supabase-js';

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadProfile(session.user.id);
        } else {
          navigate("/");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      // Delete all user data first (personas, predictions)
      await supabase.from('predictions').delete().eq('persona_id', user.id);
      await supabase.from('personas').delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('id', user.id);
      
      // Sign out
      await supabase.auth.signOut();
      
      toast({
        title: "Аккаунт удалён",
        description: "Ваш аккаунт и все данные были удалены",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Ошибка удаления",
        description: error.message || "Не удалось удалить аккаунт",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      <CosmicBackground />
      <CosmicHeader 
        user={user} 
        profile={profile} 
        onAuthClick={() => {}} 
      />
      
      <div className="relative z-10 container mx-auto px-4 py-8 flex-1">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
            <h1 className="text-2xl font-semibold text-cosmic">Настройки</h1>
          </div>

          <div className="space-y-6">
            {/* Appearance Settings */}
            <Card className="glass-card border-white/20">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" />
                  Внешний вид
                </CardTitle>
                <CardDescription>
                  Настройте внешний вид приложения
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-foreground flex items-center gap-2">
                      {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      Тёмная тема
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Переключение между светлой и тёмной темой
                    </p>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="glass-card border-white/20">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Уведомления
                </CardTitle>
                <CardDescription>
                  Управляйте уведомлениями приложения
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-foreground">Ежедневные прогнозы</Label>
                    <p className="text-sm text-muted-foreground">
                      Получать уведомления о новых прогнозах
                    </p>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Management */}
            <Card className="glass-card border-white/20">
              <CardHeader>
                <CardTitle className="text-foreground">Управление аккаунтом</CardTitle>
                <CardDescription>
                  Опасные действия с вашим аккаунтом
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <Separator className="bg-white/10" />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-red-400">Удалить аккаунт</Label>
                      <p className="text-sm text-muted-foreground">
                        Навсегда удалить ваш аккаунт и все данные
                      </p>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Удалить
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-card border-white/20">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-foreground">
                            Удалить аккаунт?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Это действие нельзя отменить. Все ваши персонажи, прогнозы и настройки будут удалены навсегда.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                            Отмена
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            className="bg-red-600 text-white hover:bg-red-700"
                          >
                            {isDeleting ? "Удаление..." : "Удалить аккаунт"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;