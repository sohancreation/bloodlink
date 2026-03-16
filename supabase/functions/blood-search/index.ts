import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { type, query, bloodGroup, zilla, upozilla } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "blood") {
      systemPrompt = `You are a blood donation search assistant for Bangladesh.

ABSOLUTE RULES — NO EXCEPTIONS:
1. NEVER invent, fabricate, or guess phone numbers. If you don't know the real phone number, set phone to null or omit it entirely.
2. NEVER create fake donor names or fake organizations. Only mention organizations/blood banks you are confident actually exist.
3. For well-known organizations (Sandhani, Red Crescent, Quantum Foundation, Badhan, etc.), you may include their publicly known hotline numbers.
4. For individual donors — NEVER fabricate. Instead, suggest the user contact known blood donor organizations or Facebook groups by name.
5. Mark every result with source: "ai-knowledge" to indicate it comes from your training data, NOT live verified data.
6. In the summary (Bengali), clearly state: "এই তথ্যগুলো AI-এর প্রশিক্ষণ ডেটা থেকে নেওয়া। ব্যবহারের আগে ফোন করে নিশ্চিত করুন।"

Respond in structured JSON:
- results: array of { name, bloodGroup, location, phone (real or null), source, available, type }
- summary: Bengali summary with accuracy disclaimer
- tips: Bengali tips for finding blood`;

      userPrompt = `Search for blood availability:
- Blood Group: ${bloodGroup || "Any"}
- District: ${zilla || "Not specified"}
- Upozilla: ${upozilla || "Not specified"}
- Details: ${query || "None"}

Only return REAL organizations, blood banks, and donor groups that you are confident exist in this area. Include their real publicly known phone numbers. Do NOT make up any phone numbers. If unsure about a number, leave phone as null.`;

    } else if (type === "nearby") {
      const serviceTypeMap: Record<string, string> = {
        hospital: "hospitals (সরকারি ও বেসরকারি হাসপাতাল, ক্লিনিক)",
        pharmacy: "pharmacies (ঔষধের দোকান, ফার্মেসি)",
        doctor: "doctors and specialists (ডাক্তার, বিশেষজ্ঞ চিকিৎসক)",
        ambulance: "ambulance services (অ্যাম্বুলেন্স সেবা)",
        blood_bank: "blood banks (ব্লাড ব্যাংক, রক্তদান কেন্দ্র)",
      };
      const serviceLabel = serviceTypeMap[query] || "all medical services";
      const typeValue = query || "all";

      systemPrompt = `You are an expert local services directory for Bangladesh.

ABSOLUTE RULES — NO EXCEPTIONS:
1. NEVER fabricate or guess phone numbers. Only include phone numbers you are CONFIDENT are real and publicly known.
2. If you don't know a real phone number, set phone to null. DO NOT generate numbers in 01XXX-XXXXXX format.
3. Only return establishments/services you are confident actually exist at the specified location.
4. For well-known government hospitals (Medical College Hospitals, Sadar Hospitals, Upozilla Health Complexes), include them as they definitely exist.
5. For well-known private hospitals/clinics you know exist in that area, include them.
6. Do NOT invent names of pharmacies, doctors, or ambulance services.
7. Mark every result with source: "ai-knowledge" to indicate it's from training data.
8. In the summary, clearly state in Bengali that users should verify contact details before visiting.
9. Return ONLY "${typeValue}" type results.

Each result MUST have "type" set to exactly: "${typeValue}".

Respond in structured JSON:
- results: array of { name, type, address, phone (real or null), rating (if known, else null), openNow (omit if unknown), services, source }
- summary: Bengali summary with verification disclaimer`;

      userPrompt = `Find ONLY ${serviceLabel} in:
- District: ${zilla || "Dhaka"}
- Upozilla: ${upozilla || ""}
- Category: ${typeValue}

Return ONLY real, verified establishments you are confident exist here. Include real phone numbers ONLY if you know them. For government facilities (Medical College Hospital, Sadar Hospital, Upozilla Health Complex), include them. For private facilities, only include well-known ones you're sure about. DO NOT make up any results or phone numbers.`;

    } else {
      throw new Error("Invalid search type");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_search_results",
              description: "Return structured search results with only verified real data",
              parameters: {
                type: "object",
                properties: {
                  results: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        type: { type: "string" },
                        bloodGroup: { type: "string" },
                        location: { type: "string" },
                        address: { type: "string" },
                        phone: { type: "string", description: "Real verified phone number or null" },
                        distance: { type: "string" },
                        source: { type: "string", description: "Must be ai-knowledge" },
                        available: { type: "boolean" },
                        rating: { type: "string" },
                        openNow: { type: "boolean" },
                        services: { type: "string" },
                      },
                      required: ["name", "source"],
                    },
                  },
                  summary: { type: "string", description: "Bengali summary with accuracy disclaimer" },
                  tips: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["results", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_search_results" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI search failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let parsed;
    if (toolCall?.function?.arguments) {
      parsed = JSON.parse(toolCall.function.arguments);
    } else {
      parsed = { results: [], summary: "No results found." };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("blood-search error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
