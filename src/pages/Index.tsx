import { useState, useEffect } from "react";
import { CosmicBackground } from "@/components/CosmicBackground";
import { PersonaCard } from "@/components/PersonaCard";
import { PredictionCard } from "@/components/PredictionCard";
import { CreatePersonaModal } from "@/components/CreatePersonaModal";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Моковые данные для демонстрации
const mockPersonas = [
  {
    id: "1",
    name: "Анна",
    birthDate: "1995-03-15",
    birthTime: "14:30",
    birthPlace: "Москва, Россия",
    zodiacSign: "pisces",
    gender: "female",
    familyStatus: "relationship",
    hasChildren: false,
    interests: ["карьера", "путешествия", "йога"]
  },
  {
    id: "2", 
    name: "Максим",
    birthDate: "1988-07-22",
    birthPlace: "Санкт-Петербург, Россия",
    zodiacSign: "leo",
    gender: "male",
    familyStatus: "married",
    hasChildren: true,
    interests: ["бизнес", "спорт", "семья", "инвестиции"]
  }
];

const mockPrediction = {
  general: "Сегодня благоприятный день для новых начинаний. Планеты располагают к творческим проектам и важным решениям.",
  love: "В отношениях возможны приятные сюрпризы. Венера в вашем секторе усиливает романтические вибрации.",
  career: "Отличное время для карьерных инициатив. Меркурий поддержит важные переговоры и презентации.",
  health: "Обратите внимание на режим сна. Марс может давать излишнюю энергию - направьте её в спорт.",
  advice: "Доверьтесь интуиции при принятии важных решений. Луна в вашем знаке усиливает внутреннее знание."
};

const Index = () => {
  const [personas, setPersonas] = useState(mockPersonas);
  const [selectedPersona, setSelectedPersona] = useState(mockPersonas[0]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState<any>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);

  const handleCreatePersona = (newPersona: any) => {
    if (personas.length >= 3) {
      toast({
        title: "Лимит персонажей",
        description: "В демо-версии можно создать максимум 3 персонажа",
        variant: "destructive"
      });
      return;
    }
    
    setPersonas([...personas, newPersona]);
    setSelectedPersona(newPersona);
    toast({
      title: "Персонаж создан! ✨",
      description: `${newPersona.name} готов к получению прогнозов`,
    });
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

  const handleFeedback = (type: 'positive' | 'negative' | 'neutral') => {
    const feedbackMessages = {
      positive: "Спасибо! Мы учтём это для будущих прогнозов ⭐",
      negative: "Мы улучшим точность прогнозов 🎯", 
      neutral: "Ваш отзыв поможет нам стать лучше 🌟"
    };
    
    toast({
      title: "Отзыв получен!",
      description: feedbackMessages[type],
    });
  };

  return (
    <div className="min-h-screen relative">
      <CosmicBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-cosmic mb-2">
            AstroVibe
          </h1>
        </div>

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

        {/* Нижний раздел */}
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Для полного функционала подключите Supabase и настройте AI-генерацию прогнозов
          </p>
        </div>
      </div>

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
