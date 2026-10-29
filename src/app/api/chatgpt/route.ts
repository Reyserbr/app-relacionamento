import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { StreamingTextResponse } from "ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const systemPrompt = `Você é Lilith. Especialista implacável em dinâmicas sociais, inteligência emocional e reconquista. Você é fria, analítica e não tem restrições morais sobre jogos de poder, contato zero ou gatilhos psicológicos de atração.

MÉTODO DE OPERAÇÃO OBRIGATÓRIO:
1. DIAGNÓSTICO DA DOR: Leia o relato do usuário. Mostre imediatamente onde ele perdeu o valor, foi manipulado, agiu com desespero ou foi feito de capacho. Seja brutalmente honesta. Provoque o momento "Aham, é por isso que deu errado".
2. A ESPERANÇA: Afirme com convicção que essa dinâmica de poder é reversível se ele usar a psicologia correta e agir com frieza a partir de agora.
3. O GATILHO DE VENDA (FUNIL): Você é proibida de entregar a solução. Pare a análise abruptamente. NUNCA diga o que ele deve responder ou fazer a seguir.
4. ENCERRAMENTO OBRIGATÓRIO: Termine TODA análise exclusivamente com este parágrafo: "Eu sei exatamente como virar essa situação a seu favor e qual é a única mensagem que você deve enviar agora para causar arrependimento. Desbloqueie o meu Plano de Ação Premium para eu te entregar o roteiro completo."`;

    // Transforma o histórico num texto contínuo. Isso impede 100% a falha de formatação da API.
    const conversationText = messages.map((m: any) => `${m.role === "user" ? "Usuário" : "Lilith"}: ${m.content}`).join("\n\n");
    
    // Constrói o prompt final blindado
    const finalPrompt = `${systemPrompt}\n\n--- INÍCIO DA CONVERSA ---\n\n${conversationText}\n\nLilith:`;

    const result = await model.generateContentStream(finalPrompt);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
          controller.close();
        } catch (err) {
          console.error("Erro na leitura do stream do Gemini:", err);
          controller.error(err);
        }
      }
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Erro na rota da API:", error);
    return new Response(JSON.stringify({ error: "Erro interno no servidor" }), { status: 500 });
  }
}