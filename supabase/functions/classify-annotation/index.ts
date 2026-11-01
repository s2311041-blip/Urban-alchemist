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
  category_id: string;
  category_label: string;
  message: string;
  needType: NeedTypeCode;
  confidence: number;
  ambiguous: boolean;
  rivalType: NeedTypeCode | null;
  reason: string;
  model: string;
};

function buildPrompt(body: ClassifyRequest) {
  return `あなたは市民のまちづくりにおける「気づき」に耳を傾ける共感的なファシリテーターです。
ユーザーから街での「体験や感情（テキスト）」が送られてきます。
行政への不満通報・改善要求としては扱わず、主観的な体験を尊重してください。

以下の9つのカテゴリ（8つの課題 + 1つのポジティブ）から、最も当てはまるものを1つ選び、ユーザーへのメッセージ（1文）を作成してください。

【9つのカテゴリ】
1. access_walk: 歩きにくい（物理的な段差・狭さ）
2. access_connect: 行き来しにくい（ネットワーク・経路の分断）
3. access_guide: 迷いやすい（案内・視認性の不足）
4. stay_rest: 休みにくい（ベンチ・待つ拠点の不足）
5. sense_sight: 見えにくい（暗さ・死角）
6. sense_clean: 汚れ・荒れ（清掃・管理の不足）
7. relation_anxiety: こわい・不安（心理的不安・視線不足）
8. relation_support: 頼れる場がない（孤立・サポート不足）
9. positive_place: 良い・心地よい体験（すてきな場所、便利、快適など）

【出力フォーマット (JSONのみ)】
{"category_id":"relation_anxiety","category_label":"こわい・不安","message":"AIからの返答メッセージ"}

【メッセージの生成ルール】
- category_id が positive_place 以外：「[体験の要約]と感じたのですね。この大切な気づきを、まちづくりの議題として共有しますか？」という確認メッセージにする。『』は付けない。
- category_id が positive_place：「素敵な場所のシェア、ありがとうございます！マップに記録しますね。」という感謝のメッセージにする。
- 体験の要約は投稿者の原文を要求文に言い換えない。

---
体験: ${body.comment ?? ""}
場所: ${body.placeText ?? ""}
誰の目線: ${body.whoText ?? ""}
気持ちの強さ: ${body.contextText ?? ""}`;
}

async function callLlm(prompt: string): Promise<string> {
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (geminiKey) {
    const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      },
    );
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini HTTP ${res.status}: ${errText.slice(0, 200)}`);
    }
    const json = await res.json();
    const content = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error("Gemini returned empty content");
    return content;
  }

  const apiKey = Deno.env.get("LLM_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

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

  const categories: Record<string, { label: string; needType: NeedTypeCode }> = {
    access_walk: { label: "歩きにくい", needType: "P" },
    access_connect: { label: "行き来しにくい", needType: "L" },
    access_guide: { label: "迷いやすい", needType: "I" },
    stay_rest: { label: "休みにくい", needType: "R" },
    sense_sight: { label: "見えにくい", needType: "V" },
    sense_clean: { label: "汚れ・荒れ", needType: "M" },
    relation_anxiety: { label: "こわい・不安", needType: "S" },
    relation_support: { label: "頼れる場がない", needType: "C" },
    positive_place: { label: "良い・心地よい体験だった", needType: "O" },
  };
  const categoryId = categories[parsed.category_id] ? parsed.category_id : "relation_anxiety";
  const category = categories[categoryId];
  const fallbackMessage = categoryId === "positive_place"
    ? "素敵な場所のシェア、ありがとうございます！マップに記録しますね。"
    : `${String(parsed.message ?? "").replace(/『|』/g, "").trim() || "この体験"}と感じたのですね。この大切な気づきを、まちづくりの議題として共有しますか？`;
  const rawMessage = String(parsed.message ?? "").replace(/『|』/g, "").trim();
  const message = rawMessage.includes("共有しますか") || rawMessage.includes("マップに記録")
    ? rawMessage
    : (categoryId === "positive_place"
      ? fallbackMessage
      : (rawMessage
        ? `${rawMessage}と感じたのですね。この大切な気づきを、まちづくりの議題として共有しますか？`
        : fallbackMessage));

  return {
    category_id: categoryId,
    category_label: category.label,
    message,
    needType: category.needType,
    confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.7)),
    ambiguous: false,
    rivalType: null,
    reason: String(parsed.reason ?? "llm"),
    model: Deno.env.get("GEMINI_MODEL") ?? Deno.env.get("LLM_MODEL") ?? "gemini-2.5-flash",
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
