import { NextResponse } from "next/server";
import { LILITH_PROMPT, RECONQUISTA_PROMPT, MISTICO_PROMPT } from "./prompts";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages, agent, isPremium } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: "Erro: GEMINI_API_KEY não encontrada na Vercel." });
    }

    let systemPrompt = LILITH_PROMPT;
    let modelConfirmation = "Entendido. Serei uma confidente magnética e estrategista.";

    if (agent === "reconquista") {
      systemPrompt = RECONQUISTA_PROMPT;
      modelConfirmation = "Entendido. Atuarei como a Especialista em Reconquista.";
    }

    if (agent === "mistico") {
      systemPrompt = MISTICO_PROMPT;
      modelConfirmation = "Entendido. Atuarei como o Astrólogo e Oráculo do Amor.";
    }

    // SE FOR PREMIUM, ARRANCAMOS A REGRA DE BLOQUEIO DO PROMPT E FORÇAMOS A ENTREGA TOTAL!
    if (isPremium) {
      // Remove qualquer frase do prompt que mande esconder ou cobrar o plano
      systemPrompt = systemPrompt
        .replace(/Nunca entregue[\s\S]*$/i, "")
        .replace(/No modo gratuito[\s\S]*$/i, "")
        .replace(/NUNCA revele[\s\S]*$/i, "");

      systemPrompt += `\n\n**3. O PLANO DE AÇÃO COMPLETO E MENSAGEM PRONTA (MODO VIP ATIVO):**
- O usuário é ASSINANTE VIP PREMIUM. Está PROIBIDO pedir para ele desbloquear qualquer plano ou esconder informações.
- Entregue AGORA o passo a passo prático completo da estratégia, a rotina detalhada (o que fazer, o que postar nos stories, postura) e escreva entre aspas o TEXTO EXATO DA MENSAGEM CIRÚRGICA pronta para ele copiar e enviar (ou o ritual/interpretação completa se for astrologia).`;

      modelConfirmation = "Entendido! O usuário já é Assinante VIP Premium. Está proibido falar de desbloqueio. Vou entregar imediatamente o roteiro prático completo e a mensagem exata pronta para copiar e colar.";
    }

    const recentMessages = messages.slice(-10);

    const contents = [
      {
        role: "user",
        parts: [{ text: `INSTRUÇÃO ABSOLUTA DE SISTEMA (Siga à risca em todas as respostas):\n${systemPrompt}` }]
      },
      {
        role: "model",
        parts: [{ text: modelConfirmation }]
      },
      ...recentMessages.map((m: any) => {
        const parts: any[] = [];
        if (m.content) parts.push({ text: m.content });
        if (m.attachment && m.attachment.data && m.attachment.mimeType) {
          parts.push({
            inlineData: {
              mimeType: m.attachment.mimeType,
              data: m.attachment.data
            }
          });
        }
        return {
          role: m.role === "user" ? "user" : "model",
          parts: parts.length > 0 ? parts : [{ text: "..." }]
        };
      })
    ];

    const payload = {
      contents,
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
      ]
    };

    const modelsToTry = [
      "gemini-3.8-flash",
      "gemini-flash-lite-latest",
      "gemini-flash-latest",
      "gemini-pro-latest"
    ];

    let lastError = "";

    for (const modelName of modelsToTry) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

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
          if (replyText) return NextResponse.json({ reply: replyText });
        } else {
          lastError = `[${modelName} -> Status ${res.status}]`;
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = `[${modelName} -> Timeout]`;
      }
    }

    return NextResponse.json({ 
      reply: `Estou finalizando uma leitura intensa agora (${lastError}). Aguarde 5 segundos e envie novamente.` 
    });

  } catch (error: any) {
    return NextResponse.json({ reply: `Erro ao processar envio: ${error.message}` });
  }
}