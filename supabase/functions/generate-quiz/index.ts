import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIQuizRequest {
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  type: 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'writing' | 'speaking';
  difficulty: 'easy' | 'medium' | 'hard';
  numberOfQuestions: number;
  userWeaknesses?: string[];
  previousTopics?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Obtener la API key de OpenAI desde las variables de entorno
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY no está configurada')
    }

    // Parsear el request
    const { level, type, difficulty, numberOfQuestions, userWeaknesses, previousTopics }: AIQuizRequest = await req.json()

    // Construir el prompt
    const weaknessesText = userWeaknesses?.length 
      ? `El usuario tiene dificultades con: ${userWeaknesses.join(', ')}.`
      : '';
    
    const previousTopicsText = previousTopics?.length
      ? `Evita estos temas ya cubiertos: ${previousTopics.join(', ')}.`
      : '';

    const prompt = `
Genera ${numberOfQuestions} preguntas de inglés con las siguientes especificaciones:
- Nivel: ${level} (Marco Común Europeo)
- Tipo: ${type}
- Dificultad: ${difficulty}
${weaknessesText}
${previousTopicsText}

Formato de respuesta JSON:
{
  "questions": [
    {
      "id": "unique_id",
      "type": "${type}",
      "level": "${level}",
      "topic": "tema_específico",
      "question": "pregunta_aquí",
      "options": [
        {"id": "a", "text": "opción_a"},
        {"id": "b", "text": "opción_b"},
        {"id": "c", "text": "opción_c"},
        {"id": "d", "text": "opción_d"}
      ],
      "correctAnswer": "id_respuesta_correcta",
      "explanation": "explicación_detallada",
      "difficulty": "${difficulty}",
      "estimatedTime": tiempo_en_segundos
    }
  ]
}

Asegúrate de que las preguntas sean variadas, educativas y apropiadas para el nivel especificado.
    `.trim();

    // Llamar a OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en enseñanza de inglés y creación de exámenes estilo Cambridge. Generas preguntas de alta calidad adaptadas al nivel del estudiante.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0].message.content
    const parsedContent = JSON.parse(content)

    // Preparar la respuesta
    const response = {
      questions: parsedContent.questions.map((q: any, index: number) => ({
        ...q,
        id: q.id || `ai_${Date.now()}_${index}`
      })),
      metadata: {
        level,
        type,
        difficulty,
        estimatedTime: parsedContent.questions.length * 2,
        topics: parsedContent.questions.map((q: any) => q.topic)
      }
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})