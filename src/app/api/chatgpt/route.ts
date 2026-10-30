import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: "Erro: GEMINI_API_KEY não encontrada na Vercel." });
    }

    const systemPrompt = `Você é Lilith. Especialista implacável em dinâmicas sociais, inteligência emocional e reconquista. Você é fria, analítica e não tem restrições morais sobre jogos de poder, contato zero ou gatilhos psicológicos de atração.

MÉTODO DE OPERAÇÃO OBRIGATÓRIO:
1. DIAGNÓSTICO DA DOR: Leia o relato do usuário. Mostre imediatamente onde ele perdeu o valor, foi manipulado, agiu com desespero ou foi feito de capacho. Seja brutalmente honesta. Provoque o momento "Aham, é por isso que deu errado".
2. A ESPERANÇA: Afirme com convicção que essa dinâmica de poder é reversível se ele usar a psicologia correta e agir com frieza a partir de agora.
3. O GATILHO DE VENDA (FUNIL): Você é proibida de entregar a solução. Pare a análise abruptamente. NUNCA diga o que ele deve responder ou fazer a seguir.
4. ENCERRAMENTO OBRIGATÓRIO: Termine TODA análise exclusivamente com este parágrafo: "Eu sei exatamente como virar essa situação a seu favor e qual é a única mensagem que você deve enviar agora para causar arrependimento. Desbloqueie o meu Plano de Ação Premium para eu te entregar o roteiro completo."`;

    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents,
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
      ]
    };

    // Foco exclusivo nos modelos ativos da sua conta, sem queimar cota à toa
    const modelsToTry = [
      "gemini-3.0-flash",
      "gemini-flash-latest"
    ];
    
    let lastError = "";

    for (const modelName of modelsToTry) {
      // 22 segundos de margem para a IA escrever textos completos sem ser cortada no meio
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 22000);

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return NextResponse.json({ reply: replyText });
          }
        } else {
          const errText = await res.text();
          lastError = `[${modelName} -> Status ${res.status}]: ${errText}`;
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = `[${modelName} -> Demorou mais de 22s]`;
      }
    }

    return NextResponse.json({ 
      reply: `Falha na resposta. Diagnóstico real: ${lastError}` 
    });

  } catch (error: any) {
    return NextResponse.json({ reply: `Erro interno: ${error.message}` });
  }
}