import { useState, useEffect } from "react";
import { CosmicBackground } from "@/components/CosmicBackground";
import { PersonaCard } from "@/components/PersonaCard";
import { PredictionCard } from "@/components/PredictionCard";
import { CreatePersonaModal } from "@/components/CreatePersonaModal";
import { AuthModal } from "@/components/AuthModal";
import { UserMenu } from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Sparkles, LogIn } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [personas, setPersonas] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState<any>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);

  // Auth state management
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Load user profile when logged in
        if (session?.user) {
          setTimeout(() => {
            loadUserProfile(session.user.id);
            loadPersonas();
          }, 0);
        } else {
          setProfile(null);
          setPersonas([]);
          setSelectedPersona(null);
          setCurrentPrediction(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
        loadPersonas();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user profile
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // Load personas from database
  const loadPersonas = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('personas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setPersonas(data || []);
      if (data && data.length > 0 && !selectedPersona) {
        setSelectedPersona(data[0]);
      }
    } catch (error) {
      console.error('Error loading personas:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить персонажей",
        variant: "destructive"
      });
    }
  };

  // Load today's prediction for selected persona
  const loadTodaysPrediction = async (personaId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('persona_id', personaId)
        .eq('prediction_date', today)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setCurrentPrediction(data || null);
    } catch (error) {
      console.error('Error loading prediction:', error);
    }
  };

  useEffect(() => {
    if (selectedPersona && user) {
      loadTodaysPrediction(selectedPersona.id);
    }
  }, [selectedPersona, user]);

  const handleCreatePersona = async (newPersona: any) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (personas.length >= 3) {
      toast({
        title: "Лимит персонажей",
        description: "В демо-версии можно создать максимум 3 персонажа",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('personas')
        .insert([{
          ...newPersona,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      await loadPersonas();
      setSelectedPersona(data);
      toast({
        title: "Персонаж создан! ✨",
        description: `${newPersona.name} готов к получению прогнозов`,
      });
    } catch (error) {
      console.error('Error creating persona:', error);
      toast({
        title: "Ошибка создания",
        description: "Не удалось создать персонажа",
        variant: "destructive"
      });
    }
  };

  const handleGeneratePrediction = async () => {
    if (!selectedPersona) return;
    
    setIsLoadingPrediction(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-prediction', {
        body: { persona: selectedPersona }
      });

      if (error) throw error;

      setCurrentPrediction(data.prediction);
      toast({
        title: "Прогноз готов! 🔮",
        description: "Звёзды поделились своими тайнами",
      });
    } catch (error) {
      console.error('Error generating prediction:', error);
      toast({
        title: "Ошибка генерации",
        description: "Попробуйте позже или проверьте настройки AI",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPrediction(false);
    }
  };

  const handleFeedback = async (type: 'positive' | 'negative' | 'neutral') => {
    if (!currentPrediction?.id && !selectedPersona) return;

    try {
      // If prediction has an ID, update it; otherwise find today's prediction
      let predictionId = currentPrediction?.id;
      
      if (!predictionId && selectedPersona) {
        const today = new Date().toISOString().split('T')[0];
        const { data } = await supabase
          .from('predictions')
          .select('id')
          .eq('persona_id', selectedPersona.id)
          .eq('prediction_date', today)
          .single();
        
        predictionId = data?.id;
      }

      if (predictionId) {
        const { error } = await supabase
          .from('predictions')
          .update({ feedback: type })
          .eq('id', predictionId);

        if (error) throw error;
      }

      const feedbackMessages = {
        positive: "Спасибо! Мы учтём это для будущих прогнозов ⭐",
        negative: "Мы улучшим точность прогнозов 🎯", 
        neutral: "Ваш отзыв поможет нам стать лучше 🌟"
      };
      
      toast({
        title: "Отзыв получен!",
        description: feedbackMessages[type],
      });
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить отзыв",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      <CosmicBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8 flex-1">
        {/* Header with auth */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-between mb-4">
            <div /> {/* Spacer */}
            <h1 className="text-3xl font-semibold text-cosmic">
              AstroVibe
            </h1>
            {user ? (
              <UserMenu user={user} profile={profile} />
            ) : (
              <Button
                onClick={() => setIsAuthModalOpen(true)}
                variant="outline"
                className="btn-nebula border-primary/30"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Войти
              </Button>
            )}
          </div>
        </div>

        {/* Content based on auth state */}
        {!user ? (
          <div className="text-center py-16">
            <Sparkles className="w-20 h-20 mx-auto mb-6 text-cosmic opacity-80" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Добро пожаловать в AstroVibe
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Создавайте астрологических персонажей и получайте персональные прогнозы от звёзд
            </p>
            <Button
              onClick={() => setIsAuthModalOpen(true)}
              className="btn-cosmic"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Войти или зарегистрироваться
            </Button>
          </div>
        ) : (
          <>
            {/* Выбор персонажа */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Ваши персонажи</h2>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn-cosmic"
                  disabled={personas.length >= 3}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personas.map((persona) => (
                  <PersonaCard
                    key={persona.id}
                    persona={persona}
                    isSelected={selectedPersona?.id === persona.id}
                    onClick={() => setSelectedPersona(persona)}
                  />
                ))}
              </div>
              
              {personas.length === 0 && (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    Создайте своего первого астро-персонажа
                  </p>
                </div>
              )}
            </div>

            {/* Прогноз дня */}
            {selectedPersona && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-semibold text-foreground">
                    Прогноз для {selectedPersona.name}
                  </h2>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Сегодня</span>
                  </div>
                </div>
                
                <PredictionCard
                  prediction={currentPrediction}
                  isLoading={isLoadingPrediction}
                  onGenerate={handleGeneratePrediction}
                  onFeedback={handleFeedback}
                />
              </div>
            )}
          </>
        )}

      </div>

      {/* Footer - sticky to bottom */}
      <footer className="relative z-10 text-center py-6 mt-auto border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <a 
          href="https://daxxac.dev" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-cosmic transition-colors text-sm"
        >
          by daxxac.dev
        </a>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {}}
      />

      {/* Модальное окно создания персонажа */}
      <CreatePersonaModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreatePersona}
      />
    </div>
  );
};

export default Index;
