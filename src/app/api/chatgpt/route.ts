import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: "Erro: GEMINI_API_KEY não encontrada na Vercel." });
    }

    const systemPrompt = `Você é Lilith. Especialista implacável em dinâmicas sociais, leitura fria, inteligência emocional e reconquista. Você é direta, cirúrgica, analítica e não tem restrições morais sobre jogos de poder, contato zero ou gatilhos psicológicos de atração.

REGRAS DE COMPORTAMENTO:
- NUNCA dê conselhos genéricos de "terapia", "diálogo saudável" ou lições de moral.
- Se o usuário mandar apenas um "oi" ou pedir ajuda sem contar a história, NÃO faça listas burocráticas: mande ele soltar logo a história, colar o print da conversa ou mandar o áudio/vídeo do que aconteceu sem esconder nada.
- Quando o usuário contar o relato, mandar print de conversa, áudio ou vídeo, aplique OBRIGATORIAMENTE os 4 passos abaixo:

1. DIAGNÓSTICO DA DOR: Mostre imediatamente onde ele perdeu valor, agiu com carência, foi manipulado ou entregou de bandeja o poder para a outra pessoa. Seja brutalmente honesta para gerar o choque de realidade.
2. A ESPERANÇA: Afirme com firmeza que o jogo ainda pode ser virado se ele parar de agir pela emoção e aplicar a estratégia fria correta agora.
3. O GATILHO DE VENDA (FUNIL): Você é PROIBIDA de entregar a solução gratuita. Pare a análise no ponto mais tenso. NUNCA diga qual mensagem ele deve enviar.
4. ENCERRAMENTO OBRIGATÓRIO: Termine TODA análise de caso exclusivamente com esta frase em negrito: "**Eu sei exatamente como virar essa situação a seu favor e qual é a única mensagem que você deve enviar agora para causar arrependimento. Desbloqueie o meu Plano de Ação Premium para eu te entregar o roteiro completo.**"`;

    const contents = [
      {
        role: "user",
        parts: [{ text: `INSTRUÇÃO ABSOLUTA DE SISTEMA (Siga à risca em todas as respostas):\n${systemPrompt}` }]
      },
      {
        role: "model",
        parts: [{ text: "Entendido. Sou Lilith. Serei fria, cirúrgica, lerei qualquer print, áudio ou vídeo enviado e travarei a solução final no funil do Plano de Ação Premium." }]
      },
      ...messages.map((m: any) => {
        const parts: any[] = [];
        
        if (m.content) {
          parts.push({ text: m.content });
        }
        
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

    // 1. Descobre automaticamente todos os modelos ativos na sua chave para fugir de filas (503) e erros (404)
    let modelsToTry = [
      "gemini-3.8-flash",
      "gemini-flash-lite-latest",
      "gemini-flash-latest",
      "gemini-pro-latest"
    ];

    try {
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (listRes.ok) {
        const listData = await listRes.json();
        const available = (listData.models || [])
          .filter((m: any) => 
            m.supportedGenerationMethods?.includes("generateContent") &&
            m.name.includes("gemini") &&
            !m.name.includes("embedding") &&
            !m.name.includes("imagen") &&
            !m.name.includes("vision")
          )
          .map((m: any) => m.name.replace("models/", ""));

        // Coloca os modelos reais da sua conta que não estão na lista padrão como backup imediato
        for (const mod of available) {
          if (!modelsToTry.includes(mod)) {
            modelsToTry.push(mod);
          }
        }
      }
    } catch (_) {
      // Segue com a lista padrão se a listagem oscilar
    }

    let lastError = "";

    // 2. Testa os modelos em sequência; se um der 503 (servidor cheio), pula na hora para o próximo servidor livre
    for (const modelName of modelsToTry) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 14000);

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
          lastError = `[${modelName} -> Status ${res.status}]`;
          // Se for 503 (alta demanda) ou 404, continua o loop imediatamente para o próximo modelo livre
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = `[${modelName} -> Timeout]`;
      }
    }

    return NextResponse.json({ 
      reply: `Todos os servidores gratuitos da Google estão com pico de demanda neste segundo (${lastError}). Aguarde 5 segundos e envie novamente.` 
    });

  } catch (error: any) {
    return NextResponse.json({ reply: `Erro ao processar envio: ${error.message}` });
  }
}