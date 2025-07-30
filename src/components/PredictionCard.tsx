import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Brain, AlertTriangle, MessageCircle, Sparkles } from "lucide-react";

interface PredictionCardProps {
  prediction?: {
    general: string;
    love: string;
    career: string;
    health: string;
    advice: string;
  };
  isLoading?: boolean;
  onGenerate?: () => void;
  onFeedback?: (type: 'positive' | 'negative' | 'neutral') => void;
}

export const PredictionCard = ({ 
  prediction, 
  isLoading = false, 
  onGenerate,
  onFeedback 
}: PredictionCardProps) => {
  if (!prediction && !isLoading) {
    return (
      <Card className="glass-card p-6 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-cosmic rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-cosmic mb-2">
            Узнайте что готовят звёзды
          </h3>
          <p className="text-muted-foreground">
            Персональный прогноз на сегодня ждёт вас
          </p>
        </div>
        
        <Button 
          onClick={onGenerate}
          className="btn-cosmic w-full py-3"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Получить прогноз
        </Button>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="glass-card p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-cosmic rounded-full flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-white animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-cosmic mb-2">
            Звёзды говорят...
          </h3>
          <p className="text-muted-foreground">
            Анализируем космические влияния
          </p>
          
          <div className="mt-6 space-y-3">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="h-4 bg-muted/20 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const sections = [
    {
      icon: Sun,
      title: "Общий прогноз",
      content: prediction?.general,
      color: "text-primary"
    },
    {
      icon: Brain,
      title: "Карьера и мышление",
      content: prediction?.career,
      color: "text-secondary"
    },
    {
      icon: AlertTriangle,
      title: "Здоровье",
      content: prediction?.health,
      color: "text-accent"
    },
    {
      icon: MessageCircle,
      title: "Любовь и отношения",
      content: prediction?.love,
      color: "text-primary-glow"
    }
  ];

  return (
    <Card className="glass-card p-6">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-semibold text-cosmic mb-2">
          Прогноз на сегодня
        </h3>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('ru-RU', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {sections.map((section, index) => (
          <div key={index} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <section.icon className={`w-5 h-5 ${section.color}`} />
              <h4 className="font-medium text-foreground">{section.title}</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}
        
        {prediction?.advice && (
          <div className="glass-card-intense p-4 border-primary/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h4 className="font-medium text-cosmic">Совет от звёзд</h4>
            </div>
            <p className="text-sm text-foreground leading-relaxed font-medium">
              {prediction.advice}
            </p>
          </div>
        )}
      </div>

      {onFeedback && (
        <div className="border-t border-white/10 pt-4">
          <p className="text-sm text-muted-foreground mb-3 text-center">
            Как вам прогноз?
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFeedback('positive')}
              className="bg-green-500/20 border-green-500/30 hover:bg-green-500/30 text-green-400"
            >
              👍 Точно
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFeedback('negative')}
              className="bg-red-500/20 border-red-500/30 hover:bg-red-500/30 text-red-400"
            >
              👎 Мимо
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFeedback('neutral')}
              className="bg-yellow-500/20 border-yellow-500/30 hover:bg-yellow-500/30 text-yellow-400"
            >
              🤔 Не уверен
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};