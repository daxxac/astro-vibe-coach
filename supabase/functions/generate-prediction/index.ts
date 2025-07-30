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
    
    // Create personalized prompt
    const prompt = `Ты профессиональный астролог. Создай персональный прогноз на сегодня (${today.toLocaleDateString('ru-RU')}) для:

Имя: ${persona.name}
Возраст: ${age} лет
Знак зодиака: ${persona.zodiac_sign}
Пол: ${persona.gender}
Семейный статус: ${persona.family_status}
Есть дети: ${persona.has_children ? 'да' : 'нет'}
Интересы: ${persona.interests?.join(', ') || 'не указаны'}
Место рождения: ${persona.birth_place}

Создай прогноз в формате JSON с полями:
- general: общий прогноз дня (2-3 предложения)
- love: любовь и отношения (2-3 предложения) 
- career: карьера и деньги (2-3 предложения)
- health: здоровье (2-3 предложения)
- advice: главный совет дня (1-2 предложения)

Учти текущие астрологические аспекты и транзиты. Будь позитивным, но реалистичным. Используй астрологическую терминологию умеренно.`;

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
      throw new Error(`Vertex AI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Try to parse JSON from the response
    let prediction;
    try {
      // Extract JSON from the response (sometimes wrapped in markdown)
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        prediction = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if no JSON found
        prediction = {
          general: "Сегодня благоприятный день для новых начинаний.",
          love: "В отношениях возможны приятные сюрпризы.",
          career: "Отличное время для карьерных инициатив.",
          health: "Обратите внимание на режим сна.",
          advice: "Доверьтесь интуиции при принятии важных решений."
        };
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      // Fallback prediction
      prediction = {
        general: "Сегодня благоприятный день для новых начинаний.",
        love: "В отношениях возможны приятные сюрпризы.", 
        career: "Отличное время для карьерных инициатив.",
        health: "Обратите внимание на режим сна.",
        advice: "Доверьтесь интуиции при принятии важных решений."
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
    }
    
    return new Response(JSON.stringify({ 
      prediction: savedPrediction || prediction 
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