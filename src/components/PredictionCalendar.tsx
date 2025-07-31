import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface PredictionCalendarProps {
  selectedPersona: any;
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
  onGeneratePrediction: (date: Date) => void;
  isLoading: boolean;
}

export function PredictionCalendar({ 
  selectedPersona, 
  onDateSelect, 
  selectedDate, 
  onGeneratePrediction,
  isLoading 
}: PredictionCalendarProps) {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [dailyLimit, setDailyLimit] = useState(0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (!selectedPersona) return;
    
    const loadAvailableDates = async () => {
      const { data } = await supabase
        .from('predictions')
        .select('prediction_date')
        .eq('persona_id', selectedPersona.id);
      
      if (data) {
        setAvailableDates(data.map(p => p.prediction_date));
      }
    };

    const loadDailyLimit = async () => {
      const todayStr = today.toISOString().split('T')[0];
      const { data } = await supabase
        .from('daily_generation_limits')
        .select('count')
        .eq('user_id', selectedPersona.user_id)
        .eq('generation_date', todayStr)
        .single();
      
      setDailyLimit(data?.count || 0);
    };

    loadAvailableDates();
    loadDailyLimit();
  }, [selectedPersona, today]);

  const hasPrediction = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availableDates.includes(dateStr);
  };

  const canGenerateForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    
    // Can generate for today and future dates
    if (dateStr >= todayStr) {
      // Check if daily limit reached
      if (dateStr === todayStr && dailyLimit >= 3) {
        return false;
      }
      return true;
    }
    return false;
  };

  const isSelectedDate = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Дата прогноза</span>
        {dailyLimit > 0 && (
          <span className="text-xs text-muted-foreground">
            {dailyLimit}/3 прогнозов сегодня
          </span>
        )}
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP", { locale: ru }) : "Выберите дату"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateSelect(date)}
            initialFocus
            className="pointer-events-auto"
            modifiers={{
              hasPrediction: (date) => hasPrediction(date),
              canGenerate: (date) => canGenerateForDate(date),
              isToday: (date) => date.toDateString() === today.toDateString()
            }}
            modifiersStyles={{
              hasPrediction: { 
                backgroundColor: 'hsl(var(--primary))', 
                color: 'hsl(var(--primary-foreground))',
                fontWeight: 'bold'
              },
              canGenerate: { 
                backgroundColor: 'hsl(var(--secondary))',
                color: 'hsl(var(--secondary-foreground))'
              },
              isToday: {
                outline: '2px solid hsl(var(--primary))',
                outlineOffset: '2px'
              }
            }}
            locale={ru}
          />
          <div className="p-3 border-t text-xs text-muted-foreground">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary"></div>
                <span>Есть прогноз</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-secondary"></div>
                <span>Можно создать прогноз</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border-2 border-primary"></div>
                <span>Сегодня</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}