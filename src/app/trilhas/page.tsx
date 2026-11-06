"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

interface Lesson {
  id: string;
  number: number;
  title: string;
  duration: string;
  isFree: boolean;
  videoUrl: string;
  summary: string;
  ebookChapters: {
    heading: string;
    content: string;
    highlight?: string;
  }[];
}

interface Track {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  badge: string;
  lessons: Lesson[];
}

const TRACKS: Track[] = [
  {
    id: "contato_zero",
    icon: "🛑",
    title: "Contato Zero na Prática",
    subtitle: "O protocolo psicológico para cortar a dependência, inverter a dinâmica de poder e ativar a saudade.",
    badge: "Módulo Mais Acessado",
    lessons: [
      {
        id: "cz_1",
        number: 1,
        title: "A Neurociência da Ausência: Por que implorar destrói a atração",
        duration: "Aula 01 • Gratuita",
        isFree: true,
        videoUrl: "",
        summary:
          "Entenda o que acontece no cérebro da outra pessoa quando você some sem dar explicações e por que o silêncio é a resposta mais barulhenta que existe.",
        ebookChapters: [
          {
            heading: "1. O Efeito Sufocamento vs. O Vácuo Magnético",
            content:
              "Quando alguém termina ou esfria com você, essa pessoa já espera que você vá correr atrás, mandar textos grandes, pedir explicações ou tentar 'conversar para resolver'. Enquanto você age como o esperado, o cérebro dela sente alívio e certeza de que tem você na mão.\n\nO Contato Zero não é um 'joguinho de gelo': é a retirada imediata do suprimento de validação que você dava de graça.",
            highlight:
              "Regra de Ouro: Ninguém sente falta de quem está sempre disponível na porta esperando.",
          },
          {
            heading: "2. As 3 Fases na Mente de Quem Terminou",
            content:
              "• Fase 1 (Dias 1 a 5 — O Alívio e o Orgulho): A pessoa acha que você vai ligar a qualquer momento. Se você não liga, o alívio vira estranheza.\n• Fase 2 (Dias 6 a 14 — A Dúvida e a Curiosidade): Ela começa a olhar seus stories, perguntar indiretamente ou checar se você está sofrendo.\n• Fase 3 (Dias 15 a 30 — O Medo da Perda Real): Quando percebe que você seguiu em frente e não está na lama, o gatilho de escassez dispara.",
          },
          {
            heading: "3. O que fazer nas primeiras 72 horas",
            content:
              "Zero mensagens, zero curtidas, zero indiretas ou músicas tristes nos stories. Se a pessoa mandar algo puramente burocrático (ex: devolver um objeto), responda em no máximo 4 palavras, de forma educada, neutra e sem puxar assunto.",
          },
        ],
      },
      {
        id: "cz_2",
        number: 2,
        title: "Guerra Silenciosa nos Stories: O que postar (e o que jamais postar)",
        duration: "Aula 02 • Exclusivo VIP",
        isFree: false,
        videoUrl: "",
        summary:
          "Como usar suas redes sociais para gerar dúvida e desejo na mente do(a) ex sem parecer que você está forçando uma vida perfeita.",
        ebookChapters: [
          {
            heading: "1. O Erro Mortal das Indiretas",
            content:
              "Postar frases de superação, indiretas sobre ingratidão ou fotos forçadas em baladas logo após o término grita para a outra pessoa: 'Eu ainda estou tentando chamar sua atenção'. A verdadeira indiferença é leve e misteriosa.",
          },
          {
            heading: "2. A Técnica do 'Recorte de Bastidor'",
            content:
              "Poste apenas fragmentos do seu dia que deixem uma pergunta no ar: um prato em um restaurante diferente sem mostrar quem está na frente, um treino focado, um livro novo ou um projeto pessoal.\n\nNunca entregue onde você está, com quem está e o que está sentindo tudo no mesmo story.",
            highlight:
              "O segredo não é mostrar que você já tem outra pessoa, mas fazer ela duvidar se está perdendo espaço na sua vida.",
          },
        ],
      },
      {
        id: "cz_3",
        number: 3,
        title: "Testes de Migalha (Breadcrumbing): Como agir quando a pessoa reaparece",
        duration: "Aula 03 • Exclusivo VIP",
        isFree: false,
        videoUrl: "",
        summary:
          "Ela curtiu seu story ou mandou um 'Oi, sumido(a)'? Aprenda a não entregar o ouro na primeira isca.",
        ebookChapters: [
          {
            heading: "1. Diferenciando Isca de Ego vs. Arrependimento Real",
            content:
              "Reagir com foguinho no story, mandar um meme ou perguntar 'Tudo bem?' às 23h é apenas um teste de coleira: a pessoa quer saber se você ainda abana o rabo quando ela assobia.",
          },
          {
            heading: "2. A Regra do Espelho com Atraso",
            content:
              "Se a pessoa mandou uma migalha curta, nunca responda com um parágrafo empolgado. Espere algumas horas, responda no mesmo tom leve e encerre a conversa primeiro. Faça ela investir esforço real para ter sua atenção de volta.",
          },
        ],
      },
    ],
  },
  {
    id: "amor_proprio",
    icon: "✨",
    title: "Ame a Si Mesmo Primeiro",
    subtitle: "Como blindar seu emocional contra a carência, parar de mendigar afeto e se tornar o prêmio da relação.",
    badge: "Reconstrução Emocional",
    lessons: [
      {
        id: "ap_1",
        number: 1,
        title: "Desintoxicação de Dopamina: Como parar de checar o WhatsApp a cada 5 minutos",
        duration: "Aula 01 • Gratuita",
        isFree: true,
        videoUrl: "",
        summary:
          "Por que a rejeição dói fisicamente no peito e o método prático para desligar o loop de ansiedade hoje.",
        ebookChapters: [
          {
            heading: "1. Você não está sentindo falta da pessoa, está em abstinência química",
            content:
              "Quando alguém é imprevisível com você (uma hora dá carinho, outra hora fica frio), o seu cérebro libera picos de dopamina iguais aos de um cassino. Você vicia na espera pela notificação.",
            highlight:
              "Entender que essa angústia é um reflexo químico — e não 'amor da sua vida' — devolve o volante para as suas mãos.",
          },
          {
            heading: "2. O Protocolo do Silenciamento Físico",
            content:
              "Arquive a conversa imediatamente e tire as notificações. Toda vez que o dedo for no automático abrir o perfil da pessoa, substitua por uma ação física de 2 minutos (beber água gelada, caminhar, anotar no bloco de notas o motivo pelo qual você merece reciprocidade).",
          },
        ],
      },
      {
        id: "ap_2",
        number: 2,
        title: "A Síndrome do Salvador e o Fim da Carência",
        duration: "Aula 02 • Exclusivo VIP",
        isFree: false,
        videoUrl: "",
        summary:
          "Por que ser 'bonzinho(a) demais' e resolver todos os problemas do outro faz a admiração despencar.",
        ebookChapters: [
          {
            heading: "1. Amor não é caridade",
            content:
              "Quando você perdoa faltas de respeito repetidas, cancela seus compromissos na hora que a pessoa chama e aceita menos do que o mínimo, você ensina ao outro que o seu tempo vale zero.",
          },
          {
            heading: "2. Construindo Limites Inegociáveis",
            content:
              "Pessoas de alto valor não fazem barraco nem mandam textão cobrando: elas simplesmente retiram a presença quando o tratamento cai abaixo do padrão.",
          },
        ],
      },
    ],
  },
  {
    id: "confianca",
    icon: "🔥",
    title: "Desperte sua Confiança & Magnetismo",
    subtitle: "Postura, comunicação não-verbal e a arte de gerar tensão e interesse sem parecer forçado(a).",
    badge: "Alto Valor & Sedução",
    lessons: [
      {
        id: "cf_1",
        number: 1,
        title: "A Lei do Menor Esforço: Quem investe mais, perde o poder",
        duration: "Aula 01 • Gratuita",
        isFree: true,
        videoUrl: "",
        summary:
          "Como equilibrar a balança da conversa para que a outra pessoa sinta vontade de conquistar sua aprovação.",
        ebookChapters: [
          {
            heading: "1. O Termômetro do Investimento no Chat",
            content:
              "Olhe para a tela do seu WhatsApp agora: se os seus balões de mensagem têm 8 linhas e os da outra pessoa têm 3 palavras ('Sim', 'Entendi', 'Que bom'), a balança de poder está quebrada.",
            highlight:
              "Atração precisa de espaço para respirar. Se você preenche 100% do espaço, o outro recua.",
          },
          {
            heading: "2. A Técnica do Puxa-Empurra (Push-Pull)",
            content:
              "Em vez de elogiar de forma direta e previsível, combine validação com um leve desafio divertido. Exemplo: 'Você até que tem bom gosto pra música, pena que é teimoso(a) demais pra admitir que minha playlist ganha'. Isso tira você da prateleira das pessoas comuns.",
          },
        ],
      },
      {
        id: "cf_2",
        number: 2,
        title: "Domínio de Presença no Encontro Presencial",
        duration: "Aula 02 • Exclusivo VIP",
        isFree: false,
        videoUrl: "",
        summary:
          "Olhar, pausas na fala e como criar uma conexão magnética nos primeiros 15 minutos de encontro.",
        ebookChapters: [
          {
            heading: "1. O Poder das Pausas e do Olhar Triangular",
            content:
              "Pessoas ansiosas falam rápido demais para preencher o silêncio. Quando estiver frente a frente, sustente o olhar por 3 segundos em silêncio com um leve sorriso antes de responder uma pergunta. O silêncio confortável cria tensão imediata.",
          },
          {
            heading: "2. Encerrando no Ponto Alto",
            content:
              "Nunca estique o primeiro encontro até o assunto acabar e vocês ficarem cansados. Termine a noite quando a conversa estiver no ápice da diversão — isso deixa o cérebro da outra pessoa querendo o 'próximo episódio'.",
          },
        ],
      },
    ],
  },
];

