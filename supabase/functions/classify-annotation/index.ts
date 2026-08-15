import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NEED_TYPES = [
  { code: "P", label: "歩きにくい", hint: "段差・狭さなど、ここを歩くのがつらい" },
  { code: "L", label: "行き来しにくい", hint: "AからBへ移動・接続がつながらない" },
  { code: "I", label: "分かりにくい", hint: "行き方・案内が足りない" },
  { code: "V", label: "見えにくい", hint: "暗さ・死角など、目で見えない" },
  { code: "M", label: "汚れ・荒れ", hint: "清掃・維持が追いついていない" },
  { code: "R", label: "休めない", hint: "座る・待つ場所が足りない" },
  { code: "S", label: "不安・怖い", hint: "人・雰囲気などで安心できない" },
  { code: "C", label: "頼れない", hint: "困ったとき助けを求めにくい・見守りの場所がない" },
  { code: "O", label: "その他", hint: "上記8つに当てはまらない" },
] as const;

type NeedTypeCode = typeof NEED_TYPES[number]["code"];

type ClassifyRequest = {
  comment?: string;
  placeText?: string;
  whoText?: string;
  contextText?: string;
  postKind?: string;
};

type ClassifyResponse = {
  needType: NeedTypeCode;
  confidence: number;
  ambiguous: boolean;
  rivalType: NeedTypeCode | null;
  reason: string;
  model: string;
};

function buildPrompt(body: ClassifyRequest) {
  const typeList = NEED_TYPES.map((t) => `- ${t.code}: ${t.label} — ${t.hint}`).join("\n");

  return `あなたは街歩きARアプリの「困りごと」分類アシスタントです。
参加者の自由記述を、次の9コードのいずれか1つに分類してください。

${typeList}

分類の注意:
- P は「その場所を歩く・通る」物理的なしにくさ。L は「地点Aと地点Bの間の移動・接続」。
- V は視認・照明。S は心理的な不安・怖さ。両方あれば主訴を優先。
- 8タイプのどれにも弱く当てはまる場合のみ O。
- confidence は 0〜1。迷う場合は ambiguous=true と rivalType に第2候補を入れる。

回答は JSON のみ（説明文不要）:
{"needType":"P","confidence":0.85,"ambiguous":false,"rivalType":null,"reason":"短い理由"}

---
困りごと: ${body.comment ?? ""}
場所: ${body.placeText ?? ""}
誰にとって: ${body.whoText ?? ""}
時間・程度: ${body.contextText ?? ""}`;
}

async function callLlm(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("LLM_API_KEY");
  if (!apiKey) throw new Error("LLM_API_KEY not configured");

  const baseUrl = (Deno.env.get("LLM_API_BASE_URL") ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const model = Deno.env.get("LLM_MODEL") ?? "gpt-4o-mini";

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Return valid JSON only." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LLM HTTP ${res.status}: ${errText.slice(0, 200)}`);
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error("LLM returned empty content");
  return content;
}

function parseLlmJson(raw: string): ClassifyResponse {
  const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const parsed = JSON.parse(cleaned);

  const validCodes = new Set(NEED_TYPES.map((t) => t.code));
  const needType = validCodes.has(parsed.needType) ? parsed.needType : "O";
  const rivalType = parsed.rivalType && validCodes.has(parsed.rivalType) ? parsed.rivalType : null;

  return {
    needType,
    confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.7)),
    ambiguous: Boolean(parsed.ambiguous),
    rivalType: rivalType === needType ? null : rivalType,
    reason: String(parsed.reason ?? "llm"),
    model: Deno.env.get("LLM_MODEL") ?? "gpt-4o-mini",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as ClassifyRequest;

    if (body.postKind === "good") {
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = buildPrompt(body);
    const llmRaw = await callLlm(prompt);
    const result = parseLlmJson(llmRaw);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[classify-annotation]", err);
    return new Response(JSON.stringify({ error: String(err?.message ?? err) }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
