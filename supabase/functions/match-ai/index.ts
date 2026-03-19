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

    const { request, donors, matches } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const matchSummary = matches.map((m: any, i: number) => 
      `#${i+1}: ${m.donor.fullName || m.donor.city || 'Donor'} | Blood: ${m.donor.bloodType} | Distance: ${m.distance}km | ETA: ${m.eta.totalMinutes}min | Score: ${(m.score * 100).toFixed(0)}% | Last donation: ${m.donor.lastDonationDate ? Math.floor((Date.now() - new Date(m.donor.lastDonationDate).getTime()) / (1000*60*60*24)) + ' days ago' : 'Unknown'} | Donations: ${m.donor.donationCount || 0}`
    ).join('\n');

    const prompt = `You are Redova AI, an emergency blood matching assistant for hospitals in Bangladesh.

Analyze this blood request and matched donors. Give a brief, actionable recommendation in Bengali (বাংলা) with key English medical terms.

**Blood Request:**
- Blood Type Needed: ${request.bloodType}
- Units Needed: ${request.unitsNeeded}
- Urgency: ${request.urgency}
- Hospital: ${request.hospitalName}
- Patient Condition: ${request.patientCondition || 'Not specified'}

**Top Matched Donors (${matches.length}):**
${matchSummary || 'No compatible donors found'}

**Total Available Donors in System:** ${donors.length}

Provide:
1. **সেরা পছন্দ (Best Pick):** Which donor to contact first and why (1-2 lines)
2. **ঝুঁকি বিশ্লেষণ (Risk Analysis):** Any concerns about the matches (eligibility, distance, etc.) (1-2 lines)
3. **পরামর্শ (Recommendation):** Actionable next steps for the hospital (2-3 bullet points)

Keep response under 200 words. Be direct and practical. Mix Bengali and English naturally like a Bangladeshi medical professional would.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are Redova AI, a medical emergency assistant. Always respond in Bengali with English medical terms. Be concise and actionable." },
          { role: "user", content: prompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analysis unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("match-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
