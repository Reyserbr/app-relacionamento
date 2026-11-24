"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ExcluirContaPage() {
  const [supportEmail, setSupportEmail] = useState("suporte@lilithlove.site");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch("/api/affiliate/config")
      .then((r) => r.json())
      .then((cfg) => {
        if (typeof cfg?.supportEmail === "string" && cfg.supportEmail.trim()) {
          setSupportEmail(cfg.supportEmail.trim());
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    const subject = encodeURIComponent("Solicitação de Exclusão de Conta — LilithLove");
    const body = encodeURIComponent(
      `Olá equipe LilithLove,\n\nSolicito a exclusão definitiva da minha conta e de todos os meus dados associados.\n\nE-mail da conta: ${email.trim()}\nMotivo (opcional): ${reason.trim() || "Não informado"}\n`
    );
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-[#140a0f] text-stone-200 px-4 py-10 sm:py-14 font-sans">
      <div className="max-w-2xl mx-auto bg-[#1d0e16] border border-rose-300/15 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-rose-300/10 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-rose-400">
              Privacidade & LGPD • LilithLove
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              Exclusão de Conta e Dados
            </h1>
          </div>
          <Link
            href="/"
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-rose-500/15 text-xs font-semibold text-stone-200 border border-white/10 transition-colors shrink-0"
          >
            ← Voltar
          </Link>
        </div>

        <div className="space-y-3 text-sm text-stone-300 leading-relaxed">
          <p>
            Você pode solicitar a exclusão permanente da sua conta no aplicativo{" "}
            <strong>LilithLove</strong> (<code>com.lilithlove.app</code>) e no site{" "}
            <strong>lilithlove.site</strong>.
          </p>
          <div className="bg-rose-950/40 border border-rose-400/20 rounded-2xl p-4 space-y-1.5 text-xs">
            <p className="font-bold text-rose-200">O que será excluído definitivamente:</p>
            <ul className="list-disc pl-5 space-y-1 text-stone-300">
              <li>Sua conta de acesso (nome, e-mail e identificador de login no Clerk).</li>
              <li>Todo o histórico de consultas salvo em nuvem (Lilith, Oráculo e Reconquista).</li>
              <li>Prazo de conclusão: até <strong>7 dias úteis</strong> após a confirmação do pedido.</li>
            </ul>
          </div>
        </div>

        {submitted ? (
          <div className="bg-emerald-950/50 border border-emerald-400/30 rounded-2xl p-5 text-sm text-emerald-100 space-y-2">
            <p className="font-bold">Solicitação preparada!</p>
            <p className="text-xs leading-relaxed">
              Caso seu aplicativo de e-mail não tenha aberto automaticamente, envie uma mensagem para{" "}
              <strong className="text-white">{supportEmail}</strong> a partir do e-mail{" "}
              <strong className="text-white">{email}</strong> com o assunto{" "}
              <em>&quot;Exclusão de Conta LilithLove&quot;</em>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                E-mail cadastrado na conta *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full rounded-xl px-4 py-3 bg-[#140a0f] border border-rose-300/20 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Motivo da exclusão (opcional)
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Se desejar, conte brevemente o motivo..."
                className="w-full rounded-xl px-4 py-3 bg-[#140a0f] border border-rose-300/20 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-rose-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg transition-colors"
            >
              Solicitar Exclusão Definitiva da Conta
            </button>
          </form>
        )}

        <p className="text-[11px] text-stone-400 text-center pt-2 border-t border-rose-300/10">
          Dúvidas? Consulte nossa{" "}
          <Link href="/privacidade" className="text-rose-400 underline">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </div>
  );
}