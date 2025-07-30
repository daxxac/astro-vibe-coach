import { useState, useEffect } from "react";
import { CosmicBackground } from "@/components/CosmicBackground";
import { CosmicHeader } from "@/components/CosmicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Save, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { User as SupabaseUser } from '@supabase/supabase-js';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      setProfile(data);
      setDisplayName(data?.display_name || "");
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      if (profile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update({ display_name: displayName })
          .eq('id', user.id);
        
        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('profiles')
          .insert([{ id: user.id, display_name: displayName }]);
        
        if (error) throw error;
      }

      toast({
        title: "Профиль обновлён! ✨",
        description: "Ваши изменения успешно сохранены",
      });
      
      loadProfile(user.id);
    } catch (error: any) {
      toast({
        title: "Ошибка сохранения",
        description: error.message || "Не удалось сохранить изменения",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const userDisplayName = profile?.display_name || user?.email?.split('@')[0] || 'Пользователь';
  const initials = userDisplayName.slice(0, 2).toUpperCase();

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
            <h1 className="text-2xl font-semibold text-cosmic">Профиль</h1>
          </div>

          <Card className="glass-card border-white/20">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarFallback className="bg-gradient-cosmic text-white font-medium text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-foreground">Персональная информация</CardTitle>
                  <CardDescription>
                    Управляйте своими данными профиля
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="input-cosmic bg-white/5"
                />
                <p className="text-xs text-muted-foreground">
                  Email нельзя изменить
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-foreground">Отображаемое имя</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Введите ваше имя"
                  className="input-cosmic"
                  disabled={isLoading || isSaving}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={isLoading || isSaving}
                  className="btn-cosmic"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Сохранение..." : "Сохранить"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;