"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import AdBanner from "@/components/AdBanner";

const EXEMPLOS_DEMONSTRACAO = [
  {
    id: "reconquista",
    aba: "Reconquista",
    tag: "Protocolo de Reversão",
    recebida: "Acho melhor a gente dar um tempo, tô muito confusa com tudo...",
    resposta: "Entendo perfeitamente, faz sentido você precisar desse espaço agora. Fica bem por aí.",
    analise: "Corta o desespero na hora, preserva seu valor e ativa o gatilho de perda em até 72h.",
    estilo: "Postura: alto valor • Sem carência",
  },
  {
    id: "flerte",
    aba: "Apps & Instagram",
    tag: "Abertura Magnética",
    recebida: "Bio do Tinder: 'Viciada em café, viagens e gente que sabe conversar'",
    resposta: "Já ganhei no café e nas viagens. Só falta você provar que aguenta uma conversa sem respostas de 3 palavras.",
    analise: "Usa desafio leve baseado no perfil dela, fugindo do 'Oi, tudo bem?'.",
    estilo: "Tom: provocante • Estilo: confiante",
  },
  {
    id: "redflag",
    aba: "Red Flags",
    tag: "Leitura Fria de Print",
    recebida: "Tô super corrido essa semana, mas qualquer dia a gente marca algo!",
    resposta: "Desinteresse disfarçado de agenda cheia. Não cobre encontro: recue 100% e deixe investir.",
    analise: "Evita que você perca semanas sendo 'estepe emocional' de quem só quer validação.",
    estilo: "Diagnóstico: baixo investimento",
  },
];

const DEPOIMENTOS = [
  {
    nome: "M. F., 29 anos",
    cidade: "São Paulo, SP",
    modulo: "Operação Reconquista",
    texto:
      "A gente estava há 11 dias sem se falar e eu já ia mandar um textão implorando. A IA leu o print da nossa última briga, me proibiu de mandar mensagem naquele dia e me deu uma frase curta 4 dias depois. Ele respondeu em 3 minutos.",
  },
  {
    nome: "R. S., 34 anos",
    cidade: "Belo Horizonte, MG",
    modulo: "Raio-X de Red Flags",
    texto:
      "Eu achava que ela estava só ocupada no trabalho, mas o Raio-X de Red Flags me mostrou na hora que ela estava me mantendo em banho-maria. Mudei minha postura com a mensagem da Lilith e o jogo virou.",
  },
  {
    nome: "C. A., 26 anos",
    cidade: "Curitiba, PR",
    modulo: "Perfil Magnético",
    texto:
      "Mandei prints do meu perfil no Bumble e Instagram. A Lilith mandou eu trocar a primeira foto, reescreveu minha bio e meus matches triplicaram no mesmo fim de semana!",
  },
];

