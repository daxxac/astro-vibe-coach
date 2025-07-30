import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { persona } = await req.json();
    const vertexApiKey = Deno.env.get('VERTEX_AI_API_KEY');

    if (!vertexApiKey) {
      throw new Error('Vertex AI API key not configured');
    }

    // Calculate age and zodiac info
    const birthDate = new Date(persona.birth_date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    // Get current astrological data
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    
    // Create professional astrological prompt
    const prompt = `Ты — профессиональный астролог.

Пожалуйста, сгенерируй **астрологическую сводку на сегодня** (${today.toLocaleDateString('ru-RU')}) для следующего пользователя, основываясь на его дате и времени рождения, а также городе рождения.

Если у тебя есть доступ к точным эфемеридам — укажи реальные положения планет. Если нет — смоделируй вероятное расположение планет, характерное для этой даты, основываясь на типичных астрологических паттернах.

Параметры пользователя:
- Имя: ${persona.name}
- Дата рождения: ${persona.birth_date}
- Время рождения: ${persona.birth_time || 'не указано'}
- Город рождения: ${persona.birth_place}
- Знак зодиака: ${persona.zodiac_sign}
- Возраст: ${age} лет

Формат ответа JSON:
{
  "astrological_chart": {
    "sun_position": "Солнце в знаке [знак] в [градус]°",
    "moon_position": "Луна в знаке [знак] в [градус]°", 
    "mercury": "Меркурий в [знак]",
    "venus": "Венера в [знак]",
    "mars": "Марс в [знак]",
    "jupiter": "Юпитер в [знак]",
    "saturn": "Сатурн в [знак]",
    "daily_aspect": "основной аспект дня (например, квадрат Венеры и Урана)"
  },
  "general": "общий прогноз дня (2-3 предложения)",
  "love": "любовь и отношения (2-3 предложения)",
  "career": "карьера и деньги (2-3 предложения)", 
  "health": "здоровье (2-3 предложения)",
  "advice": "главный совет дня (1-2 предложения)",
  "astrological_aspects": {
    "moon_phase": "текущая фаза луны и её влияние",
    "planetary_positions": "основные планетарные аспекты на сегодня",
    "daily_energy": "энергия дня по астрологии", 
    "lucky_elements": {
      "colors": ["цвет1", "цвет2"],
      "numbers": [число1, число2, число3],
      "direction": "направление"
    }
  }
}

Напиши профессионально и точно, используя реальные астрологические термины и положения планет для ${today.toLocaleDateString('ru-RU')}.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${vertexApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
          responseMimeType: "application/json"
        }
      }),
    });

    if (!response.ok) {
      console.error('Vertex AI API error:', response.status, await response.text());
      throw new Error(`Vertex AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Vertex AI response:', JSON.stringify(data, null, 2));
    
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      console.error('No generated text from Vertex AI');
      throw new Error('No content generated from AI');
    }
    
    console.log('Generated text:', generatedText);
    
    // Try to parse JSON from the response
    let prediction;
    try {
      // First try to parse directly
      try {
        prediction = JSON.parse(generatedText);
      } catch (directParseError) {
        // Extract JSON from the response (sometimes wrapped in markdown)
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          prediction = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      }
      
      // Validate prediction structure
      if (!prediction.general || !prediction.love || !prediction.career || !prediction.health || !prediction.advice) {
        throw new Error('Incomplete prediction structure');
      }
      
      console.log('Parsed prediction:', prediction);
      
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw text that failed to parse:', generatedText);
      
      // Fallback prediction with professional astrological structure
      prediction = {
        astrological_chart: {
          sun_position: "Солнце в Водолее в 10°",
          moon_position: "Луна в Раке в 23°", 
          mercury: "Меркурий в Козероге",
          venus: "Венера в Стрельце",
          mars: "Марс в Близнецах",
          jupiter: "Юпитер в Тельце",
          saturn: "Сатурн в Рыбах",
          daily_aspect: "тригон Луны и Венеры — гармония в отношениях"
        },
        general: "Сегодня благоприятный день для новых начинаний и свежих идей.",
        love: "В отношениях возможны приятные сюрпризы и гармоничное общение.",
        career: "Отличное время для карьерных инициатив и финансовых решений.",
        health: "Обратите внимание на режим сна и физическую активность.",
        advice: "Доверьтесь интуиции при принятии важных решений.",
        astrological_aspects: {
          moon_phase: "Растущая Луна способствует новым начинаниям и реализации планов",
          planetary_positions: "Венера в гармоничном аспекте с Юпитером благоприятствует отношениям",
          daily_energy: "Высокая креативная энергия и позитивные вибрации",
          lucky_elements: { 
            colors: ["синий", "серебряный", "зеленый"], 
            numbers: [3, 7, 12], 
            direction: "север" 
          }
        }
      };
    }

    console.log('Generated prediction for:', persona.name);
    
    // Save prediction to database
    const { data: savedPrediction, error: saveError } = await supabase
      .from('predictions')
      .insert([{
        persona_id: persona.id,
        general: prediction.general,
        love: prediction.love,
        career: prediction.career,
        health: prediction.health,
        advice: prediction.advice
      }])
      .select()
      .single();

    if (saveError) {
      console.error('Error saving prediction:', saveError);
      // Don't throw error, just log it - we can still return the prediction
    } else {
      console.log('Saved prediction to database:', savedPrediction);
    }
    
    // Return prediction with astrological aspects (which aren't saved to DB)
    const finalPrediction = savedPrediction ? {
      ...savedPrediction,
      astrological_chart: prediction.astrological_chart,
      astrological_aspects: prediction.astrological_aspects
    } : prediction;
    
    return new Response(JSON.stringify({ 
      prediction: finalPrediction
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-prediction:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});