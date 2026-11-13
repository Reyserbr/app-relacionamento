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
    aba: "O que responder",
    tag: "Inversão de Jogo",
    recebida: "E aí, sumido(a)... vai fazer o que hoje?",
    resposta: "Tava sem planos até você aparecer com essa energia suspeita... o que tem em mente?",
    analise: "Sai do óbvio, devolve a iniciativa para a pessoa e cria tensão divertida na conversa.",
    estilo: "Tom: magnético • Estilo: confiante",
  },
  {
    id: "redflag",
    aba: "Subtexto & Red Flags",
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
    modulo: "Reconquiste",
    texto:
      "A gente estava há 11 dias sem se falar e eu já ia mandar um textão implorando. A IA leu o print da nossa última briga, me proibiu de mandar mensagem naquele dia e me deu uma frase curta 4 dias depois. Ele respondeu em 3 minutos.",
  },
  {
    nome: "R. S., 34 anos",
    cidade: "Belo Horizonte, MG",
    modulo: "Leitura de Print",
    texto:
      "Eu achava que ela estava só ocupada no trabalho, mas o Detector de Red Flags me mostrou na hora que ela estava me mantendo em banho-maria. Mudei minha postura com a mensagem da Lilith e o jogo virou.",
  },
  {
    nome: "C. A., 26 anos",
    cidade: "Curitiba, PR",
    modulo: "Consultoria Lilith",
    texto:
      "Sempre fui muito ansiosa depois de sair com alguém e acabava sufocando. Mandei exatamente a provocação leve que a Lilith escreveu e ele ficou obcecado querendo marcar o segundo encontro logo na manhã seguinte!",
  },
];

