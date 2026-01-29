import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface Response {
  question: string;
  answer: string | null;
  difficulty: string;
}

interface RequestBody {
  interviewId: string;
  category: string;
  candidateName: string;
  responses: Response[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { interviewId, category, candidateName, responses } = await req.json() as RequestBody;

    // Format the responses for analysis
    const formattedResponses = responses.map((r, i) => 
      `Question ${i + 1} (${r.difficulty}): ${r.question}\nAnswer: ${r.answer || 'No response provided'}`
    ).join('\n\n');

    const systemPrompt = `You are an expert technical interviewer and hiring manager. You are analyzing a ${category} interview for a candidate named ${candidateName}.

Your task is to:
1. Evaluate each answer based on technical accuracy, clarity, and depth
2. Provide an overall score from 0-100
3. Give constructive feedback with specific areas of strength and improvement
4. Provide hiring recommendation

Format your response in markdown with the following sections:
## Overall Assessment
[Brief summary of the candidate's performance]

## Score: [NUMBER]/100

## Strengths
- [Strength 1]
- [Strength 2]
...

## Areas for Improvement
- [Area 1]
- [Area 2]
...

## Detailed Feedback
[Specific feedback on key answers]

## Hiring Recommendation
[Strong Hire / Hire / Maybe / No Hire] with brief justification`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please analyze this ${category} interview:\n\n${formattedResponses}` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required, please add funds.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const text = await response.text();
      console.error('AI gateway error:', response.status, text);
      throw new Error('AI gateway error');
    }

    const aiResponse = await response.json();
    const review = aiResponse.choices?.[0]?.message?.content || 'Unable to generate review';

    // Extract score from the review
    const scoreMatch = review.match(/Score:\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;

    return new Response(JSON.stringify({ 
      review, 
      score: Math.min(100, Math.max(0, score))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('analyze-interview error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
