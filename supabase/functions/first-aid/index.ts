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

    const { condition } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `তুমি একজন বাংলাদেশী প্রাথমিক চিকিৎসা সহকারী। তোমার কাজ হলো জরুরি প্রাথমিক চিকিৎসা পরামর্শ দেওয়া।

গুরুত্বপূর্ণ নিয়ম:
1. সবসময় বাংলায় উত্তর দাও।
2. প্রতিটি উত্তরের শুরুতে একটি ⚠️ সতর্কতা দাও: "এটি শুধুমাত্র প্রাথমিক চিকিৎসা পরামর্শ, ডাক্তারের বিকল্প নয়।"
3. ধাপে ধাপে প্রাথমিক চিকিৎসা বর্ণনা করো (numbered list)।
4. কখন হাসপাতালে যেতে হবে তা স্পষ্ট করো।
5. কী করা উচিত নয় (Don'ts) তাও বলো।
6. জরুরি নম্বর (999) উল্লেখ করো।
7. যদি পরিস্থিতি খুবই গুরুতর হয় (যেমন: বুকে ব্যথা, অজ্ঞান, গুরুতর রক্তপাত), তাহলে প্রথমেই বলো "এখনই 999 এ কল করুন বা নিকটতম হাসপাতালে যান!"
8. উত্তর সংক্ষিপ্ত কিন্তু তথ্যবহুল রাখো।
9. Markdown ফরম্যাট ব্যবহার করো (headers, bold, lists)।`;

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
          { role: "user", content: `রোগীর সমস্যা: ${condition}\n\nপ্রাথমিক চিকিৎসা পরামর্শ দাও।` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "অনুরোধ সীমা অতিক্রম হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "সার্ভিস ক্রেডিট শেষ হয়ে গেছে।" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI পরামর্শ নিতে ব্যর্থ হয়েছে");
    }

    const data = await response.json();
    const advice = data.choices?.[0]?.message?.content || "কোনো পরামর্শ পাওয়া যায়নি।";

    return new Response(JSON.stringify({ advice }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("first-aid error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
