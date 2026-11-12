"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";

const ETAPAS = [
  {
    numero: "01",
    titulo: "Envie o Contexto, Print ou Áudio",
    descricao:
      "Escolha o módulo ideal para o seu momento. Você pode preencher nossa ficha rápida de calibragem, colar o print da conversa do WhatsApp/Instagram (Ctrl+V) ou gravar um áudio desabafando.",
  },
  {
    numero: "02",
    titulo: "Escaneamento de Subtexto e Intenção",
    descricao:
      "Nossa Inteligência Artificial analisa o que não foi dito: identifica testes de resistência, nível real de interesse, orgulho ferido, sinais de manipulação (Red Flags) e quem está no controle emocional.",
  },
  {
    numero: "03",
    titulo: "Plano de Ação e Mensagem Cirúrgica",
    descricao:
      "Você recebe o diagnóstico completo da situação, descobre o que jamais deve fazer no impulso e desbloqueia o texto exato da mensagem para enviar e virar o jogo a seu favor.",
  },
];

const MOTORES = [
  {
    titulo: "Consultoria da Lilith",
    subtitulo: "Estratégia, Atração & Leitura Fria",
    descricao:
      "Ideal para Primeiro Contato, Pós-Encontro, Detector de Red Flags e quando você recebe uma mensagem difícil e não sabe o que responder sem perder o valor.",
    link: "/chat/lilith",
    botao: "Abrir Consultoria da Lilith",
    cor: "border-rose-500/25 bg-rose-500/[0.04]",
  },
  {
    titulo: "Reconquiste",
    subtitulo: "Reversão de Crise & Contato Zero",
    descricao:
      "O módulo de emergência para términos recentes ou relacionamentos que esfriaram. Traça o protocolo exato de vácuo magnético, reconstrução de imagem e reaproximação.",
    link: "/chat/reconquista",
    botao: "Abrir Módulo Reconquiste",
    cor: "border-amber-500/25 bg-amber-500/[0.04]",
  },
  {
    titulo: "Oráculo do Amor & Sinastria",
    subtitulo: "Mapa Mental dos Signos & Tarot",
    descricao:
      "Cruza a psicologia dos signos e datas de nascimento para revelar como a mente da pessoa amada funciona, o ponto fraco de sedução daquele signo e as tendências do casal.",
    link: "/chat/mistico",
    botao: "Abrir Oráculo Astral",
    cor: "border-purple-500/25 bg-purple-500/[0.04]",
  },
];

export default function SobrePage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#faf7f5] text-stone-800 dark:bg-[#140a0f] dark:text-stone-200 font-sans">
      <Navbar />

      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-12 sm:py-20">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 dark:bg-rose-500/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-rose-700 dark:text-rose-300 mb-4">
            Tecnologia Comportamental • Sigilo Absoluto
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 dark:text-white mb-5 leading-tight">
            Como a Inteligência da LilithLove Funciona
          </h1>
          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
            Quando estamos envolvidos emocionalmente, a ansiedade nos cega e faz agir no impulso. A LilithLove enxerga as entrelinhas que você não vê e devolve o controle para as suas mãos.
          </p>
        </div>

        {/* As 3 Etapas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {ETAPAS.map((etapa) => (
            <div
              key={etapa.numero}
              className="bg-white dark:bg-white/[0.04] border border-stone-200/70 dark:border-white/[0.08] rounded-3xl p-7 shadow-sm relative overflow-hidden"
            >
              <span className="text-4xl font-serif font-bold text-rose-500/25 dark:text-rose-400/25 block mb-4">
                {etapa.numero}
              </span>
              <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-white mb-2.5">
                {etapa.titulo}
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                {etapa.descricao}
              </p>
            </div>
          ))}
        </div>

        {/* Os 3 Motores Especializados */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white mb-2">
              3 Mentes Especializadas à Sua Disposição
            </h2>
            <p className="text-sm sm:text-base text-stone-500 dark:text-stone-400">
              Diferente de uma IA genérica que dá conselhos mornos, cada módulo da LilithLove foi treinado para um cenário específico:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOTORES.map((m, idx) => (
              <div
                key={idx}
                className={`rounded-3xl p-7 border flex flex-col justify-between ${m.cor}`}
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 block mb-1">
                    {m.subtitulo}
                  </span>
                  <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white mb-3">
                    {m.titulo}
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-6">
                    {m.descricao}
                  </p>
                </div>

                <Link
                  href={m.link}
                  className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-white/10 dark:hover:bg-white/15 text-white text-xs font-bold text-center transition-colors"
                >
                  {m.botao} →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Privacidade & Chamada Final */}
        <div className="bg-gradient-to-br from-rose-950 via-[#260814] to-[#17050c] text-white rounded-3xl p-8 sm:p-12 text-center shadow-xl border border-rose-400/20">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-3">
            Pronto para descobrir o que realmente passa na cabeça dessa pessoa?
          </h2>
          <p className="text-sm sm:text-base text-rose-100/85 max-w-2xl mx-auto mb-8 leading-relaxed">
            Suas conversas, prints e áudios são 100% privados e sincronizados exclusivamente na sua conta (PC e Celular). Comece seu diagnóstico gratuitamente agora.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/chat/reconquista"
              className="px-7 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg transition-all"
            >
              Iniciar Diagnóstico de Reconquista →
            </Link>
            <Link
              href="/planos"
              className="px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all"
            >
              Conhecer Planos VIP
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}