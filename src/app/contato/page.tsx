"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function ContatoPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [assunto, setAssunto] = useState("Dúvida sobre Assinatura VIP");
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !mensagem.trim()) return;
    setEnviado(true);
    setNome("");
    setEmail("");
    setMensagem("");
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#faf7f5] text-stone-800 dark:bg-[#140a0f] dark:text-stone-200 font-sans">
      <Navbar />

      <div className="max-w-3xl w-full mx-auto px-5 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 block mb-2">
            Atendimento & Suporte Oficial
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-white mb-3">
            Fale Conosco
          </h1>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-xl mx-auto">
            Precisa de ajuda com sua assinatura Premium, parceria de afiliados ou dúvidas sobre a plataforma? Envie sua mensagem abaixo.
          </p>
        </div>

        <div className="bg-white dark:bg-[#1c1016] rounded-3xl border border-stone-200/80 dark:border-rose-400/20 p-6 sm:p-8 shadow-md">
          {enviado ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto text-2xl">
                ✓
              </div>
              <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
                Mensagem Recebida com Sucesso!
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 max-w-md mx-auto">
                Nossa equipe de suporte analisará sua solicitação e responderá no e-mail informado em até 24 horas úteis.
              </p>
              <button
                type="button"
                onClick={() => setEnviado(false)}
                className="px-5 py-2.5 rounded-xl bg-rose-900 text-white text-xs font-bold"
              >
                Enviar outra mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">
                    Seu Nome
                  </label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Digite seu nome..."
                    className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">
                    E-mail da sua conta
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">
                  Assunto
                </label>
                <select
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-800 dark:text-stone-100"
                >
                  <option value="Dúvida sobre Assinatura VIP">Dúvida sobre Assinatura VIP / Pagamento</option>
                  <option value="Programa de Afiliados">Programa de Afiliados</option>
                  <option value="Suporte Técnico">Suporte Técnico</option>
                  <option value="Privacidade e Exclusão de Dados">Privacidade e Exclusão de Dados (LGPD)</option>
                  <option value="Outros">Outros Assuntos</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">
                  Mensagem
                </label>
                <textarea
                  rows={4}
                  required
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Descreva como podemos ajudar você..."
                  className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-900 to-rose-700 hover:from-rose-800 hover:to-rose-600 text-white font-bold shadow-lg transition-all"
              >
                Enviar Mensagem ao Suporte →
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 text-center text-xs text-stone-500 dark:text-stone-400 space-y-2">
          <p>E-mail direto de suporte: <strong>suporte@lilithlove.site</strong></p>
          <div className="flex justify-center gap-4 pt-2 font-semibold text-rose-700 dark:text-rose-400">
            <Link href="/" className="hover:underline">Início</Link>
            <span>•</span>
            <Link href="/termos" className="hover:underline">Termos de Uso</Link>
            <span>•</span>
            <Link href="/privacidade" className="hover:underline">Política de Privacidade</Link>
          </div>
        </div>
      </div>
    </main>
  );
}