export default function Home() {
  const { userId } = useAuth();
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
    <main className="flex min-h-screen flex-col items-center bg-[#faf7f5] text-stone-800 dark:bg-[#140a0f] dark:text-stone-200 font-sans selection:bg-rose-500 selection:text-white">
      <Navbar />

      <div className="relative w-full overflow-hidden">
        {/* Brilho ambiental sutil no topo */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-gradient-to-b from-rose-200/50 via-rose-100/20 to-transparent dark:from-[#361122]/60 dark:via-[#1f0b14]/30 dark:to-transparent" />

        <div className="relative w-full max-w-4xl px-5 sm:px-6 pt-10 pb-16 sm:pt-16 sm:pb-24 mx-auto flex flex-col items-center">

          {/* DOBRA PRINCIPAL ESTILO CONVERSÃO DIRETA (INSPIRADA NO FLERTAI COM IDENTIDADE LILITHLOVE) */}
          <div className="text-center max-w-2xl flex flex-col items-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 dark:bg-white/[0.05] px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-rose-700 dark:text-rose-300 mb-7">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              Inteligência Emocional & Reconquista
            </span>

            {/* Logo Centralizada em Destaque */}
            <div className="mb-4 relative">
              <div className="absolute -inset-3 rounded-full bg-rose-500/20 blur-xl dark:bg-rose-500/25 pointer-events-none" />
              <img
                src="/logo.png"
                alt="LilithLove"
                className="relative w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-3xl shadow-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>

            <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-stone-900 dark:text-white mb-4">
              LilithLove
            </h1>

            <p className="text-base sm:text-xl leading-relaxed text-stone-600 dark:text-stone-300/90 mb-8 max-w-xl">
              Seu copiloto amoroso guiado por IA. Decifre prints, reverta términos e encontre as palavras exatas para virar o jogo com confiança.
            </p>

            {/* Botões Principais Lado a Lado (Começar agora + Já tenho conta / Meus Chats) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto mb-12">
              <Link
                href={userId ? "/chat/lilith" : "/sign-up?redirect_url=/chat/lilith"}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#8f1d42] via-[#a8224e] to-[#c43b5a] hover:from-[#a1224b] hover:to-[#d44464] text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-950/40 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
              >
                <span>{userId ? "Abrir Consultoria da Lilith" : "Começar agora"}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </Link>

              {!userId ? (
                <Link
                  href="/sign-in?redirect_url=/chat/lilith"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white dark:bg-white/[0.05] hover:bg-stone-100 dark:hover:bg-white/[0.1] border border-stone-200 dark:border-white/10 text-stone-800 dark:text-stone-100 font-semibold text-sm sm:text-base transition-all text-center"
                >
                  Já tenho conta
                </Link>
              ) : (
                <Link
                  href="/chat/reconquista"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white dark:bg-white/[0.05] hover:bg-stone-100 dark:hover:bg-white/[0.1] border border-stone-200 dark:border-white/10 text-stone-800 dark:text-stone-100 font-semibold text-sm sm:text-base transition-all text-center"
                >
                  Ir para Reconquiste →
                </Link>
              )}
            </div>
          </div>

          {/* CARTÃO INTERATIVO DE DEMONSTRAÇÃO REAL (ESTILO FLERTAI COM ABAS DA LILITHLOVE) */}
          <div className="w-full max-w-2xl bg-white dark:bg-[#1a0d14] rounded-3xl border border-stone-200/80 dark:border-rose-300/15 shadow-2xl overflow-hidden mb-16">
            {/* Cabeçalho do Cartão com Abas Clicáveis */}
            <div className="px-4 sm:px-6 py-3.5 bg-stone-50/90 dark:bg-[#14090f] border-b border-stone-200/70 dark:border-white/[0.07] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-200">
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
                        ? "bg-rose-900 dark:bg-rose-600 text-white shadow-sm"
                        : "text-stone-500 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-white/5"
                    }`}
                  >
                    {ex.aba}
                  </button>
                ))}
              </div>
            </div>

            {/* Corpo do Exemplo */}
            <div className="p-5 sm:p-7 space-y-5">
              {/* Balão da Mensagem Recebida */}
              <div className="max-w-md rounded-2xl rounded-tl-sm bg-stone-100 dark:bg-[#24121b] border border-stone-200/60 dark:border-white/[0.06] p-4">
                <span className="text-[11px] font-medium text-stone-400 dark:text-stone-400 block mb-1">
                  Mensagem recebida no WhatsApp / Direct
                </span>
                <p className="text-sm sm:text-base text-stone-800 dark:text-stone-100">
                  &ldquo;{currentExample.recebida}&rdquo;
                </p>
              </div>

              {/* Resposta Sugerida pela Lilith */}
              <div className="pl-4 border-l-2 border-rose-500 space-y-1.5">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
                  ✦ {currentExample.tag} • Sugestão da Lilith
                </span>
                <p className="text-base sm:text-lg font-medium text-stone-900 dark:text-white leading-snug">
                  {currentExample.resposta}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 pt-1">
                  {currentExample.analise}
                </p>
              </div>

              {/* Rodapé do Cartão */}
              <div className="pt-3 border-t border-stone-100 dark:border-white/[0.07] flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500">
                <span>{currentExample.estilo}</span>
                <Link
                  href={userId ? "/chat/lilith" : "/sign-up?redirect_url=/chat/lilith"}
                  className="text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                >
                  Testar com meu print →
                </Link>
              </div>
            </div>
          </div>

          {/* 3 PILARES DIRETOS (IGUAL À ESTRUTURA LIMPA DO FLERTAI) */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 py-10 border-y border-stone-200/70 dark:border-white/[0.08] mb-16">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                Respostas estratégicas
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                Sugestões humanas, magnéticas e sem parecer textão pronto ou carência.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                Reversão e Reconquista
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                Diagnóstico cirúrgico para términos, afastamentos e aplicação do Contato Zero.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                Leitura de prints e áudios
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                Envie até 5 prints seguidos ou grave um áudio desabafando para leitura completa.
              </p>
            </div>
          </div>

          {/* MÓDULOS DA PLATAFORMA (COM RECONQUISTE EM DESTAQUE MÁXIMO) */}
          <div className="w-full mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white">
                Escolha o módulo ideal para o seu momento
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* DESTAQUE PRINCIPAL: RECONQUISTE */}
              <Link
                href="/chat/reconquista"
                className="md:col-span-2 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-[#2b0b18] dark:via-[#220913] dark:to-[#1c0a12] p-7 sm:p-8 rounded-3xl border border-rose-200 dark:border-rose-400/30 hover:border-rose-400/60 shadow-md hover:-translate-y-0.5 transition-all flex flex-col items-start relative overflow-hidden group"
              >
                <div className="absolute top-6 right-6 bg-rose-900 dark:bg-rose-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Alta Eficácia • Urgente
                </div>
                <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center mb-4 text-rose-600 dark:text-rose-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-rose-950 dark:text-white mb-2">
                  Reconectar / Reconquistar
                </h3>
                <p className="text-sm text-rose-900/80 dark:text-rose-100/85 leading-relaxed max-w-2xl">
                  Diagnóstico comportamental completo para reverter términos e esfriamentos, protocolo de Contato Zero e a mensagem exata para reativar a saudade.
                </p>
              </Link>

              <Link
                href="/chat/lilith?action=primeiro_contato"
                className="bg-white dark:bg-white/[0.03] p-6 rounded-3xl border border-stone-200/70 dark:border-white/[0.07] hover:border-rose-500/30 transition-all flex flex-col items-start"
              >
                <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-1.5">
                  Primeiro Contato & Pós-Encontro
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                  Aberturas magnéticas para Instagram/WhatsApp e mensagens estratégicas após sair com alguém.
                </p>
              </Link>

              <Link
                href="/chat/mistico"
                className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/40 p-6 rounded-3xl border border-purple-200 dark:border-purple-400/25 hover:border-purple-400/50 transition-all flex flex-col items-start"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <h3 className="text-lg font-bold text-purple-950 dark:text-purple-100">
                    Oráculo do Amor & Sinastria
                  </h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300">
                    Signos & Tarot
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-purple-900/80 dark:text-purple-200/80 leading-relaxed">
                  Compatibilidade astral, mapa mental do parceiro(a) e leitura de cartas para o relacionamento.
                </p>
              </Link>
            </div>
          </div>

          {/* DEPOIMENTOS ENXUTOS */}
          <div className="w-full mb-16">
            <h2 className="text-2xl font-serif font-bold text-center text-stone-900 dark:text-white mb-8">
              Quem seguiu a estratégia, virou o jogo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {DEPOIMENTOS.map((dep, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-white/[0.03] p-6 rounded-3xl border border-stone-200/70 dark:border-white/[0.07] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-amber-400 text-xs">★★★★★</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-300">
                        {dep.modulo}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed italic mb-4">
                      &ldquo;{dep.texto}&rdquo;
                    </p>
                  </div>
                  <div className="text-[11px] text-stone-400 dark:text-stone-500 pt-3 border-t border-stone-100 dark:border-white/[0.06] flex justify-between">
                    <strong className="text-stone-700 dark:text-stone-200">{dep.nome}</strong>
                    <span>{dep.cidade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BANNER FINAL DE CONVERSÃO (IGUAL À DOBRA FINAL DO FLERTAI) */}
          <div className="w-full rounded-3xl bg-white dark:bg-[#1a0d14] border border-stone-200/80 dark:border-rose-300/15 p-7 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg mb-8">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white mb-1.5">
                Uma boa conversa muda tudo.
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                A LilithLove ajuda você a encontrar a resposta exata e retomar o controle emocional.
              </p>
            </div>
            <Link
              href={userId ? "/chat/lilith" : "/sign-up?redirect_url=/chat/lilith"}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#9e1f48] to-[#c43b5a] hover:opacity-95 text-white font-bold text-sm shadow-md text-center shrink-0 transition-all"
            >
              Começar agora →
            </Link>
          </div>

          <div className="w-full">
            <AdBanner format="horizontal" slotId="HOME_BOTTOM_SLOT" />
          </div>
        </div>
      </div>

      {/* RODAPÉ INSTITUCIONAL COMPLETO (CONFORMIDADE ADSENSE / LGPD) */}
      <footer className="w-full border-t border-stone-200 dark:border-white/10 bg-white/60 dark:bg-[#10070b] py-10 px-6 text-xs text-stone-500 dark:text-stone-400">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="space-y-1.5">
              <p className="font-serif font-bold text-sm text-stone-800 dark:text-white">LilithLove</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Confiança para responder. Estratégia para reconquistar.
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 pt-1">
                🔒 Pagamento seguro via PIX e Cartão • Cakto
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="font-bold text-stone-800 dark:text-stone-200">Contato e suporte</p>
              <p className="text-rose-600 dark:text-rose-400 font-medium">suporte@lilithlove.site</p>
              <p className="text-[11px] opacity-80">
                Respondemos em até 24h úteis. Dúvidas sobre assinatura ou acesso? Fale com a gente.
              </p>
            </div>

            <div className="flex flex-col space-y-1.5 font-medium">
              <Link href="/sobre" className="hover:text-rose-500 transition-colors">Como Funciona</Link>
              <Link href="/planos" className="hover:text-rose-500 transition-colors">Planos VIP</Link>
              {tracksOpen && (
                <Link href="/trilhas" className="hover:text-rose-500 transition-colors">Aulas & Guias</Link>
              )}
              <Link href="/termos" className="hover:text-rose-500 transition-colors">Termos de Uso</Link>
              <Link href="/privacidade" className="hover:text-rose-500 transition-colors">Política de Privacidade</Link>
              <Link href="/contato" className="hover:text-rose-500 transition-colors">Fale Conosco</Link>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-200/70 dark:border-white/5 text-center space-y-2">
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