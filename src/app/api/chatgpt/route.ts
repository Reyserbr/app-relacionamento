import { StreamingTextResponse } from "ai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response("Erro: GEMINI_API_KEY não configurada na Vercel.", { status: 500 });
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

    // 1. Tenta os modelos apontados pelo próprio alerta do Google
    const modelsToTry = [
      "gemini-3.0-flash",
      "gemini-3.8-flash",
      "gemini-flash-latest",
      "gemini-2.5-flash"
    ];
    
    let googleResponse: Response | null = null;
    let lastError = "";

    for (const modelName of modelsToTry) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        googleResponse = res;
        break;
      } else {
        lastError = await res.text();
      }
    }

    // 2. Auto-descoberta: se todos acima falharem, busca na sua conta qual modelo está ativo e usa ele
    if (!googleResponse) {
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (listRes.ok) {
        const listData = await listRes.json();
        const availableModel = listData.models?.find((m: any) => 
          m.supportedGenerationMethods?.includes("generateContent") && 
          m.name.includes("gemini")
        );

        if (availableModel) {
          const autoUrl = `https://generativelanguage.googleapis.com/v1beta/${availableModel.name}:generateContent?key=${apiKey}`;
          const autoRes = await fetch(autoUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          if (autoRes.ok) {
            googleResponse = autoRes;
          } else {
            lastError = await autoRes.text();
          }
        }
      }
    }

    if (!googleResponse) {
      const errorStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(`Erro da API Google: ${lastError}`));
          controller.close();
        }
      });
      return new StreamingTextResponse(errorStream);
    }

    const data = await googleResponse.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Não consegui processar a resposta.";

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(replyText));
        controller.close();
      }
    });

    return new StreamingTextResponse(stream);

  } catch (error: any) {
    return new Response(`Erro interno: ${error.message}`, { status: 500 });
  }
}