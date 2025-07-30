import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client with service role for RLS bypass
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Astronomical calculations for basic planetary positions
function calculatePlanetaryPositions(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Julian day calculation for planetary positions
  const a = Math.floor((14 - month) / 12);
  const y = year - a;
  const m = month + 12 * a - 3;
  const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + 1721119;
  
  // Days since J2000.0
  const d = jd - 2451545.0;
  
  // Mean longitudes (simplified calculations)
  const sunMeanLongitude = (280.460 + 0.9856474 * d) % 360;
  const moonMeanLongitude = (218.316 + 13.176396 * d) % 360;
  const mercuryMeanLongitude = (252.250 + 4.092317 * d) % 360;
  const venusMeanLongitude = (181.979 + 1.602130 * d) % 360;
  const marsMeanLongitude = (355.433 + 0.524033 * d) % 360;
  const jupiterMeanLongitude = (34.351 + 0.083091 * d) % 360;
  const saturnMeanLongitude = (50.077 + 0.033459 * d) % 360;
  
  // Convert to zodiac signs
  function getZodiacSign(longitude: number): { sign: string, degree: number } {
    const signs = ['Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева', 'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы'];
    const signIndex = Math.floor(longitude / 30);
    const degree = Math.floor(longitude % 30);
    return { sign: signs[signIndex], degree };
  }
  
  // Calculate moon phase
  const moonPhase = ((moonMeanLongitude - sunMeanLongitude + 360) % 360) / 360;
  let phaseDescription = '';
  if (moonPhase < 0.125) phaseDescription = 'Новолуние';
  else if (moonPhase < 0.375) phaseDescription = 'Растущая Луна';
  else if (moonPhase < 0.625) phaseDescription = 'Полнолуние';
  else phaseDescription = 'Убывающая Луна';
  
  const sun = getZodiacSign(sunMeanLongitude);
  const moon = getZodiacSign(moonMeanLongitude);
  const mercury = getZodiacSign(mercuryMeanLongitude);
  const venus = getZodiacSign(venusMeanLongitude);
  const mars = getZodiacSign(marsMeanLongitude);
  const jupiter = getZodiacSign(jupiterMeanLongitude);
  const saturn = getZodiacSign(saturnMeanLongitude);
  
  return {
    sun_position: `Солнце в знаке ${sun.sign} в ${sun.degree}°`,
    moon_position: `Луна в знаке ${moon.sign} в ${moon.degree}°`,
    mercury: `Меркурий в ${mercury.sign}`,
    venus: `Венера в ${venus.sign}`,
    mars: `Марс в ${mars.sign}`,
    jupiter: `Юпитер в ${jupiter.sign}`,
    saturn: `Сатурн в ${saturn.sign}`,
    moon_phase: phaseDescription,
    daily_aspect: calculateDailyAspect(sun, moon, mercury, venus, mars)
  };
}

