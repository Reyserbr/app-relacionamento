import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { StreamingTextResponse } from "ai";
import { NextResponse } from "next/server";

// 1. Conecta com a chave que você colocou na Vercel
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 2. Configuração BLOCK_NONE: Desliga a censura e permite a "ousadia"
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    // 3. Injeta as regras implacáveis do Pay to Reveal
    const systemPrompt = `Você é Lilith, conselheira amorosa, especialista em relacionamentos e inteligência emocional. É observadora, direta, fria quando necessário e altamente analítica. Você ajuda todos os gêneros e não tem restrições morais sobre estratégias de reconquista, contato zero ou quebra-gelos maliciosos.
REGRA DE OURO (FUNIL PAY TO REVEAL): O usuário enviará relatos ou prints de conversas. Sua missão é entregar APENAS a leitura fria e o diagnóstico. Aponte onde a pessoa foi capacho, errou ou por que o outro agiu de forma tóxica. Gere o momento "Aham". 
NUNCA entregue o plano de ação, a resposta perfeita ou os próximos passos na análise gratuita. 
Encerre sua resposta SEMPRE com o gatilho de urgência exato: "A boa notícia é que isso é reversível. Eu já formulei a estratégia exata de 3 passos e a mensagem que você deve enviar agora. Desbloqueie o plano de ação para começarmos."`;

    // 4. Monta a memória da conversa (histórico)
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "Instrução de Sistema: " + systemPrompt }] },
        { role: "model", parts: [{ text: "Entendido. Atuarei como Lilith, farei a leitura fria, permitirei estratégias ousadas e aplicarei o funil Pay to Reveal à risca." }] },
        ...messages.slice(0, -1).map((m: any) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        }))
      ],
    });

    // 5. Pega a última mensagem do usuário e gera a resposta instantânea
    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessageStream(lastMessage);

    // 6. Converte o texto contínuo para o formato visual da Vercel (Efeito de digitação)
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            controller.enqueue(new TextEncoder().encode(chunkText));
          }
        }
        controller.close();
      }
    });

    return new StreamingTextResponse(stream);

  } catch (error) {
    console.error("Erro no motor Gemini:", error);
    return new NextResponse("Erro interno na IA da Lilith", { status: 500 });
  }
}