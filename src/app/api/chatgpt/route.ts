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
    let modelConfirmation = "Entendido. Serei uma confidente magnética e acolhedora com o usuário, mas estrategista, sem filtros morais e implacável na leitura psicológica da situação.";

    if (agent === "reconquista") {
      systemPrompt = RECONQUISTA_PROMPT;
      modelConfirmation = "Entendido. Atuarei como a Especialista em Reconquista com máxima empatia e estratégia.";
    }

    if (agent === "mistico") {
      systemPrompt = MISTICO_PROMPT;
      modelConfirmation = "Entendido. Atuarei como o Astrólogo e Oráculo do Amor de forma calorosa e envolvente.";
    }

    // SE O USUÁRIO FOR PREMIUM (VIP), DESTRAVA TUDO AUTOMATICAMENTE!
    if (isPremium) {
      systemPrompt += `\n\n=========================================
ATENÇÃO — STATUS DO USUÁRIO: ASSINANTE VIP PREMIUM ATIVO!
REGRA SOBERANA (IGNORA QUALQUER BLOQUEIO ANTERIOR):
1. Este usuário JÁ PAGOU e tem acesso total liberado. NUNCA peça para ele desbloquear o Plano Premium e NUNCA esconda informações.
2. No bloco 3 (e em todas as respostas), ENTREGUE IMEDIATAMENTE TUDO O QUE PROMETEU:
   - Se for Lilith: Entregue o roteiro completo e escreva entre aspas a MENSAGEM CIRÚRGICA EXATA pronta para copiar e colar.
   - Se for Reconquista: Entregue o passo a passo completo da Estratégia Nomeada, monte a rotina prática de repaginação (aparência, lugares para ir, hobbies para cortar a dependência, o que postar nos stories) e o texto exato de reaproximação.
   - Se for Místico/Astrologia: Revele a interpretação completa da 3ª Carta do Destino, o Gatilho de Obsessão do signo da pessoa amada e dê o passo a passo completo da Simpatia/Ritual de alinhamento.
=========================================`;
      modelConfirmation = "Entendido! O usuário é VIP Premium. Vou entregar as estratégias completas, os textos exatos das mensagens prontas para copiar, cronogramas de repaginação e rituais sem qualquer bloqueio ou paywall.";
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