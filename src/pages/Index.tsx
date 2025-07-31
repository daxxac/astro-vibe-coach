import { useState, useEffect, useCallback } from "react";
import { CosmicBackground } from "@/components/CosmicBackground";
import { CosmicHeader } from "@/components/CosmicHeader";
import { PersonaCard } from "@/components/PersonaCard";
import { PredictionCard } from "@/components/PredictionCard";
import { PredictionCalendar } from "@/components/PredictionCalendar";
import { CreatePersonaModal } from "@/components/CreatePersonaModal";
import { AuthModal } from "@/components/AuthModal";
import { UserMenu } from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
  const [editingPersona, setEditingPersona] = useState<any>(null);
  const [deletingPersona, setDeletingPersona] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [predictions, setPredictions] = useState<{[key: string]: any}>({});

  // Load user data helper function  
  const loadUserData = useCallback(async (userId: string) => {
    try {
      console.log('🔄 Starting loadUserData for user:', userId);
      
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ Error loading profile:', profileError);
      } else {
        console.log('✅ Profile loaded:', profileData);
        setProfile(profileData);
      }

      // Load personas
      console.log('🔄 Loading personas for user:', userId);
      const { data: personasData, error: personasError } = await supabase
        .from('personas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (personasError) {
        console.error('❌ Error loading personas:', personasError);
      } else {
        console.log('✅ Personas loaded:', personasData);
        console.log('📊 Personas count:', personasData?.length || 0);
        setPersonas(personasData || []);
        if (personasData && personasData.length > 0) {
          console.log('🎯 Setting selected persona:', personasData[0]);
          setSelectedPersona(personasData[0]);
        } else {
          console.log('⚠️ No personas found, clearing selection');
          setSelectedPersona(null);
        }
      }
    } catch (error) {
      console.error('💥 Error in loadUserData:', error);
    }
  }, []);

  // Auth state management
  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('🔐 Auth state changed:', event, 'User ID:', session?.user?.id);
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        // Use setTimeout to prevent deadlock
        if (currentUser) {
          console.log('👤 User logged in, setting timeout to load data...');
          setTimeout(() => {
            console.log('⏰ Timeout executed, calling loadUserData...');
            loadUserData(currentUser.id);
          }, 0);
        } else {
          console.log('👤 No user, clearing data');
          setProfile(null);
          setPersonas([]);
          setSelectedPersona(null);
          setCurrentPrediction(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('🔍 Initial session check:', session?.user?.id);
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        console.log('👤 Found existing user, setting timeout to load data...');
        setTimeout(() => {
          console.log('⏰ Initial timeout executed, calling loadUserData...');
          loadUserData(currentUser.id);
        }, 0);
      } else {
        console.log('👤 No existing user found');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserData]);

  // Load personas from database helper function
  const loadPersonas = useCallback(async (userId?: string) => {
    const userIdToUse = userId || user?.id;
    
    if (!userIdToUse) {
      console.log('No user ID available, clearing personas');
      setPersonas([]);
      return;
    }
    
    console.log('Loading personas for user:', userIdToUse);
    
    try {
      const { data, error } = await supabase
        .from('personas')
        .select('*')
        .eq('user_id', userIdToUse)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Loaded personas:', data);
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
  }, [user, selectedPersona, toast]);

  // Load prediction for selected date and persona
  const loadPrediction = async (personaId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const cacheKey = `${personaId}-${dateStr}`;
    
    // Check cache first
    if (predictions[cacheKey]) {
      return predictions[cacheKey];
    }

    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('persona_id', personaId)
        .eq('prediction_date', dateStr)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Cache the result
      setPredictions(prev => ({
        ...prev,
        [cacheKey]: data
      }));

      return data;
    } catch (error) {
      console.error('Error loading prediction:', error);
      return null;
    }
  };

  // Load prediction when selectedPersona or selectedDate changes
  useEffect(() => {
    if (!selectedPersona) return;
    
    const loadCurrentPrediction = async () => {
      const prediction = await loadPrediction(selectedPersona.id, selectedDate);
      // Update current prediction state for compatibility
      setCurrentPrediction(prediction);
    };

    loadCurrentPrediction();
  }, [selectedPersona, selectedDate]);

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

  const handleEditPersona = async (updatedPersona: any) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('personas')
        .update({
          name: updatedPersona.name,
          birth_date: updatedPersona.birth_date,
          birth_time: updatedPersona.birth_time,
          birth_place: updatedPersona.birth_place,
          zodiac_sign: updatedPersona.zodiac_sign,
          gender: updatedPersona.gender,
          family_status: updatedPersona.family_status,
          has_children: updatedPersona.has_children,
          interests: updatedPersona.interests
        })
        .eq('id', updatedPersona.id);

      if (error) throw error;

      await loadPersonas();
      setEditingPersona(null);
      
      toast({
        title: "Персонаж обновлён! ✨",
        description: `${updatedPersona.name} успешно отредактирован`,
      });
    } catch (error) {
      console.error('Error updating persona:', error);
      toast({
        title: "Ошибка обновления",
        description: "Не удалось обновить персонажа",
        variant: "destructive"
      });
    }
  };

  const handleDeletePersona = async (persona: any) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('personas')
        .delete()
        .eq('id', persona.id);

      if (error) throw error;

      await loadPersonas();
      
      // If we deleted the selected persona, clear selection
      if (selectedPersona?.id === persona.id) {
        setSelectedPersona(null);
        setCurrentPrediction(null);
      }
      
      setDeletingPersona(null);
      toast({
        title: "Персонаж удалён",
        description: `${persona.name} больше не в вашем списке`,
      });
    } catch (error) {
      console.error('Error deleting persona:', error);
      toast({
        title: "Ошибка удаления",
        description: "Не удалось удалить персонажа",
        variant: "destructive"
      });
    }
  };

  const openEditModal = (persona: any) => {
    setEditingPersona(persona);
    setIsCreateModalOpen(true);
  };

  const openDeleteDialog = (persona: any) => {
    setDeletingPersona(persona);
  };

  const closeEditModal = () => {
    setEditingPersona(null);
    setIsCreateModalOpen(false);
  };

  const handleGeneratePrediction = async (date?: Date) => {
    if (!selectedPersona) return;
    
    const targetDate = date || selectedDate;
    setIsLoadingPrediction(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-prediction', {
        body: { 
          persona: selectedPersona,
          prediction_date: targetDate.toISOString().split('T')[0]
        }
      });

      if (error) throw error;

      // Update cache and current prediction
      const dateStr = targetDate.toISOString().split('T')[0];
      const cacheKey = `${selectedPersona.id}-${dateStr}`;
      setPredictions(prev => ({
        ...prev,
        [cacheKey]: data.prediction
      }));
      setCurrentPrediction(data.prediction);
      
      toast({
        title: "Прогноз готов! 🔮",
        description: "Звёзды поделились своими тайнами",
      });
    } catch (error) {
      console.error('Error generating prediction:', error);
      toast({
        title: "Ошибка генерации",
        description: error.message || "Попробуйте позже или проверьте настройки AI",
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
      <CosmicHeader 
        user={user} 
        profile={profile} 
        onAuthClick={() => setIsAuthModalOpen(true)} 
      />
      
      <div className="relative z-10 container mx-auto px-4 py-8 flex-1">

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
                  onClick={() => {
                    setEditingPersona(null);
                    setIsCreateModalOpen(true);
                  }}
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
                    onEdit={openEditModal}
                    onDelete={openDeleteDialog}
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

            {/* Календарь и прогноз */}
            {selectedPersona && (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Calendar Section */}
                <div>
                  <PredictionCalendar
                    selectedPersona={selectedPersona}
                    onDateSelect={setSelectedDate}
                    selectedDate={selectedDate}
                    onGeneratePrediction={handleGeneratePrediction}
                    isLoading={isLoadingPrediction}
                  />
                </div>

                {/* Prediction Section */}
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Прогноз на {selectedDate.toLocaleDateString('ru-RU')}
                  </h3>
                  <PredictionCard 
                    prediction={currentPrediction} 
                    isLoading={isLoadingPrediction}
                    onGenerate={() => handleGeneratePrediction(selectedDate)}
                    onFeedback={handleFeedback}
                  />
                </div>
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

      {/* Create/Edit Persona Modal */}
      <CreatePersonaModal
        isOpen={isCreateModalOpen}
        onClose={closeEditModal}
        onSave={editingPersona ? handleEditPersona : handleCreatePersona}
        editingPersona={editingPersona}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingPersona} onOpenChange={() => setDeletingPersona(null)}>
        <AlertDialogContent className="glass-card border-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-cosmic">Удалить персонажа?</AlertDialogTitle>
            <AlertDialogDescription className="text-foreground">
              Вы уверены, что хотите удалить персонажа {deletingPersona?.name}? 
              Это действие нельзя отменить. Все прогнозы для этого персонажа также будут удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="btn-nebula border-secondary/30 text-foreground">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => handleDeletePersona(deletingPersona)}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;