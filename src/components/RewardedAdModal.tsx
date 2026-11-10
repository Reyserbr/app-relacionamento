"use client";

import { useState, useEffect } from "react";
import AdBanner from "@/components/AdBanner";

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardEarned: () => void;
  checkoutUrl?: string;
  theme?: "rose" | "purple";
  badgeText?: string;
  titleText?: string;
  descriptionText?: string;
  benefits?: { title: string; desc: string }[];
  rewardLabel?: string;
}

export default function RewardedAdModal({
  isOpen,
  onClose,
  onRewardEarned,
  checkoutUrl = "/planos",
  theme = "rose",
  badgeText = "Acesso VIP • LilithLove",
  titleText = "Desbloqueie o Plano de Ação Completo",
  descriptionText = "Tenha acesso imediato à estratégia exata para virar o jogo e consultas ilimitadas:",
  benefits = [
    { title: "A Mensagem Cirúrgica:", desc: "O texto exato para copiar, colar e quebrar o silêncio." },
    { title: "Guia de Stories e Postura:", desc: "O que postar para ativar gatilho de perda." },
    { title: "Consultas Ilimitadas:", desc: "Envie quantos prints, áudios e textos quiser." },
  ],
  rewardLabel = "+3 Mensagens Grátis",
}: RewardedAdModalProps) {
  const [watchingAd, setWatchingAd] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    if (!isOpen) {
      setWatchingAd(false);
      setSecondsLeft(10);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!watchingAd) return;
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [watchingAd, secondsLeft]);

  if (!isOpen) return null;

  const isPurple = theme === "purple";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`bg-white dark:bg-[#1c0d15] border ${
          isPurple ? "border-purple-200 dark:border-purple-400/25" : "border-rose-100 dark:border-rose-400/20"
        } rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative my-auto`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 dark:bg-white/10 flex items-center justify-center text-stone-600 dark:text-stone-300 font-bold"
        >
          ✕
        </button>

        {!watchingAd ? (
          /* TELA 1: OFERTA VIP OU OPÇÃO DE VER PATROCINADOR */
          <>
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 ${
                isPurple
                  ? "bg-purple-100 dark:bg-purple-500/15 text-purple-900 dark:text-purple-300"
                  : "bg-rose-100 dark:bg-rose-500/15 text-rose-900 dark:text-rose-300"
              }`}
            >
              👑
            </div>

            <span
              className={`text-[11px] font-bold uppercase tracking-widest ${
                isPurple ? "text-purple-600 dark:text-purple-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {badgeText}
            </span>
            <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mt-1 mb-2">
              {titleText}
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-5">
              {descriptionText}
            </p>

            <ul className="space-y-2.5 text-sm text-stone-700 dark:text-stone-300 mb-6">
              {benefits.map((b, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                  <span>
                    <strong>{b.title}</strong> {b.desc}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href={checkoutUrl}
              className={`w-full py-3.5 px-6 bg-gradient-to-r text-white font-bold text-center rounded-2xl shadow-lg block transition-all mb-3 ${
                isPurple
                  ? "from-purple-900 to-indigo-700 hover:from-purple-800 hover:to-indigo-600"
                  : "from-rose-900 to-rose-700 hover:from-rose-800 hover:to-rose-600"
              }`}
            >
              Desbloquear Acesso Premium Ilimitado →
            </a>

            <button
              type="button"
              onClick={() => {
                setSecondsLeft(10);
                setWatchingAd(true);
              }}
              className="w-full py-3 px-4 bg-stone-100 dark:bg-white/5 hover:bg-stone-200 dark:hover:bg-white/10 text-stone-700 dark:text-stone-300 font-semibold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2 border border-stone-200 dark:border-white/10"
            >
              <span>📺</span>
              <span>Ver Patrocinador (10s) para liberar {rewardLabel}</span>
            </button>
          </>
        ) : (
          /* TELA 2: EXIBIÇÃO DO ANÚNCIO DE 10 SEGUNDOS PARA DESTRAVAR O BÔNUS */
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300 text-xs font-bold">
              <span>⏳</span>
              <span>
                {secondsLeft > 0
                  ? `Liberando ${rewardLabel} em ${secondsLeft}s...`
                  : `✅ Recompensa Liberada!`}
              </span>
            </div>

            <h4 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
              Apoio de Patrocinador Oficial
            </h4>

            {/* Barra de Progresso dos 10 Segundos */}
            <div className="w-full h-2 bg-stone-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-600 to-amber-500 transition-all duration-1000"
                style={{ width: `${((10 - secondsLeft) / 10) * 100}%` }}
              />
            </div>

            {/* Bloco do Anúncio (AdSense ou Banner Demonstrativo) */}
            <AdBanner forceShow={true} format="rectangle" slotId="REWARDED_MODAL_SLOT" />

            {secondsLeft > 0 ? (
              <button
                type="button"
                disabled
                className="w-full py-3.5 px-6 rounded-2xl bg-stone-200 dark:bg-white/10 text-stone-500 dark:text-stone-400 font-bold text-xs cursor-not-allowed"
              >
                Aguarde {secondsLeft} segundos para resgatar...
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onRewardEarned();
                  setWatchingAd(false);
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-all animate-pulse"
              >
                🎉 Resgatar {rewardLabel} Agora →
              </button>
            )}

            <a
              href={checkoutUrl}
              className="block text-[11px] text-stone-400 hover:text-rose-400 underline pt-1"
            >
              Não quer esperar? Mude para o VIP Ilimitado sem anúncios
            </a>
          </div>
        )}
      </div>
    </div>
  );
}