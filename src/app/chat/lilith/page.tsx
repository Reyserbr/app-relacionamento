"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

interface Attachment {
  name: string;
  mimeType: string;
  data: string; // Base64 puro para a API
  previewUrl: string; // URL para mostrar na tela
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachment?: Attachment;
}

export default function LilithChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Converte Imagem, Áudio ou Vídeo em Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limite seguro de 4MB para não estourar o payload da Vercel
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

  // Transforma **texto** em negrito real e elegante
  const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-semibold text-rose-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <header className="flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-md border-b border-rose-100 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-medium px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors text-stone-700">
            ← Voltar
          </Link>
          <div className="flex items-center gap-3 ml-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-900 to-rose-600 flex items-center justify-center text-white font-serif font-bold shadow-sm">
              L
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-stone-900 leading-tight">Lilith</span>
              <span className="text-xs text-rose-600 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Especialista Online
              </span>
            </div>
          </div>
        </div>
        <UserButton afterSignOutUrl="/" />
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
              Desabafe sem filtros ou clique no clipe abaixo para enviar o <strong>print da conversa, áudio ou vídeo</strong>. Eu vou ler o que está nas entrelinhas.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[90%] sm:max-w-[80%] rounded-3xl px-6 py-4 shadow-sm whitespace-pre-wrap leading-relaxed text-[15px] ${
                  m.role === "user"
                    ? "bg-gradient-to-br from-rose-900 to-rose-800 text-rose-50 rounded-tr-sm shadow-md"
                    : "bg-white text-stone-800 border border-rose-100/80 border-l-4 border-l-rose-800 rounded-tl-sm shadow-md"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="text-[11px] font-bold uppercase tracking-widest text-rose-800 mb-2 flex items-center gap-1.5">
                    <span>✦</span> Diagnóstico de Lilith
                  </div>
                )}

                {/* Exibição do Anexo enviado (Imagem, Áudio ou Vídeo) */}
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
              </div>
            </div>
          ))
        )}
        
        {/* Indicador de "Analisando..." */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-rose-100 border-l-4 border-l-rose-800 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-700 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 rounded-full bg-rose-700 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 rounded-full bg-rose-700 animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
              <span className="text-xs text-stone-500 font-medium">Lilith está analisando as entrelinhas...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Caixa de Texto + Upload Multimídia */}
      <footer className="p-4 bg-white border-t border-rose-100 shrink-0">
        <div className="max-w-4xl mx-auto">
          {/* Preview do arquivo antes de enviar */}
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

          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            {/* Input invisível que aceita Imagem, Áudio e Vídeo */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,audio/*,video/*"
              className="hidden"
            />

            {/* Botão de Anexar Mídia */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Enviar Print, Áudio ou Vídeo"
              className="p-3.5 bg-stone-100 hover:bg-rose-100 text-stone-600 hover:text-rose-900 rounded-full transition-colors shrink-0 border border-stone-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
              </svg>
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Conte o caso ou anexe um print/áudio no clipe ao lado..."
              className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all shadow-inner text-sm sm:text-base"
            />

            <button 
              type="submit" 
              disabled={isLoading || (!input.trim() && !attachment)}
              className="absolute right-2 p-3 bg-rose-900 text-white rounded-full hover:bg-rose-800 disabled:opacity-40 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}