export default function Home() {
  const { userId, isLoaded } = useAuth();
  const [tracksOpen, setTracksOpen] = useState(false);
  const [activeExampleIdx, setActiveExampleIdx] = useState(0);

  useEffect(() => {
    fetch("/api/affiliate/config")
      .then((r) => r.json())
      .then((cfg) => {
        if (cfg?.tracksOpen) setTracksOpen(true);
      })
      .catch(() => {});
  }, []);

  const currentExample = EXEMPLOS_DEMONSTRACAO[activeExampleIdx];

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#140a0f] text-stone-200 font-sans selection:bg-rose-500 selection:text-white">
      <Navbar />

      {isLoaded && userId ? (
        <div className="relative w-full overflow-hidden flex-1">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-gradient-to-b from-rose-500/10 via-rose-500/5 to-transparent" />

          <div className="relative w-full max-w-5xl px-5 sm:px-6 py-10 sm:py-16 mx-auto flex flex-col items-center">
            <div className="text-center max-w-3xl mb-10 mt-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-rose-300 mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                Inteligência emocional guiada por IA
              </span>

              <h1 className="text-4xl sm:text-7xl font-serif font-bold tracking-tight text-stone-50 mb-4">
                LilithLove
              </h1>
              <p className="text-sm sm:text-xl leading-relaxed text-stone-300 mb-8">
                Pare de adivinhar o que se passa na cabeça dessa pessoa. Envie o print, descubra a real intenção por trás de cada palavra e receba a resposta exata para assumir o controle.
              </p>

              <div className="flex justify-center">
                <Link
                  href="/chat/lilith?action=analise"
                  className="px-8 py-4 bg-gradient-to-r from-[#8f1d42] to-[#b52654] hover:from-[#a1224b] hover:to-[#c72c5e] text-white rounded-2xl font-bold text-sm sm:text-base transition-all shadow-lg shadow-rose-950/30 flex items-center justify-center gap-2.5 hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4 text-rose-200 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <span>Analisar Conversa</span>
                </Link>
              </div>
            </div>

            <div className="w-full mt-2">
              <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-stone-100 mb-6 text-center">
                Ferramentas Inteligentes
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Radar no Instagram */}
                <Link
                  href="/chat/lilith?action=instagram"
                  className="bg-white/[0.04] p-6 sm:p-8 rounded-3xl shadow-sm border border-white/[0.08] hover:border-rose-500/35 hover:-translate-y-1 transition-all cursor-pointer flex flex-col gap-3.5 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center shrink-0 text-rose-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-stone-100 leading-snug">
                      Radar no Instagram: Do Story ao Encontro
                    </h3>
                  </div>
                  <p className="text-sm text-stone-300 leading-relaxed">
                    Saia da fila dos ignorados. Transforme uma simples visualização de Story ou curtida em uma conversa magnética — sem elogios óbvios e sem parecer mais um fã.
                  </p>
                </Link>

                {/* 2. Apps de Namoro */}
                <Link
                  href="/chat/lilith?action=apps_match"
                  className="bg-white/[0.04] p-6 sm:p-8 rounded-3xl shadow-sm border border-white/[0.08] hover:border-rose-500/35 hover:-translate-y-1 transition-all cursor-pointer flex flex-col gap-3.5 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center shrink-0 text-rose-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-stone-100 leading-snug">
                      Abertura Irresistível para Apps de Namoro
                    </h3>
                  </div>
                  <p className="text-sm text-stone-300 leading-relaxed">
                    Deu match e travou? Fuja do &ldquo;Oi, tudo bem?&rdquo; que morre em 3 mensagens. Use detalhes do perfil para criar tensão imediata e tirar a conversa do app direto para o encontro.
                  </p>
                </Link>

                {/* 3. Perfil Magnético */}
                <Link
                  href="/chat/lilith?action=otimizar_perfil"
                  className="bg-white/[0.04] p-6 sm:p-8 rounded-3xl shadow-sm border border-white/[0.08] hover:border-amber-500/35 hover:-translate-y-1 transition-all cursor-pointer flex flex-col gap-3.5 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0 text-amber-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-stone-100 leading-snug">
                      Perfil Magnético: Fotos & Bio de Alto Valor
                    </h3>
                  </div>
                  <p className="text-sm text-stone-300 leading-relaxed">
                    Descubra em segundos quais fotos estão sabotando seus resultados. Nossa IA avalia sua imagem e escreve uma bio impossível de ignorar para multiplicar seus matches.
                  </p>
                </Link>

                {/* 4. Raio-X de Red Flags */}
                <Link
                  href="/chat/lilith?action=red_flags"
                  className="bg-white/[0.04] p-6 sm:p-8 rounded-3xl shadow-sm border border-white/[0.08] hover:border-rose-500/35 hover:-translate-y-1 transition-all cursor-pointer flex flex-col gap-3.5 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center shrink-0 text-rose-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-stone-100 leading-snug">
                      Raio-X de Manipulação & Red Flags
                    </h3>
                  </div>
                  <p className="text-sm text-stone-300 leading-relaxed">
                    Não entregue seu coração no escuro. Escaneie conversas e atitudes para desmascarar joguinhos, narcisismo, <em>love bombing</em> e falta de interesse antes de se machucar.
                  </p>
                </Link>

                {/* 5. Oráculo Astral */}
                <Link
                  href="/chat/mistico"
                  className="md:col-span-2 bg-gradient-to-br from-purple-950/65 to-indigo-950/55 p-6 sm:p-7 rounded-3xl shadow-sm border border-purple-400/25 hover:border-purple-400/50 transition-all cursor-pointer flex flex-col gap-3.5 group w-full"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shrink-0 text-purple-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                        </svg>
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-purple-50 leading-snug">
                        Mapa Mental dos Signos & Oráculo do Amor
                      </h3>
                    </div>
                    <span className="hidden sm:inline-block bg-purple-500 text-purple-50 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shrink-0">
                      Astrologia & Tarot →
                    </span>
                  </div>
                  <p className="text-sm text-purple-100/90 leading-relaxed">
                    Descubra o ponto fraco emocional do signo dessa pessoa, o que ela esconde por trás do orgulho e o que as cartas revelam sobre o futuro de vocês.
                  </p>
                </Link>

                {/* 6. Operação Reconquista */}
                <Link
                  href="/chat/reconquista"
                  className="md:col-span-2 bg-gradient-to-br from-rose-950/80 via-[#2b0916] to-orange-950/60 p-6 sm:p-8 rounded-3xl shadow-md border border-rose-400/35 hover:border-rose-400/60 transition-all cursor-pointer flex flex-col gap-3.5 group w-full"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-400/35 flex items-center justify-center shrink-0 text-rose-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-rose-50 leading-snug">
                        Operação Reconquista: Reverta o Término
                      </h3>
                    </div>
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      Alta Eficácia • Urgente
                    </span>
                  </div>
                  <p className="text-sm text-rose-100/90 leading-relaxed max-w-3xl">
                    Uma mensagem errada agora pode fechar essa porta para sempre. Ative o protocolo comportamental de Contato Zero, reconstrua seu valor e descubra a abordagem exata para reativar a saudade.
                  </p>
                </Link>
              </div>
            </div>

            {tracksOpen && (
              <div className="w-full mt-14 pt-10 border-t border-white/10 text-center">
                <span className="text-rose-300 font-semibold tracking-wider uppercase text-xs mb-3 block">
                  Exclusivo Assinantes • Aulas & Guias
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-stone-100 mb-6">
                  Trilhas de Desenvolvimento
                </h2>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/trilhas?track=amor_proprio" className="px-5 py-3.5 bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-2xl text-stone-200 text-sm font-medium">Ame a Si Mesmo Primeiro</Link>
                  <Link href="/trilhas?track=contato_zero" className="px-5 py-3.5 bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-2xl text-stone-200 text-sm font-medium">Contato Zero na Prática</Link>
                  <Link href="/trilhas?track=confianca" className="px-5 py-3.5 bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-2xl text-stone-200 text-sm font-medium">Desperte sua Confiança</Link>
                </div>
              </div>
            )}

            <div className="w-full max-w-4xl mx-auto mt-10">
              <AdBanner format="rectangle" slotId="HOME_BOTTOM_SLOT" />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden flex-1">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-gradient-to-b from-[#361122]/60 via-[#1f0b14]/30 to-transparent" />

          <div className="relative w-full max-w-4xl px-5 sm:px-6 pt-10 pb-16 sm:pt-16 sm:pb-24 mx-auto flex flex-col items-center">
            <div className="text-center max-w-2xl flex flex-col items-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-rose-300 mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                Inteligência Emocional & Reconquista
              </span>

              <div className="mb-4 relative">
                <div className="absolute -inset-3 rounded-full bg-rose-500/25 blur-xl pointer-events-none" />
                <img
                  src="/logo.png"
                  alt="LilithLove"
                  className="relative w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-3xl shadow-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>

              <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-white mb-4">
                LilithLove
              </h1>

              <p className="text-base sm:text-xl leading-relaxed text-stone-300/90 mb-8 max-w-xl">
                Seu conselheiro amoroso guiado por IA. Decifre prints, reverta términos e encontre as palavras exatas para virar o jogo com confiança.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto mb-12">
                <Link
                  href="/sign-up?redirect_url=/chat/lilith?action=analise"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#8f1d42] via-[#a8224e] to-[#c43b5a] text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-950/40 transition-all flex items-center justify-center gap-2"
                >
                  <span>Começar agora</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </Link>

                <Link
                  href="/sign-in?redirect_url=/chat/lilith?action=analise"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-stone-100 font-semibold text-sm sm:text-base transition-all text-center"
                >
                  Já tenho conta
                </Link>
              </div>
            </div>

            {/* Cartão Interativo de Demonstração */}
            <div className="w-full max-w-2xl bg-[#1a0d14] rounded-3xl border border-rose-300/15 shadow-2xl overflow-hidden mb-14">
              <div className="px-4 sm:px-6 py-3.5 bg-[#14090f] border-b border-white/[0.07] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-200">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>Uma conversa, novas possibilidades</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {EXEMPLOS_DEMONSTRACAO.map((ex, idx) => (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => setActiveExampleIdx(idx)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        activeExampleIdx === idx
                          ? "bg-rose-600 text-white shadow-sm"
                          : "text-stone-400 hover:bg-white/5"
                      }`}
                    >
                      {ex.aba}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 sm:p-7 space-y-5">
                <div className="max-w-md rounded-2xl rounded-tl-sm bg-[#24121b] border border-white/[0.06] p-4">
                  <span className="text-[11px] font-medium text-stone-400 block mb-1">
                    Mensagem ou Perfil Analisado
                  </span>
                  <p className="text-sm sm:text-base text-stone-100">
                    &ldquo;{currentExample.recebida}&rdquo;
                  </p>
                </div>

                <div className="pl-4 border-l-2 border-rose-500 space-y-1.5">
                  <span className="text-xs font-bold text-rose-400 block">
                    ✦ {currentExample.tag} • Sugestão da Lilith
                  </span>
                  <p className="text-base sm:text-lg font-medium text-white leading-snug">
                    {currentExample.resposta}
                  </p>
                  <p className="text-xs text-stone-400 pt-1">
                    {currentExample.analise}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.07] flex items-center justify-between text-[11px] text-stone-400">
                  <span>{currentExample.estilo}</span>
                  <Link
                    href="/sign-up?redirect_url=/chat/lilith?action=analise"
                    className="text-rose-400 font-semibold hover:underline"
                  >
                    Testar com meu print →
                  </Link>
                </div>
              </div>
            </div>

            {/* 3 Pilares com ícone alinhado ao lado do título */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 py-10 border-y border-white/[0.08] mb-14">
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    Respostas estratégicas
                  </h2>
                </div>
                <p className="text-sm text-stone-400 leading-relaxed">
                  Sugestões humanas, magnéticas e sem parecer textão pronto ou carência.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    Reversão e Reconquista
                  </h2>
                </div>
                <p className="text-sm text-stone-400 leading-relaxed">
                  Diagnóstico cirúrgico para términos, afastamentos e aplicação do Contato Zero.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    Perfil Magnético & Bio
                  </h2>
                </div>
                <p className="text-sm text-stone-400 leading-relaxed">
                  Avaliação de fotos e criação de bios magnéticas para Tinder, Bumble e Instagram.
                </p>
              </div>
            </div>

            {/* Módulos Deslogado */}
            <div className="w-full mb-14">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  Escolha o módulo ideal para o seu momento
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Link
                  href="/chat/reconquista"
                  className="md:col-span-2 bg-gradient-to-br from-[#2b0b18] via-[#220913] to-[#1c0a12] p-6 sm:p-8 rounded-3xl border border-rose-400/30 hover:border-rose-400/60 shadow-md transition-all flex flex-col gap-3.5 group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center shrink-0 text-rose-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-snug">
                        Operação Reconquista: Reverta o Término
                      </h3>
                    </div>
                    <span className="bg-rose-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      Alta Eficácia • Urgente
                    </span>
                  </div>
                  <p className="text-sm text-rose-100/85 leading-relaxed max-w-2xl">
                    Uma mensagem errada agora pode fechar essa porta para sempre. Ative o protocolo comportamental de Contato Zero, reconstrua seu valor e descubra a abordagem exata para reativar a saudade.
                  </p>
                </Link>

                <Link
                  href="/chat/lilith?action=instagram"
                  className="bg-white/[0.03] p-6 rounded-3xl border border-white/[0.08] hover:border-rose-500/30 transition-all flex flex-col items-start"
                >
                  <h3 className="text-lg font-bold text-white mb-1.5">
                    Radar no Instagram & Apps
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
                    Aberturas magnéticas para Stories, Direct, Tinder e Bumble, além de avaliação de fotos e bio.
                  </p>
                </Link>

                <Link
                  href="/chat/mistico"
                  className="bg-gradient-to-br from-purple-950/50 to-indigo-950/40 p-6 rounded-3xl border border-purple-400/25 hover:border-purple-400/50 transition-all flex flex-col items-start"
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <h3 className="text-lg font-bold text-purple-100">
                      Mapa Mental dos Signos & Oráculo
                    </h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                      Signos & Tarot
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
                    Compatibilidade astral, ponto fraco emocional do signo e leitura de cartas para o relacionamento.
                  </p>
                </Link>
              </div>
            </div>

            {/* Depoimentos */}
            <div className="w-full mb-14">
              <h2 className="text-2xl font-serif font-bold text-center text-white mb-8">
                Quem seguiu a estratégia, virou o jogo
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {DEPOIMENTOS.map((dep, idx) => (
                  <div
                    key={idx}
                    className="bg-white/[0.03] p-6 rounded-3xl border border-white/[0.08] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-amber-400 text-xs">★★★★★</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300">
                          {dep.modulo}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-stone-300 leading-relaxed italic mb-4">
                        &ldquo;{dep.texto}&rdquo;
                      </p>
                    </div>
                    <div className="text-[11px] text-stone-400 pt-3 border-t border-white/[0.06] flex justify-between">
                      <strong className="text-stone-200">{dep.nome}</strong>
                      <span>{dep.cidade}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Banner Final */}
            <div className="w-full rounded-3xl bg-[#1a0d14] border border-rose-300/15 p-7 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg mb-8">
              <div className="text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-1.5">
                  Uma boa conversa muda tudo.
                </h2>
                <p className="text-sm text-stone-400">
                  A LilithLove ajuda você a encontrar a resposta exata e retomar o controle emocional.
                </p>
              </div>
              <Link
                href="/sign-up?redirect_url=/chat/lilith?action=analise"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#9e1f48] to-[#c43b5a] hover:opacity-95 text-white font-bold text-sm shadow-md text-center shrink-0 transition-all"
              >
                Começar agora →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* RODAPÉ INSTITUCIONAL */}
      <footer className="w-full border-t border-white/10 bg-[#10070b] py-10 px-6 text-xs text-stone-400">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="space-y-1.5">
              <p className="font-serif font-bold text-sm text-white">LilithLove</p>
              <p className="text-xs text-stone-400">
                Confiança para responder. Estratégia para reconquistar.
              </p>
              <p className="text-[11px] text-emerald-400 pt-1">
                🔒 Pagamento seguro via PIX e Cartão • Cakto
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="font-bold text-stone-200">Contato e suporte</p>
              <p className="text-rose-400 font-medium">suporte@lilithlove.site</p>
              <p className="text-[11px] opacity-80">
                Respondemos em até 24h úteis. Dúvidas sobre assinatura ou acesso? Fale com a gente.
              </p>
            </div>

            <div className="flex flex-col space-y-1.5 font-medium">
              <Link href="/sobre" className="hover:text-rose-400 transition-colors">Como Funciona</Link>
              <Link href="/planos" className="hover:text-rose-400 transition-colors">Planos VIP</Link>
              {tracksOpen && (
                <Link href="/trilhas" className="hover:text-rose-400 transition-colors">Aulas & Guias</Link>
              )}
              <Link href="/termos" className="hover:text-rose-400 transition-colors">Termos de Uso</Link>
              <Link href="/privacidade" className="hover:text-rose-400 transition-colors">Política de Privacidade</Link>
              <Link href="/contato" className="hover:text-rose-400 transition-colors">Fale Conosco</Link>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 text-center space-y-2">
            <p className="max-w-3xl mx-auto leading-relaxed text-[11px] opacity-75">
              <strong>Aviso Legal e Isenção de Responsabilidade:</strong> A LilithLove utiliza inteligência artificial para fornecer análises comportamentais e sugestões estratégicas. As orientações não substituem acompanhamento psicológico ou médico profissional. Como relacionamentos dependem do livre-arbítrio de terceiros, não garantimos 100% de eficácia ou resultados específicos. Exclusivo para maiores de 18 anos.
            </p>
            <p className="text-[11px] opacity-60">
              © {new Date().getFullYear()} LilithLove. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}