"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import AdBanner from "@/components/AdBanner";

const DEPOIMENTOS = [
  {
    nome: "M. F., 29 anos",
    cidade: "São Paulo, SP",
    modulo: "Módulo de Reconquista",
    texto:
      "A gente estava há 11 dias sem se falar e eu já ia mandar um textão implorando. A IA leu o print da nossa última briga, me proibiu de mandar mensagem naquele dia e me deu uma frase curta de quebra de padrão 4 dias depois. Ele me respondeu em 3 minutos e ontem saímos juntos de novo.",
    estrelas: 5,
  },
  {
    nome: "R. S., 34 anos",
    cidade: "Belo Horizonte, MG",
    modulo: "Leitura de Conversa & Subtexto",
    texto:
      "Eu achava que ela estava só ocupada no trabalho, mas o Detector de Red Flags me mostrou na hora que ela estava me mantendo em banho-maria enquanto testava outra pessoa. Mudei minha postura com a mensagem cirúrgica da Lilith e o jogo virou completamente.",
    estrelas: 5,
  },
  {
    nome: "C. A., 26 anos",
    cidade: "Curitiba, PR",
    modulo: "Pós-Encontro & Atração",
    texto:
      "Sempre fui muito ansiosa depois de sair com alguém e acabava sufocando. Usei a ficha de Pós-Encontro e mandei exatamente a provocação leve que a Lilith escreveu. O cara ficou obcecado querendo marcar o segundo encontro logo na manhã seguinte!",
    estrelas: 5,
  },
  {
    nome: "L. G., 31 anos",
    cidade: "Fortaleza, CE",
    modulo: "Oráculo & Mapa Mental do Signo",
    texto:
      "A análise do Mapa Astral psicológico da minha ex de Escorpião me deu até arrepio de tão precisa. Entendi por que ela se fechava quando eu cobrava definição e usei o gatilho certo para destravar a conversa sem gerar defesa.",
    estrelas: 5,
  },
  {
    nome: "B. T., 27 anos",
    cidade: "Rio de Janeiro, RJ",
    modulo: "Consultoria da Lilith",
    texto:
      "Só de entender como funciona o vácuo magnético e o que postar nos stories já valeu cada centavo. Parei de passar vergonha postando indireta e em menos de duas semanas quem terminou comigo veio puxar assunto perguntando da minha vida.",
    estrelas: 5,
  },
  {
    nome: "F. M., 36 anos",
    cidade: "Porto Alegre, RS",
    modulo: "Primeiro Contato",
    texto:
      "Eu travava na hora de chamar alguém interessante no Instagram sem parecer mais um elogiando foto. Coloquei os detalhes do story dela na ferramenta de Primeiro Contato e a abertura que a Lilith criou rendeu horas de conversa logo de cara.",
    estrelas: 5,
  },
];

