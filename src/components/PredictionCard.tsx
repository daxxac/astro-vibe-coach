import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sun, Brain, AlertTriangle, MessageCircle, Sparkles, Moon, Stars, Zap, Palette } from "lucide-react";

interface PredictionCardProps {
  prediction?: {
    general: string;
    love: string;
    career: string;
    health: string;
    advice: string;
    astrological_chart?: {
      sun_position: string;
      moon_position: string;
      mercury: string;
      venus: string;
      mars: string;
      jupiter: string;
      saturn: string;
      daily_aspect: string;
    };
    astrological_aspects?: {
      moon_phase: string;
      planetary_positions: string;
      daily_energy: string;
      lucky_elements: {
        colors: string[];
        numbers: number[];
        direction: string;
      };
    };
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
        
        {/* Astrological Chart */}
        {prediction?.astrological_chart && (
          <div className="glass-card p-4 border-cosmic/30">
            <div className="flex items-center gap-2 mb-3">
              <Sun className="w-5 h-5 text-cosmic" />
              <h4 className="font-medium text-cosmic">Астрологическая карта дня</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-yellow-500" />
                  <span className="text-muted-foreground">{prediction.astrological_chart.sun_position}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-blue-400" />
                  <span className="text-muted-foreground">{prediction.astrological_chart.moon_position}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-400 text-sm">☿</span>
                  <span className="text-muted-foreground">{prediction.astrological_chart.mercury}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-pink-400 text-sm">♀</span>
                  <span className="text-muted-foreground">{prediction.astrological_chart.venus}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-red-400 text-sm">♂</span>
                  <span className="text-muted-foreground">{prediction.astrological_chart.mars}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 text-sm">♃</span>
                  <span className="text-muted-foreground">{prediction.astrological_chart.jupiter}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">♄</span>
                  <span className="text-muted-foreground">{prediction.astrological_chart.saturn}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Stars className="w-4 h-4 text-cosmic" />
                  <span className="text-muted-foreground">{prediction.astrological_chart.daily_aspect}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Astrological Aspects */}
        {prediction?.astrological_aspects && (
          <div className="glass-card p-4 border-purple-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Stars className="w-5 h-5 text-purple-400" />
              <h4 className="font-medium text-purple-400">Астрологические аспекты</h4>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Moon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-blue-400">Фаза Луны:</span>
                  <p className="text-muted-foreground mt-1">{prediction.astrological_aspects.moon_phase}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Stars className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-yellow-400">Планетарные влияния:</span>
                  <p className="text-muted-foreground mt-1">{prediction.astrological_aspects.planetary_positions}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-orange-400">Энергия дня:</span>
                  <p className="text-muted-foreground mt-1">{prediction.astrological_aspects.daily_energy}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Palette className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-green-400">Счастливые элементы:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {prediction.astrological_aspects.lucky_elements.colors.map((color, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                        {color}
                      </Badge>
                    ))}
                    {prediction.astrological_aspects.lucky_elements.numbers.map((number, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {number}
                      </Badge>
                    ))}
                    <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">
                      {prediction.astrological_aspects.lucky_elements.direction}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
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