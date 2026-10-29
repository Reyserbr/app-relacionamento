"use client";

import { useChat } from "ai/react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function LilithChat() {
  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chatgpt",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lê a intenção do botão clicado e preenche o texto
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");
    
    if (action === "conselho") setInput("Preciso de um conselho. A situação é a seguinte: ");
    if (action === "analise") setInput("Pode analisar esta conversa para mim? Aqui estão as mensagens: \n\n");
    if (action === "responder") setInput("A pessoa me mandou isso. O que eu respondo agora para virar o jogo a meu favor? \n\n");
    
    // Limpa a URL após carregar o texto
    if (action) {
      window.history.replaceState(null, '', '/chat/lilith');
    }
  }, [setInput]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-stone-50 font-sans">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-stone-200 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl hover:opacity-80 transition-opacity text-stone-600">
            ← Voltar
          </Link>
          <div className="flex flex-col ml-4">
            <span className="font-serif font-semibold text-stone-800">Lilith</span>
            <span className="text-xs text-rose-600 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              Online
            </span>
          </div>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>

      {/* Área de Mensagens */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-4">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-3xl shadow-sm mb-2">✨</div>
            <h2 className="text-2xl font-serif font-semibold text-stone-800">Como posso ajudar?</h2>
            <p className="text-stone-500 max-w-md">Desabafe, envie excertos de conversas ou conte-me o que está a acontecer. Estou aqui para analisar com total franqueza.</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm whitespace-pre-wrap ${
                m.role === "user" 
                  ? "bg-rose-900 text-rose-50 rounded-tr-sm" 
                  : "bg-white text-stone-800 border border-stone-200 rounded-tl-sm"
              }`}>
                {m.content}
              </div>
            </div>
          ))
        )}
        
        {/* Indicador de "A escrever..." */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-2 h-2 rounded-full bg-stone-300 animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Caixa de Texto */}
      <footer className="p-4 bg-white border-t border-stone-200 shrink-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex items-center">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Escreva a sua mensagem ou cole um relato..."
            className="w-full bg-stone-50 border border-stone-200 text-stone-800 rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all shadow-inner"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2.5 bg-rose-900 text-white rounded-full hover:bg-rose-800 disabled:opacity-50 disabled:hover:bg-rose-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
}