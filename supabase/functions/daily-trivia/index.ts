import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { date, count } = await req.json();
    const today = date || new Date().toISOString().split("T")[0];
    const questionCount = count || 1;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `Today's date is ${today}. Generate exactly ${questionCount} multiple-choice Chicago trivia question${questionCount > 1 ? "s" : ""}. 
Each question should be about Chicago — its history, landmarks, sports teams, food, neighborhoods, culture, or famous people.
Each question should cover a DIFFERENT topic/category.
Use the date as a seed so the questions are unique to this day but deterministic.

You MUST call the provide_questions function with ALL ${questionCount} questions at once.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content:
                "You are a Chicago trivia expert. Generate fun, interesting trivia questions about Chicago. Always use the provide_questions tool to return your answer.",
            },
            { role: "user", content: prompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "provide_questions",
                description:
                  "Provide Chicago trivia questions with 4 multiple choice options each",
                parameters: {
                  type: "object",
                  properties: {
                    questions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          question: {
                            type: "string",
                            description: "The trivia question about Chicago",
                          },
                          options: {
                            type: "array",
                            items: { type: "string" },
                            description: "Exactly 4 answer options",
                          },
                          correctIndex: {
                            type: "number",
                            description:
                              "The 0-based index of the correct answer in the options array",
                          },
                        },
                        required: ["question", "options", "correctIndex"],
                      },
                      description: `Array of exactly ${questionCount} trivia questions`,
                    },
                  },
                  required: ["questions"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "provide_questions" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited — try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const parsed = JSON.parse(toolCall.function.arguments);
    
    // Support both single and multi-question responses
    // If count=1, return backward-compatible single question
    if (questionCount === 1) {
      const q = parsed.questions?.[0] || parsed;
      return new Response(JSON.stringify(q), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For multi-question, return the array
    return new Response(JSON.stringify(parsed.questions || [parsed]), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("daily-trivia error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
