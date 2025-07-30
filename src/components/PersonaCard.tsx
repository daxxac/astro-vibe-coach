import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Heart, Users } from "lucide-react";

interface PersonaData {
  id: string;
  name: string;
  birth_date: string;
  birth_time?: string;
  birth_place: string;
  zodiac_sign: string;
  gender: string;
  family_status: string;
  has_children: boolean;
  interests: string[];
}

interface PersonaCardProps {
  persona: PersonaData;
  isSelected: boolean;
  onClick: () => void;
}

export const PersonaCard = ({ persona, isSelected, onClick }: PersonaCardProps) => {
  const getZodiacEmoji = (sign: string) => {
    const zodiacEmojis: { [key: string]: string } = {
      aries: "♈", taurus: "♉", gemini: "♊", cancer: "♋",
      leo: "♌", virgo: "♍", libra: "♎", scorpio: "♏",
      sagittarius: "♐", capricorn: "♑", aquarius: "♒", pisces: "♓"
    };
    return zodiacEmojis[sign?.toLowerCase()] || "✨";
  };

  return (
    <Card 
      className={`glass-card p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
        isSelected ? 'glass-card-intense border-primary/50' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-cosmic flex items-center justify-center text-2xl">
            {getZodiacEmoji(persona.zodiac_sign)}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-cosmic">{persona.name}</h3>
            <p className="text-sm text-muted-foreground capitalize">{persona.zodiac_sign}</p>
          </div>
        </div>
        {isSelected && (
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{persona.birth_date}</span>
          {persona.birth_time && <span>в {persona.birth_time}</span>}
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{persona.birth_place}</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Heart className="w-4 h-4" />
          <span>{persona.family_status}</span>
          {persona.has_children && <Users className="w-4 h-4" />}
        </div>
      </div>

      {persona.interests.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {persona.interests.slice(0, 3).map((interest, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="text-xs bg-secondary/20 text-secondary-foreground border-secondary/30"
            >
              {interest}
            </Badge>
          ))}
          {persona.interests.length > 3 && (
            <Badge 
              variant="outline" 
              className="text-xs border-muted-foreground/30 text-muted-foreground"
            >
              +{persona.interests.length - 3}
            </Badge>
          )}
        </div>
      )}
    </Card>
  );
};