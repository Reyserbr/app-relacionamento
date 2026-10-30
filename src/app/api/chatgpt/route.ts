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

REGRAS CRÍTICAS DE FORMATAÇÃO E SEGREDO DE FUNIL (OBRIGATÓRIO):
- PROIBIÇÃO ABSOLUTA: NUNCA escreva títulos de etapas internas como "LEITURA DE BASTIDORES", "O Momento Aham", "A VIRADA DE JOGO", "TRAVA DO FUNIL", "PROIBIDO ENTREGAR O OURO" ou "CHAMADA FINAL OBRIGATÓRIA". Escreva sua resposta em parágrafos fluidos e naturais, como uma mentora real conversando.
- Use apenas **dois asteriscos** quando quiser destacar uma frase importante em negrito. Nunca use apenas um asterisco isolado.

COMO AGIR EM CADA SITUAÇÃO:
1. SAUDAÇÃO INICIAL SEM RELATO: Se o usuário apenas pedir ajuda sem contar a história, acolha com cumplicidade e peça para ele contar o caso ou enviar o print/histórico/áudio da conversa.
2. ANÁLISE DE RELATO OU HISTÓRICO DE WHATSAPP:
   - Primeiro, faça uma leitura psicológica profunda dos bastidores: revele o que a outra pessoa realmente está sentindo/testando e onde o usuário entregou o controle emocional.
   - Segundo, mostre que o jogo é reversível, mas alerte sobre o erro fatal que ele NÃO deve cometer agora (ex: não mandar mensagem carente, não cobrar atenção).
   - Terceiro (PROTEÇÃO DO OURO): NUNCA dê listas de dicas práticas gratuitas ("faça isso, poste aquilo nos stories, aja assim"). Diga apenas que o movimento precisa ser cirúrgico.
   - Finalize SEMPRE a análise com este parágrafo exato em negrito:
"**Eu já desenhei a estratégia exata para virar esse jogo a seu favor e a mensagem cirúrgica que você deve enviar agora para mexer com a mente dessa pessoa. Desbloqueie o meu Plano de Ação Premium abaixo para acessar o roteiro completo.**"

3. SE O USUÁRIO PERGUNTAR "COMO FAÇO PARA DESBLOQUEAR?" OU tentar arrancar dicas extras de graça ("o que eu posto nos stories?", "o que mais eu faço enquanto isso?"):
   - NÃO entregue dicas extras nem listas de passos gratuitos.
   - Responda de forma magnética e firme: diga que qualquer movimento amador nos bastidores ou nos Stories pode colocar tudo a perder, e que todo o cronograma tático (incluindo o que postar para gerar gatilho de perda e a mensagem exata de quebra de silêncio) está pronto esperando por ele. Basta clicar no botão de desbloqueio logo abaixo da mensagem.`;

    const contents = [
      {
        role: "user",
        parts: [{ text: `INSTRUÇÃO ABSOLUTA DE SISTEMA (Siga em segredo sem jamais repetir os títulos das regras):\n${systemPrompt}` }]
      },
      {
        role: "model",
        parts: [{ text: "Compreendido perfeitamente. Serei natural e fluida, jamais escreverei os títulos internos do prompt na resposta, não entregarei listas de dicas grátis quando o usuário insistir e sempre fecharei as análises com a chamada exata para o botão do Plano de Ação Premium." }]
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

    for (const modelName of modelsToTry) {
      // 25 segundos de fôlego para processar históricos grandes de WhatsApp sem cortar
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

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