function calculateDailyAspect(sun: any, moon: any, mercury: any, venus: any, mars: any): string {
  // Simple aspect calculation - in reality this would be much more complex
  const aspects = [
    `Соединение Солнца и Меркурия в ${sun.sign}`,
    `Тригон Луны и Венеры`,
    `Квадрат Марса и Солнца`,
    `Секстиль Венеры и Юпитера`,
    `Оппозиция Луны и Солнца`
  ];
  
  return aspects[Math.floor(Math.random() * aspects.length)];
}

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

    // Calculate real astrological positions
    const today = new Date();
    const planetaryPositions = calculatePlanetaryPositions(today);
    
    // Calculate age and zodiac info
    const birthDate = new Date(persona.birth_date);
    const age = today.getFullYear() - birthDate.getFullYear();
    
    // Create professional astrological prompt with REAL planetary positions
    const prompt = `Ты — профессиональный астролог.

Сгенерируй персональный астрологический прогноз на сегодня (${today.toLocaleDateString('ru-RU')}) для пользователя, используя ТОЧНЫЕ положения планет.

🔭 **РЕАЛЬНЫЕ ПОЛОЖЕНИЯ ПЛАНЕТ НА СЕГОДНЯ:**
- ${planetaryPositions.sun_position}
- ${planetaryPositions.moon_position} 
- ${planetaryPositions.mercury}
- ${planetaryPositions.venus}
- ${planetaryPositions.mars}
- ${planetaryPositions.jupiter}
- ${planetaryPositions.saturn}
- Фаза Луны: ${planetaryPositions.moon_phase}
- Основной аспект: ${planetaryPositions.daily_aspect}

👤 **ДАННЫЕ ПОЛЬЗОВАТЕЛЯ:**
- Имя: ${persona.name}
- Дата рождения: ${persona.birth_date}
- Время рождения: ${persona.birth_time || 'не указано'}
- Город рождения: ${persona.birth_place}
- Знак зодиака: ${persona.zodiac_sign}
- Возраст: ${age} лет

Учитывай транзиты планет к натальным положениям пользователя и создай ПЕРСОНАЛЬНЫЙ прогноз.

Формат ответа JSON:
{
  "astrological_chart": {
    "sun_position": "${planetaryPositions.sun_position}",
    "moon_position": "${planetaryPositions.moon_position}",
    "mercury": "${planetaryPositions.mercury}",
    "venus": "${planetaryPositions.venus}",
    "mars": "${planetaryPositions.mars}",
    "jupiter": "${planetaryPositions.jupiter}",
    "saturn": "${planetaryPositions.saturn}",
    "daily_aspect": "${planetaryPositions.daily_aspect}"
  },
  "general": "персональный общий прогноз с учетом транзитов к натальному ${persona.zodiac_sign} (2-3 предложения)",
  "love": "любовь и отношения с учетом Венеры в ${planetaryPositions.venus.split(' ')[2]} (2-3 предложения)",
  "career": "карьера и деньги с учетом транзитов (2-3 предложения)", 
  "health": "здоровье с учетом Луны в ${planetaryPositions.moon_position.split(' ')[4]} (2-3 предложения)",
  "advice": "главный совет дня на основе аспектов (1-2 предложения)",
  "astrological_aspects": {
    "moon_phase": "${planetaryPositions.moon_phase} - как это влияет на ${persona.name}",
    "planetary_positions": "анализ ключевых транзитов к натальному ${persona.zodiac_sign}",
    "daily_energy": "энергия дня для ${persona.zodiac_sign}",
    "lucky_elements": {
      "colors": ["цвет1", "цвет2"],
      "numbers": [число1, число2, число3],
      "direction": "направление"
    }
  }
}`;

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
      
      // Ensure we have the calculated planetary positions
      if (!prediction.astrological_chart) {
        prediction.astrological_chart = {
          sun_position: planetaryPositions.sun_position,
          moon_position: planetaryPositions.moon_position,
          mercury: planetaryPositions.mercury,
          venus: planetaryPositions.venus,
          mars: planetaryPositions.mars,
          jupiter: planetaryPositions.jupiter,
          saturn: planetaryPositions.saturn,
          daily_aspect: planetaryPositions.daily_aspect
        };
      }
      
      // Validate prediction structure
      if (!prediction.general || !prediction.love || !prediction.career || !prediction.health || !prediction.advice) {
        throw new Error('Incomplete prediction structure');
      }
      
      console.log('Parsed prediction:', prediction);
      
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw text that failed to parse:', generatedText);
      
      // Fallback prediction with REAL planetary positions
      prediction = {
        astrological_chart: {
          sun_position: planetaryPositions.sun_position,
          moon_position: planetaryPositions.moon_position,
          mercury: planetaryPositions.mercury,
          venus: planetaryPositions.venus,
          mars: planetaryPositions.mars,
          jupiter: planetaryPositions.jupiter,
          saturn: planetaryPositions.saturn,
          daily_aspect: planetaryPositions.daily_aspect
        },
        general: `Сегодня благоприятный день для новых начинаний. ${planetaryPositions.daily_aspect} создает особую энергетику.`,
        love: `В отношениях влияние ${planetaryPositions.venus} способствует гармонии и взаимопониманию.`,
        career: `${planetaryPositions.sun_position} поддерживает профессиональные инициативы и важные решения.`,
        health: `${planetaryPositions.moon_position} влияет на эмоциональное состояние и общее самочувствие.`,
        advice: `Используйте энергию ${planetaryPositions.daily_aspect} для достижения поставленных целей.`,
        astrological_aspects: {
          moon_phase: `${planetaryPositions.moon_phase} - время для планирования и новых начинаний`,
          planetary_positions: `${planetaryPositions.daily_aspect} создает благоприятную энергетику`,
          daily_energy: `Высокая креативная энергия благодаря ${planetaryPositions.sun_position}`,
          lucky_elements: { 
            colors: ["золотой", "зеленый", "синий"], 
            numbers: [3, 7, 12], 
            direction: "восток" 
          }
        }
      };
    }

    console.log('Generated prediction for:', persona.name);
    
    // Save prediction to database with service role (bypasses RLS)
    const { data: savedPrediction, error: saveError } = await supabase
      .from('predictions')
      .insert([{
        persona_id: persona.id,
        general: prediction.general,
        love: prediction.love,
        career: prediction.career,
        health: prediction.health,
        advice: prediction.advice,
        prediction_date: today.toISOString().split('T')[0]
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