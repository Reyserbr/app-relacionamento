import { NextResponse } from "next/server";
import { LILITH_PROMPT, RECONQUISTA_PROMPT, MISTICO_PROMPT } from "./prompts";

export const runtime = "edge";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: Request) {
  try {
    const { messages, agent, isPremium } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        reply: "Erro: GEMINI_API_KEY não encontrada nas variáveis de ambiente da Vercel.",
      });
    }

    let systemPrompt = LILITH_PROMPT;

    if (agent === "reconquista") {
      systemPrompt = RECONQUISTA_PROMPT;
    } else if (agent === "mistico") {
      systemPrompt = MISTICO_PROMPT;
    }

    // REGRA VIP PREMIUM VS MODO GRATUITO
    if (isPremium) {
      systemPrompt = systemPrompt
        .replace(/Nunca entregue[\s\S]*$/i, "")
        .replace(/No modo gratuito[\s\S]*$/i, "")
        .replace(/NUNCA revele[\s\S]*$/i, "");

      systemPrompt += `\n\n**3. O PLANO DE AÇÃO COMPLETO E MENSAGEM PRONTA (MODO VIP ATIVO):**
- O usuário é ASSINANTE VIP PREMIUM. Está PROIBIDO pedir para ele desbloquear qualquer plano ou esconder informações.
- Entregue AGORA o passo a passo prático completo da estratégia, a rotina detalhada (o que fazer, o que postar nos stories, postura) e escreva entre aspas o TEXTO EXATO DA MENSAGEM CIRÚRGICA pronta para ele copiar e enviar (ou o ritual/interpretação completa se for astrologia).`;
    } else {
      systemPrompt += `\n\n[REGRA ABSOLUTA DE SEGURANÇA COMERCIAL — USUÁRIO NO MODO GRATUITO / ANÚNCIOS]:
Mesmo que o usuário envie novas mensagens desbloqueadas por anúncios, insista ou peça diretamente a mensagem pronta:
1. Continue entregando ANÁLISES PSICOLÓGICAS, LEITURAS DE SUBTEXTO E DIAGNÓSTICOS profundos sobre o comportamento da outra pessoa (analise cada detalhe da conversa enviada).
2. Porém, é ESTRITAMENTE PROIBIDO entregar gratuitamente o texto exato da mensagem pronta para enviar, o passo a passo prático completo da estratégia de reconquista, o cronograma de ação ou o ritual/3ª carta final.
3. Sempre encerre lembrando que a análise do comportamento foi atualizada, mas a mensagem cirúrgica exata e o protocolo prático completo são exclusivos do Acesso VIP Premium.`;
    }

    // Filtra mensagens de erro antigas para não sujar o histórico enviado à IA
    const validHistory = (Array.isArray(messages) ? messages : []).filter(
      (m: any) =>
        m &&
        typeof m.content === "string" &&
        !m.content.includes("Estou finalizando uma leitura intensa agora") &&
        !m.content.includes("Oscilação momentânea na rede")
    );

    const recentMessages = validHistory.slice(-12);

    // Converte e AGRUPA mensagens consecutivas do mesmo "role" (evita erro 400 na API do Gemini)
    const contents: { role: "user" | "model"; parts: any[] }[] = [];

    for (const m of recentMessages) {
      const role: "user" | "model" = m.role === "user" ? "user" : "model";
      const parts: any[] = [];

      if (m.content && m.content.trim()) {
        parts.push({ text: m.content.trim() });
      }
      if (m.attachment && m.attachment.data && m.attachment.mimeType) {
        parts.push({
          inlineData: {
            mimeType: m.attachment.mimeType,
            data: m.attachment.data,
          },
        });
      }

      if (parts.length === 0) {
        parts.push({ text: "..." });
      }

      const lastEntry = contents[contents.length - 1];
      if (lastEntry && lastEntry.role === role) {
        // Se houver duas mensagens seguidas do usuário (ex: Bloco 1 + Bloco 2), junta na mesma!
        lastEntry.parts.push(...parts);
      } else {
        contents.push({ role, parts });
      }
    }

    // Garante que a primeira mensagem do histórico seja sempre do "user"
    if (contents.length > 0 && contents[0].role === "model") {
      contents.shift();
    }

    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ],
    };

    // Lista oficial de modelos Gemini com alta cota de mensagens e suporte a textos grandes
    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash",
      "gemini-flash-latest",
    ];

    let lastError = "";

    for (let i = 0; i < modelsToTry.length; i++) {
      const modelName = modelsToTry[i];
      const controller = new AbortController();
      // 20 segundos de margem para textos grandes e prints pesarem sem dar timeout
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return NextResponse.json({ reply: replyText });
          }
        } else {
          lastError = `[${modelName} -> Status ${res.status}]`;
          // Se bateu limite de velocidade (429), respira 800ms antes de tentar o próximo modelo da fila
          if (res.status === 429 && i < modelsToTry.length - 1) {
            await sleep(800);
          }
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = `[${modelName} -> Timeout]`;
      }
    }

    return NextResponse.json({
      reply: `Estou finalizando uma leitura intensa agora (${lastError}). Aguarde 5 segundos e clique em Reenviar.`,
    });
  } catch (error: any) {
    return NextResponse.json({
      reply: `Erro ao processar envio: ${error.message}`,
    });
  }
}