export default function Home() {
  const [tracksOpen, setTracksOpen] = useState(false);

  useEffect(() => {
    fetch("/api/affiliate/config")
      .then((r) => r.json())
      .then((cfg) => {
        if (cfg?.tracksOpen) setTracksOpen(true);
      })
      .catch(() => {});
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center bg-stone-50 text-stone-800 dark:bg-[#140a0f] dark:text-stone-200 font-sans selection:bg-rose-200 selection:text-rose-900">
      <Navbar />

      <div className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-gradient-to-b from-rose-100/70 via-orange-50/40 to-transparent dark:from-rose-500/10 dark:via-rose-500/5 dark:to-transparent" />

        <div className="relative w-full max-w-5xl px-6 py-12 sm:py-20 mx-auto flex flex-col items-center">

          {/* Hero */}
          <div className="text-center max-w-3xl mb-14 mt-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 dark:bg-rose-500/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-rose-700 dark:text-rose-300 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              Inteligência emocional guiada por IA
            </span>

            <h1 className="text-5xl sm:text-7xl font-serif font-bold tracking-tight text-stone-900 dark:text-stone-50 mb-6">
              LilithLove
            </h1>
            <p className="text-lg sm:text-xl leading-relaxed text-stone-600 dark:text-stone-300 mb-10">
              Sua conselheira amorosa e guia de inteligência emocional.
              Um espaço seguro e acolhedor para todas as formas de amar.
              Analise conversas, melhore seus relacionamentos e saiba exatamente como agir.
            </p>

            {/* Botões de Ação Rápida com Ícones Vetoriais de IA e sem contornos pesados */}
            <div className="flex flex-wrap justify-center gap-3.5 mt-4">
              <Link
                href="/chat/lilith?action=conselho"
                className="px-6 py-3.5 bg-gradient-to-r from-rose-900/90 to-rose-800/90 hover:from-rose-800 hover:to-rose-700 text-rose-50 rounded-2xl font-semibold text-sm transition-all shadow-lg shadow-rose-950/30 flex items-center gap-2.5"
              >
                <svg className="w-4 h-4 text-rose-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Preciso de um conselho</span>
              </Link>

              <Link
                href="/chat/lilith?action=analise"
                className="px-6 py-3.5 bg-amber-500/15 dark:bg-[#2a1710] hover:bg-amber-500/25 dark:hover:bg-[#381f15] text-amber-950 dark:text-amber-200 rounded-2xl font-semibold text-sm transition-all shadow-sm flex items-center gap-2.5"
              >
                <svg className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <span>Analisar uma conversa</span>
              </Link>

              <Link
                href="/chat/lilith?action=responder"
                className="px-6 py-3.5 bg-stone-200/70 dark:bg-white/[0.07] hover:bg-stone-300/70 dark:hover:bg-white/[0.12] text-stone-800 dark:text-stone-100 rounded-2xl font-semibold text-sm transition-all shadow-sm flex items-center gap-2.5"
              >
                <svg className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>O que respondo agora?</span>
              </Link>
            </div>
          </div>

          {/* Ferramentas Inteligentes (Com Ícones Vetoriais SaaS IA) */}
          <div className="w-full mt-10">
            <h2 className="text-3xl font-serif font-semibold text-stone-800 dark:text-stone-100 mb-8 text-center">
              Ferramentas Inteligentes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1 - Primeiro Contato */}
              <Link
                href="/chat/lilith?action=primeiro_contato"
                className="bg-white dark:bg-white/[0.04] p-8 rounded-3xl shadow-sm border border-stone-200/60 dark:border-white/[0.07] hover:border-rose-500/30 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-start group"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-rose-600 dark:text-rose-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-stone-800 dark:text-stone-100">Primeiro Contato</h3>
                <p className="text-stone-500 dark:text-stone-300 leading-relaxed">
                  Mensagens e abordagens perfeitas para puxar assunto e gerar interesse real e recíproco.
                </p>
              </Link>

              {/* Card 2 - Detector de Red Flags */}
              <Link
                href="/chat/lilith?action=red_flags"
                className="bg-white dark:bg-white/[0.04] p-8 rounded-3xl shadow-sm border border-stone-200/60 dark:border-white/[0.07] hover:border-rose-500/30 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-start group"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-rose-600 dark:text-rose-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-stone-800 dark:text-stone-100">Detector de Red Flags</h3>
                <p className="text-stone-500 dark:text-stone-300 leading-relaxed">
                  Analise o perfil e o comportamento nas mensagens para identificar sinais de alerta precocemente.
                </p>
              </Link>

              {/* Card 3 - Pós-Encontro */}
              <Link
                href="/chat/lilith?action=pos_encontro"
                className="bg-white dark:bg-white/[0.04] p-8 rounded-3xl shadow-sm border border-stone-200/60 dark:border-white/[0.07] hover:border-rose-500/30 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-start group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-amber-600 dark:text-amber-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-stone-800 dark:text-stone-100">Pós-Encontro</h3>
                <p className="text-stone-500 dark:text-stone-300 leading-relaxed">
                  Saiba exatamente o que mandar depois de sair para manter a conexão viva sem parecer desesperado(a).
                </p>
              </Link>

              {/* Card 4 - Oráculo do Amor & Sinastria (Agora na posição 4 lateral) */}
              <Link
                href="/chat/mistico"
                className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/60 dark:to-indigo-950/50 p-8 rounded-3xl shadow-sm border border-purple-200 dark:border-purple-400/25 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-start relative overflow-hidden group w-full"
              >
                <div className="absolute top-6 right-6 bg-purple-900 dark:bg-purple-500 text-purple-50 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                  Astrologia & Tarot
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-400/25 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-purple-700 dark:text-purple-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-50 mb-3">
                  Oráculo do Amor & Sinastria
                </h3>
                <p className="text-purple-800/80 dark:text-purple-100/90 leading-relaxed">
                  Descubra a compatibilidade dos signos, o Mapa Mental do parceiro(a) e faça tiragens de cartas.
                </p>
              </Link>

              {/* Card 5 - DESTAQUE PRINCIPAL (LARGURA TOTAL): Reconectar / Reconquistar */}
              <Link
                href="/chat/reconquista"
                className="md:col-span-2 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/75 dark:via-[#2b0916] dark:to-orange-950/60 p-8 sm:p-9 rounded-3xl shadow-md border border-rose-200 dark:border-rose-400/35 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-start relative overflow-hidden group w-full"
              >
                <div className="absolute top-6 right-6 bg-rose-900 dark:bg-rose-500 text-rose-50 text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                  Alta Eficácia • Módulo Urgente
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-rose-700 dark:text-rose-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-serif font-bold text-rose-950 dark:text-rose-50 mb-3">
                  Reconectar / Reconquistar
                </h3>
                <p className="text-rose-900/80 dark:text-rose-100/90 leading-relaxed max-w-3xl">
                  O módulo de emergência para reverter términos e esfriamentos. Diagnóstico comportamental completo, protocolo de Contato Zero, repaginação de postura e a mensagem cirúrgica para reativar a saudade sem parecer carente.
                </p>
              </Link>
            </div>
          </div>

          {/* Trilhas de Aprendizado (Quando ativo no Admin) */}
          {tracksOpen && (
            <div className="w-full mt-20 pt-16 border-t border-stone-200 dark:border-white/10 text-center">
              <span className="text-rose-600 dark:text-rose-300 font-semibold tracking-wider uppercase text-sm mb-4 block">
                Exclusivo Assinantes • Aulas & Guias
              </span>
              <h2 className="text-3xl font-serif font-semibold text-stone-800 dark:text-stone-100 mb-8">
                Trilhas de Desenvolvimento
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/trilhas?track=amor_proprio" className="px-6 py-4 bg-white dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-white/10 transition-colors border border-stone-100 dark:border-white/10 shadow-sm rounded-2xl text-stone-600 dark:text-stone-300 font-medium">Ame a Si Mesmo Primeiro</Link>
                <Link href="/trilhas?track=contato_zero" className="px-6 py-4 bg-white dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-white/10 transition-colors border border-stone-100 dark:border-white/10 shadow-sm rounded-2xl text-stone-600 dark:text-stone-300 font-medium">Contato Zero na Prática</Link>
                <Link href="/trilhas?track=confianca" className="px-6 py-4 bg-white dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-white/10 transition-colors border border-stone-100 dark:border-white/10 shadow-sm rounded-2xl text-stone-600 dark:text-stone-300 font-medium">Desperte sua Confiança</Link>
              </div>
            </div>
          )}

          {/* DEPOIMENTOS DE QUEM VIROU O JOGO */}
          <div className="w-full mt-20 pt-16 border-t border-stone-200 dark:border-white/10">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-amber-600 dark:text-amber-400 font-semibold tracking-wider uppercase text-xs sm:text-sm mb-2 block">
                Histórias Reais • Sigilo Total
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-white mb-3">
                Quem seguiu a estratégia, virou o jogo
              </h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base">
                Veja o que aconteceu quando nossos assinantes pararam de agir no impulso e aplicaram o diagnóstico da LilithLove.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {DEPOIMENTOS.map((dep, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-stone-100 dark:border-white/10 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex text-amber-400 text-sm">
                        {"★★★★★"}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300">
                        {dep.modulo}
                      </span>
                    </div>
                    <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed italic mb-5">
                      &ldquo;{dep.texto}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-white/10 text-xs">
                    <span className="font-bold text-stone-800 dark:text-stone-100">
                      {dep.nome}
                    </span>
                    <span className="text-stone-400 dark:text-stone-500">
                      {dep.cidade} • Assinante VIP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-4xl mx-auto mt-12">
            <AdBanner format="horizontal" slotId="HOME_BOTTOM_SLOT" />
          </div>

        </div>
      </div>

      {/* RODAPÉ INSTITUCIONAL & AVISO LEGAL DE IA */}
      <footer className="w-full border-t border-stone-200 dark:border-white/10 bg-white/60 dark:bg-[#10070b] mt-10 py-10 px-6 text-center text-xs text-stone-500 dark:text-stone-400">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 font-semibold text-stone-700 dark:text-stone-300">
            <Link href="/sobre" className="hover:text-rose-600 transition-colors">Como Funciona</Link>
            <Link href="/planos" className="hover:text-rose-600 transition-colors">Planos VIP</Link>
            {tracksOpen && (
              <Link href="/trilhas" className="hover:text-rose-600 transition-colors">Aulas & Guias</Link>
            )}
            <Link href="/termos" className="hover:text-rose-600 transition-colors">Termos de Uso</Link>
            <Link href="/privacidade" className="hover:text-rose-600 transition-colors">Política de Privacidade</Link>
            <Link href="/contato" className="hover:text-rose-600 transition-colors">Contato</Link>
          </div>

          <p className="max-w-3xl mx-auto leading-relaxed text-[11px] opacity-80">
            <strong>Aviso Legal e Isenção de Responsabilidade:</strong> A LilithLove utiliza inteligência artificial para fornecer análises comportamentais, sugestões estratégicas e entretenimento. As orientações não substituem acompanhamento psicológico ou médico profissional. Como relacionamentos dependem da vontade e livre-arbítrio de terceiros, não garantimos 100% de eficácia ou resultados específicos. Plataforma exclusiva para maiores de 18 anos.
          </p>

          <p className="text-[11px] opacity-60">
            © {new Date().getFullYear()} LilithLove. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  );
}