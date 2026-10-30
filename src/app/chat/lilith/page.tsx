"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

interface Attachment {
  name: string;
  mimeType: string;
  data: string;
  previewUrl: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachment?: Attachment;
}

// COLOQUE AQUI O SEU LINK DE CHECKOUT (Asaas / Cakto) QUANDO ESTIVER PRONTO
const CHECKOUT_URL = "#checkout-premium";

export default function LilithChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Conta quantas análises a Lilith já entregou para gerar escassez
  const assistantRepliesCount = messages.filter((m) => m.role === "assistant").length;
  const FREE_LIMIT = 4; // Após 4 respostas gratuitas, trava o chat exigindo o Premium
  const isLimitReached = assistantRepliesCount >= FREE_LIMIT;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");
    
    if (action === "conselho") setInput("Preciso de um conselho. A situação é a seguinte: ");
    if (action === "analise") setInput("Analise esta conversa para mim: ");
    if (action === "responder") setInput("A pessoa me mandou isso. O que eu respondo agora para virar o jogo? ");
    
    if (action) {
      window.history.replaceState(null, "", "/chat/lilith");
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert("O arquivo é muito grande! Envie um print, áudio ou vídeo curto de até 4MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(",")[1];
      setAttachment({
        name: file.name,
        mimeType: file.type,
        data: base64Data,
        previewUrl: result,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Formata tanto **negrito** quanto *itálico* sem deixar asteriscos soltos na tela
  const formatText = (text: string) => {
    const tokens = text.split(/(\*\*.*?\*\*|\*[^*\n]+?\*)/g);
    return tokens.map((token, index) => {
      if (token.startsWith("**") && token.endsWith("**")) {
        return (
          <strong key={index} className="font-semibold text-rose-950">
            {token.slice(2, -2)}
          </strong>
        );
      }
      if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
        return (
          <em key={index} className="italic text-stone-700 font-medium">
            {token.slice(1, -1)}
          </em>
        );
      }
      return token;
    });
  };

  // Detecta se a mensagem da Lilith contém a chamada para o Plano de Ação Premium
  const hasPitchTrigger = (text: string) => {
    const lower = text.toLowerCase();
    return lower.includes("plano de ação premium") || lower.includes("roteiro completo");
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLimitReached) {
      setShowPaywallModal(true);
      return;
    }
    if ((!input.trim() && !attachment) || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim() || (attachment ? "Analise este arquivo que estou enviando." : ""),
      attachment: attachment || undefined,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setAttachment(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply || "Não consegui processar a resposta.",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Falha de conexão com o servidor. Tente enviar novamente.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#faf7f5] font-sans">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between px-6 py-3.5 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-medium px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors text-stone-700">
            ← Voltar
          </Link>
          <div className="flex items-center gap-3 ml-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-950 to-rose-700 flex items-center justify-center text-white font-serif font-bold shadow-sm">
              L
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-stone-900 leading-tight">Lilith</span>
              <span className="text-xs text-rose-700 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Especialista Online
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowPaywallModal(true)}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100 transition-colors"
          >
            <span>✨</span>
            <span>Análises Gratuitas: {Math.max(0, FREE_LIMIT - assistantRepliesCount)}/{FREE_LIMIT}</span>
          </button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Área de Mensagens */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-4xl w-full mx-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-4">
            <div className="w-20 h-20 bg-gradient-to-tr from-rose-100 to-orange-50 border border-rose-200 rounded-full flex items-center justify-center text-4xl shadow-sm mb-2">
              🔮
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-800">
              Me mostre a verdade.
            </h2>
            <p className="text-stone-500 max-w-md text-sm sm:text-base leading-relaxed">
              Desabafe sem filtros, cole o histórico do WhatsApp ou clique no clipe abaixo para enviar o <strong>print da conversa, áudio ou vídeo</strong>.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[92%] sm:max-w-[82%] rounded-3xl px-6 py-5 shadow-sm whitespace-pre-wrap leading-relaxed text-[15px] ${
                  m.role === "user"
                    ? "bg-gradient-to-br from-rose-900 to-rose-800 text-rose-50 rounded-tr-sm shadow-md"
                    : "bg-white text-stone-800 border border-rose-100/90 border-l-4 border-l-rose-900 rounded-tl-sm shadow-md"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="text-[11px] font-bold uppercase tracking-widest text-rose-800 mb-2.5 flex items-center gap-1.5">
                    <span>✦</span> Leitura de Lilith
                  </div>
                )}

                {m.attachment && (
                  <div className="mb-3 rounded-xl overflow-hidden bg-black/10 p-1">
                    {m.attachment.mimeType.startsWith("image/") && (
                      <img src={m.attachment.previewUrl} alt="Print enviado" className="max-h-72 rounded-lg object-contain mx-auto" />
                    )}
                    {m.attachment.mimeType.startsWith("audio/") && (
                      <audio controls src={m.attachment.previewUrl} className="w-full max-w-xs" />
                    )}
                    {m.attachment.mimeType.startsWith("video/") && (
                      <video controls src={m.attachment.previewUrl} className="max-h-72 rounded-lg mx-auto" />
                    )}
                  </div>
                )}

                <div>{formatText(m.content)}</div>

                {/* CARD DE CONVERSÃO AUTOMÁTICO DENTRO DO BALÃO DA LILITH */}
                {m.role === "assistant" && hasPitchTrigger(m.content) && (
                  <div className="mt-5 pt-4 border-t border-rose-100">
                    <div className="bg-gradient-to-br from-rose-950 via-rose-900 to-stone-900 text-white p-5 rounded-2xl shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] uppercase tracking-widest font-bold text-amber-300 flex items-center gap-1">
                          🔒 Conteúdo Confidencial Pronto
                        </span>
                        <span className="text-xs bg-white/10 px-2.5 py-0.5 rounded-full text-rose-100">
                          Acesso Imediato
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-base sm:text-lg text-white mb-1">
                        Plano de Ação + Mensagem Cirúrgica
                      </h4>
                      <p className="text-xs text-rose-100/90 mb-4 leading-relaxed">
                        Destrave a mensagem exata palavra por palavra para quebrar o silêncio, o guia do que postar nos Stories e os próximos 3 passos táticos.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowPaywallModal(true)}
                        className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-sm rounded-xl shadow-md transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2"
                      >
                        <span>🔓 Desbloquear Meu Plano de Ação Agora</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-rose-100 border-l-4 border-l-rose-800 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-700 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 rounded-full bg-rose-700 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 rounded-full bg-rose-700 animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
              <span className="text-xs text-stone-500 font-medium">Lilith está lendo as entrelinhas...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Caixa de Texto Inteligente (Suporta colar históricos grandes) */}
      <footer className="p-3 sm:p-4 bg-white border-t border-rose-100 shrink-0">
        <div className="max-w-4xl mx-auto">
          {attachment && (
            <div className="mb-3 flex items-center justify-between bg-rose-50 border border-rose-200 px-4 py-2 rounded-2xl text-xs text-rose-900">
              <div className="flex items-center gap-2 truncate">
                <span className="text-base">📎</span>
                <span className="font-medium truncate">{attachment.name}</span>
                <span className="text-rose-600">(Pronto para análise)</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="ml-3 text-rose-800 hover:text-rose-950 font-bold px-2 py-0.5 rounded-full hover:bg-rose-200/50"
              >
                ✕
              </button>
            </div>
          )}

          {isLimitReached ? (
            <div className="bg-rose-950 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div className="text-center sm:text-left">
                <p className="font-serif font-bold text-sm sm:text-base text-amber-300">
                  Suas análises gratuitas de diagnóstico terminaram.
                </p>
                <p className="text-xs text-rose-100">
                  Desbloqueie o acesso ilimitado à Lilith e receba seu roteiro completo de reconquista e mensagens.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPaywallModal(true)}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs sm:text-sm rounded-xl shrink-0 shadow transition-colors"
              >
                🔓 Liberar Acesso Premium
              </button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="relative flex items-end gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,audio/*,video/*"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Enviar Print, Áudio ou Vídeo"
                className="p-3.5 bg-stone-100 hover:bg-rose-100 text-stone-600 hover:text-rose-900 rounded-full transition-colors shrink-0 border border-stone-200 mb-0.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                </svg>
              </button>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={input.split("\n").length > 1 ? Math.min(4, input.split("\n").length) : 1}
                placeholder="Conte o caso, cole a conversa do WhatsApp ou anexe um print no clipe..."
                className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-3xl pl-5 pr-14 py-3.5 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all shadow-inner text-sm sm:text-base resize-none max-h-36 overflow-y-auto"
              />

              <button 
                type="submit" 
                disabled={isLoading || (!input.trim() && !attachment)}
                className="absolute right-2 bottom-1.5 p-3 bg-rose-900 text-white rounded-full hover:bg-rose-800 disabled:opacity-40 transition-colors shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </form>
          )}
        </div>
      </footer>

      {/* MODAL DE CHECKOUT (PAYWALL) QUANDO CLICA NO BOTÃO DE DESBLOQUEAR */}
      {showPaywallModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-rose-100 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowPaywallModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 font-bold"
            >
              ✕
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-900 flex items-center justify-center text-2xl mb-4">
              👑
            </div>

            <span className="text-[11px] font-bold uppercase tracking-widest text-rose-700">
              Acesso VIP • LilithLove
            </span>
            <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1 mb-2">
              Desbloqueie o Plano de Ação Completo
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed mb-5">
              Não arrisque perder tudo mandando a mensagem errada no impulso. Tenha a Lilith como sua estrategista particular 24h:
            </p>

            <ul className="space-y-3 text-sm text-stone-700 mb-6">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>A Mensagem Cirúrgica:</strong> O texto exato para copiar, colar e destravar o silêncio.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Estratégia de Stories e Presença:</strong> O que postar para provocar gatilho de perda imediato.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Análises Ilimitadas de Prints, Áudios e Vídeos:</strong> Sem limite de mensagens.</span>
              </li>
            </ul>

            <a
              href={CHECKOUT_URL}
              className="w-full py-4 px-6 bg-gradient-to-r from-rose-900 to-rose-800 hover:from-rose-800 hover:to-rose-700 text-white font-bold text-center rounded-2xl shadow-lg block transition-all"
            >
              Quero Virar Esse Jogo Agora →
            </a>
            <p className="text-[11px] text-center text-stone-400 mt-3">
              Liberação imediata após a confirmação • Sigilo absoluto
            </p>
          </div>
        </div>
      )}
    </div>
  );
}