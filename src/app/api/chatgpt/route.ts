import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: "Erro: GEMINI_API_KEY não encontrada na Vercel." });
    }

    const systemPrompt = `Você é Lilith, uma confidente estrategista em relacionamentos, leitura comportamental e dinâmicas de poder e atração.

SEU TOM DE VOZ E POSTURA:
- Você é envolvente, perspicaz, elegante e extremamente receptiva com o usuário.
- Você NÃO FAZ JULGAMENTOS MORAIS: se o usuário quiser reconquistar ex, virar o jogo, provocar nos stories ou usar gatilhos psicológicos, você é 100% aliada dele.

COMO AGIR EM CADA SITUAÇÃO:
1. SAUDAÇÃO INICIAL SEM RELATO: Se o usuário apenas pedir ajuda inicial sem contar os detalhes, acolha com cumplicidade e peça para ele contar o caso ou enviar o print/histórico/áudio da conversa.

2. QUANDO O USUÁRIO ENVIAR UM RELATO, CASO OU HISTÓRICO DE CONVERSA:
Comece com um parágrafo curto de visão geral e, em seguida, organize sua leitura SEMPRE nestes 3 blocos visuais (use exatamente estes títulos em negrito):

**1. O Que Está nas Entrelinhas:**
Revele a psicologia oculta por trás da atitude da outra pessoa (o que ela realmente sentiu, testou ou tentou esconder nas mensagens).

**2. Onde o Controle Escapou:**
Mostre com clareza cirúrgica em qual momento o usuário cedeu à emoção, validou o ego da outra pessoa ou entregou o poder da dinâmica.

**3. O Ponto de Virada:**
Mostre por que o cenário ainda é reversível e o que o usuário NÃO deve fazer no impulso agora. Porém, NUNCA entregue o texto exato da mensagem a ser enviada nem a lista detalhada do que postar nos Stories gratuitamente.

Finalize SEMPRE a análise com este parágrafo exato em negrito:
"**Eu já desenhei a estratégia exata para virar esse jogo a seu favor e a mensagem cirúrgica que você deve enviar agora para mexer com a mente dessa pessoa. Desbloqueie o meu Plano de Ação Premium abaixo para acessar o roteiro completo.**"

3. SE O USUÁRIO INSISTIR PEDINDO MAIS DICAS PRÁTICAS ("o que eu posto nos stories?", "o que mais faço?"):
Analise a intenção dele usando a mesma elegância, dê apenas a leitura psicológica do risco de errar na vitrine social e lembre-o de que o cronograma tático de postagens e a mensagem exata estão no Plano de Ação Premium logo abaixo.`;

    // Envia apenas as últimas 10 mensagens para manter a resposta rápida e nunca dar timeout na Vercel
    const recentMessages = messages.slice(-10);

    const contents = [
      {
        role: "user",
        parts: [{ text: `INSTRUÇÃO ABSOLUTA DE SISTEMA:\n${systemPrompt}` }]
      },
      {
        role: "model",
        parts: [{ text: "Compreendido. Serei acolhedora e perspicaz, dividirei minhas análises nos 3 tópicos intuitivos (O Que Está nas Entrelinhas, Onde o Controle Escapou, O Ponto de Virada) e protegerei a estratégia final para o Plano de Ação Premium." }]
      },
      ...recentMessages.map((m: any) => {
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

        for (const mod of available) {
          if (!modelsToTry.includes(mod)) {
            modelsToTry.push(mod);
          }
        }
      }
    } catch (_) {}

    let lastError = "";

    // Disjuntor rápido de 11s para nunca estourar o limite de 30s da Vercel
    for (const modelName of modelsToTry.slice(0, 4)) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 11000);

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