export default function TrilhasPage() {
  const [selectedTrackId, setSelectedTrackId] = useState<string>("contato_zero");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("cz_1");
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [showVipModal, setShowVipModal] = useState<boolean>(false);
  const [customVideos, setCustomVideos] = useState<Record<string, string>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trackParam = params.get("track");
    if (trackParam && TRACKS.some((t) => t.id === trackParam)) {
      setSelectedTrackId(trackParam);
      const found = TRACKS.find((t) => t.id === trackParam);
      if (found && found.lessons.length > 0) {
        setSelectedLessonId(found.lessons[0].id);
      }
    }

    if (localStorage.getItem("lilith_vip_test") === "true") {
      setIsPremium(true);
    }
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => {
        if (d.isPremium) setIsPremium(true);
      })
      .catch(() => {});

    // Busca os links de vídeo que você configurou lá no Painel Admin
    fetch("/api/affiliate/config")
      .then((r) => r.json())
      .then((cfg) => {
        if (cfg?.lessonVideos && typeof cfg.lessonVideos === "object") {
          setCustomVideos(cfg.lessonVideos);
        }
      })
      .catch(() => {});
  }, []);

  const currentTrack = TRACKS.find((t) => t.id === selectedTrackId) || TRACKS[0];
  const currentLesson =
    currentTrack.lessons.find((l) => l.id === selectedLessonId) || currentTrack.lessons[0];

  // Prioriza o link salvo no Painel Admin; se não tiver, usa o padrão
  const activeVideoUrl = (customVideos[currentLesson.id] || currentLesson.videoUrl || "").trim();

  const handleSelectTrack = (track: Track) => {
    setSelectedTrackId(track.id);
    setSelectedLessonId(track.lessons[0].id);
  };

  const handleSelectLesson = (lesson: Lesson) => {
    if (!lesson.isFree && !isPremium) {
      setShowVipModal(true);
      return;
    }
    setSelectedLessonId(lesson.id);
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#faf7f5] text-stone-800 dark:bg-[#140a0f] dark:text-stone-200 font-sans transition-colors">
      <Navbar />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-stone-200 dark:border-white/10">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-2">
              <span>🎓</span> Academia LilithLove • Vídeo & Guia Prático
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-white">
              Trilhas de Desenvolvimento
            </h1>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
              Aulas objetivas e manuais de bolso para você dominar o jogo emocional, cortar a ansiedade e agir com precisão.
            </p>
          </div>

          <Link
            href="/chat/lilith"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-rose-900 hover:bg-rose-800 dark:bg-rose-600 dark:hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors shrink-0"
          >
            <span>💬</span> Tirar Dúvida com a Lilith
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {TRACKS.map((track) => {
            const isSelected = track.id === currentTrack.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => handleSelectTrack(track)}
                className={`text-left p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-gradient-to-br from-rose-900 to-rose-800 text-white border-rose-700 shadow-lg scale-[1.01]"
                    : "bg-white dark:bg-white/5 text-stone-800 dark:text-stone-200 border-stone-200/80 dark:border-white/10 hover:border-rose-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-2xl p-2 rounded-2xl bg-black/10 dark:bg-white/10">
                      {track.icon}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                        isSelected
                          ? "bg-white/20 text-rose-50"
                          : "bg-rose-100 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300"
                      }`}
                    >
                      {track.badge}
                    </span>
                  </div>
                  <h2 className="text-lg font-serif font-bold mb-1">{track.title}</h2>
                  <p
                    className={`text-xs leading-relaxed ${
                      isSelected ? "text-rose-100/90" : "text-stone-500 dark:text-stone-400"
                    }`}
                  >
                    {track.subtitle}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-semibold">
                  <span>{track.lessons.length} Módulos (Vídeo + E-book)</span>
                  <span>{isSelected ? "● Selecionado" : "Abrir →"}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 bg-white dark:bg-[#1c1016] rounded-3xl border border-stone-200/80 dark:border-rose-400/15 p-5 shadow-sm">
            <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white mb-1">
              Módulos da Trilha
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
              A Aula 01 de cada trilha é liberada gratuitamente.
            </p>

            <div className="space-y-2.5">
              {currentTrack.lessons.map((lesson) => {
                const locked = !lesson.isFree && !isPremium;
                const active = lesson.id === currentLesson.id;
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => handleSelectLesson(lesson)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                      active
                        ? "bg-rose-50 dark:bg-rose-500/15 border-rose-300 dark:border-rose-400/40 text-rose-950 dark:text-rose-100"
                        : "bg-stone-50/70 dark:bg-white/5 border-transparent hover:bg-stone-100 dark:hover:bg-white/10 text-stone-700 dark:text-stone-300"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        locked
                          ? "bg-stone-200 dark:bg-white/10 text-stone-500"
                          : active
                          ? "bg-rose-900 dark:bg-rose-600 text-white"
                          : "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300"
                      }`}
                    >
                      {locked ? "🔒" : lesson.number}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold leading-snug mb-1">
                        {lesson.title}
                      </p>
                      <span
                        className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          lesson.isFree
                            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                            : "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300"
                        }`}
                      >
                        {lesson.duration}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white dark:bg-[#1c1016] rounded-3xl border border-stone-200/80 dark:border-rose-400/15 overflow-hidden shadow-sm">
            {/* PLAYER DE VÍDEO PROTEGIDO (Lê link .mp4 direto sem download ou Vimeo configurado no Admin) */}
            <div className="w-full aspect-video bg-gradient-to-br from-[#260710] via-[#18050b] to-[#0f0307] relative flex items-center justify-center border-b border-stone-200 dark:border-white/10">
              {activeVideoUrl ? (
                activeVideoUrl.includes(".mp4") || activeVideoUrl.includes(".webm") ? (
                  <video
                    src={activeVideoUrl}
                    controls
                    controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <iframe
                    src={activeVideoUrl}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={currentLesson.title}
                  />
                )
              ) : (
                <div className="text-center px-6 max-w-lg">
                  <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner">
                    {currentTrack.icon}
                  </div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-rose-500/20 text-rose-200 border border-rose-400/30 mb-2">
                    Módulo {currentLesson.number} • Guia Interativo
                  </span>
                  <h3 className="text-lg sm:text-2xl font-serif font-bold text-white leading-snug">
                    {currentLesson.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-rose-100/70 mt-2">
                    Leia abaixo o manual estratégico completo deste módulo.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
                    📖 Guia Prático de Bolso
                  </span>
                  <span className="text-xs text-stone-400">•</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    Leitura rápida de 2 min
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white mb-2">
                  {currentLesson.title}
                </h2>
                <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
                  {currentLesson.summary}
                </p>
              </div>

              <div className="space-y-5 pt-2">
                {currentLesson.ebookChapters.map((cap, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-stone-50/80 dark:bg-white/[0.03] border border-stone-200/70 dark:border-white/10 space-y-3"
                  >
                    <h4 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-rose-200">
                      {cap.heading}
                    </h4>
                    <p className="text-sm sm:text-[15px] text-stone-700 dark:text-stone-300 whitespace-pre-line leading-relaxed">
                      {cap.content}
                    </p>
                    {cap.highlight && (
                      <div className="p-3.5 rounded-xl bg-rose-100/70 dark:bg-rose-500/15 border-l-4 border-rose-700 dark:border-rose-400 text-xs sm:text-sm font-semibold text-rose-950 dark:text-rose-200">
                        💡 {cap.highlight}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-rose-950 to-[#2b0712] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-serif font-bold text-base sm:text-lg text-amber-300">
                    Quer aplicar esta aula no seu caso específico?
                  </p>
                  <p className="text-xs sm:text-sm text-rose-100/90">
                    Abra o chat e peça para a IA adaptar essa estratégia para a sua situação atual.
                  </p>
                </div>
                <Link
                  href={currentTrack.id === "contato_zero" ? "/chat/reconquista" : "/chat/lilith"}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs sm:text-sm text-center shrink-0 shadow transition-colors"
                >
                  Aplicar no Meu Caso Agora →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showVipModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1c1016] border border-rose-200 dark:border-rose-400/20 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowVipModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 dark:bg-white/10 flex items-center justify-center text-stone-600 dark:text-stone-300 font-bold"
            >
              ✕
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-2xl mb-4">
              👑
            </div>

            <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
              Conteúdo Exclusivo Assinantes
            </span>
            <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mt-1 mb-2">
              Desbloqueie Todas as Aulas & Guias
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-6">
              Este módulo avançado é exclusivo para membros <strong>VIP Premium</strong>. Ao assinar, você libera todas as trilhas, vídeos, manuais práticos e conversas ilimitadas com as 3 IAs da LilithLove.
            </p>

            <Link
              href="/planos"
              className="w-full py-3.5 px-6 bg-gradient-to-r from-rose-900 to-rose-700 hover:from-rose-800 hover:to-rose-600 text-white font-bold text-center rounded-2xl shadow-lg block transition-all"
            >
              Ver Planos e Liberar Acesso Total →
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}