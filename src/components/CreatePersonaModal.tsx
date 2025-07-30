import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, CalendarDays, MapPin } from "lucide-react";

interface CreatePersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (persona: any) => void;
}

export const CreatePersonaModal = ({ isOpen, onClose, onSave }: CreatePersonaModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    gender: "",
    familyStatus: "",
    hasChildren: false,
    interests: [] as string[]
  });

  const [customInterest, setCustomInterest] = useState("");

  const suggestedInterests = [
    "карьера", "путешествия", "спорт", "семья", "творчество", "музыка",
    "книги", "йога", "медитация", "кулинария", "фотография", "искусство",
    "танцы", "бизнес", "инвестиции", "психология", "наука", "природа"
  ];

  const zodiacSigns = [
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
  ];

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const addCustomInterest = () => {
    const trimmed = customInterest.trim();
    if (trimmed && !formData.interests.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, trimmed]
      }));
      setCustomInterest("");
    }
  };

  const getZodiacFromDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Упрощённая логика определения знака зодиака
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "aries";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "taurus";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "gemini";
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "cancer";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "leo";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "virgo";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "libra";
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "scorpio";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "sagittarius";
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "capricorn";
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "aquarius";
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "pisces";
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const zodiacSign = getZodiacFromDate(formData.birthDate);

    const persona = {
      id: Date.now().toString(),
      name: formData.name,
      birth_date: formData.birthDate,
      birth_time: formData.birthTime || null,
      birth_place: formData.birthPlace,
      zodiac_sign: zodiacSign,
      gender: formData.gender,
      family_status: formData.familyStatus,
      has_children: formData.hasChildren,
      interests: formData.interests,
    };

    onSave(persona);
    onClose();
    setFormData({
      name: "",
      birthDate: "",
      birthTime: "",
      birthPlace: "",
      gender: "",
      familyStatus: "",
      hasChildren: false,
      interests: []
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-none max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-cosmic text-xl">
            <Sparkles className="w-5 h-5" />
            Создать астро-персонажа
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Имя</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-cosmic"
              placeholder="Введите имя"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="birthDate" className="text-foreground flex items-center gap-1">
                <CalendarDays className="w-4 h-4" />
                Дата рождения
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="input-cosmic"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthTime" className="text-foreground">Время (опц.)</Label>
              <Input
                id="birthTime"
                type="time"
                value={formData.birthTime}
                onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                className="input-cosmic"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthPlace" className="text-foreground flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Место рождения
            </Label>
            <Input
              id="birthPlace"
              value={formData.birthPlace}
              onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
              className="input-cosmic"
              placeholder="Город, страна"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-foreground">Пол</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger className="input-cosmic">
                  <SelectValue placeholder="Выберите" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/20">
                  <SelectItem value="male">Мужской</SelectItem>
                  <SelectItem value="female">Женский</SelectItem>
                  <SelectItem value="other">Другой</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Семейный статус</Label>
              <Select value={formData.familyStatus} onValueChange={(value) => setFormData({ ...formData, familyStatus: value })}>
                <SelectTrigger className="input-cosmic">
                  <SelectValue placeholder="Выберите" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/20">
                  <SelectItem value="single">Холост/Не замужем</SelectItem>
                  <SelectItem value="relationship">В отношениях</SelectItem>
                  <SelectItem value="married">Женат/Замужем</SelectItem>
                  <SelectItem value="divorced">Разведён/Разведена</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasChildren"
              checked={formData.hasChildren}
              onCheckedChange={(checked) => setFormData({ ...formData, hasChildren: checked as boolean })}
            />
            <Label htmlFor="hasChildren" className="text-foreground">Есть дети</Label>
          </div>

            {/* Интересы */}
            <div className="space-y-2">
              <Label htmlFor="interests">Интересы</Label>
              
              {/* Подсказки интересов */}
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">Популярные варианты:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedInterests.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        formData.interests.includes(interest)
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-muted/20 border-muted-foreground/20 text-muted-foreground hover:bg-muted/30'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Выбранные интересы */}
              {formData.interests.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Выбранные интересы:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.map((interest) => (
                      <div
                        key={interest}
                        className="flex items-center gap-1 px-3 py-1 bg-primary/20 border border-primary/30 text-primary text-xs rounded-full"
                      >
                        <span>{interest}</span>
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          className="ml-1 text-primary hover:text-primary/70"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Поле для ввода собственных интересов */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomInterest();
                    }
                  }}
                  placeholder="Добавить свой интерес..."
                  className="flex-1 px-3 py-2 bg-background/50 border border-white/20 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Button
                  type="button"
                  onClick={addCustomInterest}
                  disabled={!customInterest.trim()}
                  size="sm"
                  className="px-3"
                >
                  +
                </Button>
              </div>
            </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1 btn-nebula border-secondary/30"
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              className="flex-1 btn-cosmic"
              disabled={!formData.name || !formData.birthDate || !formData.birthPlace}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Создать
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};