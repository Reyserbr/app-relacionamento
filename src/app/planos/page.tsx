"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

interface PlanItem {
  id: string;
  name: string;
  badge: string;
  price: string;
  period: string;
  checkoutUrl: string;
  benefits: string[];
  buttonText: string;
}

const FALLBACK_PLANS: PlanItem[] = [
  {
    id: "default",
    name: "Premium",
    badge: "MAIS POPULAR",
    price: "R$ 69,90",
    period: "/mês",
    checkoutUrl: "https://pay.cakto.com.br/6nbag79",
    benefits: [
      "Conversas ilimitadas com a Lilith",
      "Análise de conversas e detecção de red flags",
      "Módulo de Reconquista e reversão de crise",
      "Estratégias guiadas por IA, passo a passo",
      "Acesso a todas as ferramentas e trilhas",
      "Suporte prioritário",
    ],
    buttonText: "Desbloquear Acesso Premium Ilimitado",
  },
];

export default function PlanosPage() {
  const [plans, setPlans] = useState<PlanItem[]>(FALLBACK_PLANS);

  useEffect(() => {
    fetch("/api/affiliate/config")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.plans) && d.plans.length > 0) {
          setPlans(d.plans);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center bg-stone-50 text-stone-800 dark:bg-[#140a0f] dark:text-stone-200 font-sans selection:bg-rose-200 transition-colors">
      <Navbar />

      <div className="w-full max-w-5xl px-5 sm:px-6 py-12 sm:py-16 mx-auto flex flex-col items-center">
        <div className="text-center max-w-2xl mb-10 sm:mb-12">
          <span className="text-rose-600 dark:text-rose-400 font-semibold tracking-wider uppercase text-xs sm:text-sm mb-3 sm:mb-4 block">
            Exclusivo Assinantes
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-stone-900 dark:text-white mb-4 sm:mb-5">
            Desbloqueie tudo da LilithLove
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-300">
            Acesso total às ferramentas de inteligência emocional. Cancele quando quiser.
          </p>
        </div>

        {/* Grade dinâmica: se tiver 1 plano fica centralizado; se tiver 2+, fica lado a lado */}
        <div
          className={`w-full grid gap-6 justify-center ${
            plans.length === 1
              ? "grid-cols-1 max-w-md"
              : plans.length === 2
              ? "grid-cols-1 md:grid-cols-2 max-w-3xl"
              : "grid-cols-1 md:grid-cols-3 max-w-5xl"
          }`}
        >
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="w-full bg-white dark:bg-[#1c1016] rounded-3xl shadow-md dark:shadow-black/40 border border-rose-100 dark:border-rose-400/20 p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                {plan.badge && (
                  <div className="absolute top-5 right-5 sm:top-6 sm:right-6 bg-rose-900 dark:bg-rose-600 text-rose-50 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                    {plan.badge}
                  </div>
                )}

                <h2 className="text-xl font-semibold text-stone-800 dark:text-white mb-2 pr-24">
                  {plan.name}
                </h2>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl sm:text-5xl font-serif font-bold text-stone-900 dark:text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-stone-500 dark:text-stone-400 mb-2">
                      {plan.period}
                    </span>
                  )}
                </div>

                <ul className="flex flex-col gap-3 mb-8">
                  {(plan.benefits || []).map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-stone-700 dark:text-stone-300"
                    >
                      <svg
                        className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <a
                  href={`/api/checkout?planId=${encodeURIComponent(plan.id)}`}
                  className="w-full py-4 px-6 bg-rose-700 hover:bg-rose-600 dark:bg-[#c81e45] dark:hover:bg-[#db2750] text-white font-bold text-center rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <span>✦</span>
                  <span>
                    {plan.buttonText || "Desbloquear Acesso Premium Ilimitado"} &rarr;
                  </span>
                </a>

                <p className="text-center text-xs text-stone-400 dark:text-stone-500 mt-4">
                  Pagamento seguro processado pela Cakto.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}