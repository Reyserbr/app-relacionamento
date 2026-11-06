"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

interface Attachment {
  name: string;
  mimeType: string;
  data: string;
  previewUrl: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachment?: Attachment;
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: Message[];
  bonusLimit?: number;
}

const STORAGE_KEY = "lilithlove_reconquista_v1";
const CLOUD_KEY = "reconquista";
const CHECKOUT_URL = "/planos";

export default function ReconquistaChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [bonusLimit, setBonusLimit] = useState<number>(0);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estados do Gravador de Áudio
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Estados do Questionário de Reconquista
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [quiz, setQuiz] = useState({
    duracao: "",
    trabalho: "",
    idadesGeneros: "",
    convivio: "",
    historico: "",
    motivoQuemTerminou: "",
    tempoSemFalar: "",
    houveMensagens: "",
    redesSociais: "",
    ultimaConversa: "",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const BASE_FREE_LIMIT = 5;
  const totalAllowed = BASE_FREE_LIMIT + bonusLimit;
  const assistantRepliesCount = messages.filter((m) => m.role === "assistant").length;
  const isLimitReached = !isPremium && assistantRepliesCount >= totalAllowed;

  // Carrega histórico local e sincroniza com a Nuvem (PC <-> Celular)
  useEffect(() => {
    let localSessions: ChatSession[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) localSessions = JSON.parse(raw);
    } catch (_) {}

    if (localSessions.length > 0) {
      setSessions(localSessions);
      setActiveSessionId(localSessions[0].id);
      setMessages(localSessions[0].messages);
      setBonusLimit(localSessions[0].bonusLimit || 0);
      if (localSessions[0].messages.length === 0) setShowQuestionnaire(true);
    } else {
      createNewSession([], false);
      setShowQuestionnaire(true);
    }

    // Busca casos salvos na nuvem da mesma conta
    fetch(`/api/history?key=${CLOUD_KEY}`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.sessions) && d.sessions.length > 0) {
          const hasCloudMessages = d.sessions.some((s: ChatSession) => s.messages?.length > 0);
          const hasLocalMessages = localSessions.some((s) => s.messages?.length > 0);
          if (hasCloudMessages && (!hasLocalMessages || d.sessions.length >= localSessions.length)) {
            setSessions(d.sessions);
            setActiveSessionId(d.sessions[0].id);
            setMessages(d.sessions[0].messages || []);
            setBonusLimit(d.sessions[0].bonusLimit || 0);
            setShowQuestionnaire((d.sessions[0].messages || []).length === 0);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(d.sessions));
            } catch (_) {}
          }
        }
      })
      .catch(() => {});

    if (localStorage.getItem("lilith_vip_test") === "true") {
      setIsPremium(true);
    }
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => {
        if (d.isPremium) setIsPremium(true);
      })
      .catch(() => {});
  }, []);

  const syncToCloud = (nextSessions: ChatSession[]) => {
    fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: CLOUD_KEY, sessions: nextSessions }),
    }).catch(() => {});
  };

  const saveToHistory = (updatedMsgs: Message[], newBonus = bonusLimit) => {
    setSessions((prev) => {
      const firstUserMsg = updatedMsgs.find((m) => m.role === "user")?.content || "Caso de Reconquista";
      const cleanTitle = firstUserMsg.replace(/^📋\s*DIAGNÓSTICO:\s*/i, "").slice(0, 34) + (firstUserMsg.length > 34 ? "..." : "");

      const lightMessages = updatedMsgs.map((m) =>
        m.attachment ? { ...m, attachment: undefined } : m
      );

      const updatedSession: ChatSession = {
        id: activeSessionId || Date.now().toString(),
        title: updatedMsgs.length > 0 ? cleanTitle : "Caso de Reconquista",
        updatedAt: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
        messages: lightMessages,
        bonusLimit: newBonus,
      };

      const exists = prev.some((s) => s.id === updatedSession.id);
      const nextSessions = exists
        ? prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
        : [updatedSession, ...prev];

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSessions));
      } catch (_) {}

      syncToCloud(nextSessions);
      return nextSessions;
    });
  };

  const createNewSession = (currentList = sessions, openQuiz = true) => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: "Caso de Reconquista",
      updatedAt: "Agora",
      messages: [],
      bonusLimit: 0,
    };
    const updated = [newSession, ...currentList];
    setSessions(updated);
    setActiveSessionId(newId);
    setMessages([]);
    setBonusLimit(0);
    setIsSidebarOpen(false);
    if (openQuiz) setShowQuestionnaire(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (_) {}
    syncToCloud(updated);
  };

  const selectSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setBonusLimit(session.bonusLimit || 0);
    setIsSidebarOpen(false);
    setShowQuestionnaire(session.messages.length === 0);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (_) {}
    syncToCloud(filtered);

    if (activeSessionId === id) {
      if (filtered.length > 0) {
        selectSession(filtered[0]);
      } else {
        createNewSession([]);
      }
    }
  };

  const handleUnlockAdBonus = () => {
    setIsWatchingAd(true);
    setTimeout(() => {
      const nextBonus = bonusLimit + 3;
      setBonusLimit(nextBonus);
      saveToHistory(messages, nextBonus);
      setIsWatchingAd(false);
      setShowPaywallModal(false);
    }, 2500);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Processa arquivo de imagem/áudio/vídeo (usado tanto no clipe quanto no Ctrl+V)
  const processFile = (file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      alert("O arquivo é muito grande! Envie um print, áudio ou vídeo curto de até 4MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(",")[1];
      setAttachment({
        name: file.name || `print-${Date.now()}.png`,
        mimeType: file.type || "image/png",
        data: base64Data,
        previewUrl: result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    e.target.value = "";
  };

  // Permite colar Print direto com Ctrl+V no PC ou "Colar" no celular
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/") || items[i].type.startsWith("audio/")) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          processFile(file);
          return;
        }
      }
    }
  };

  // Gravador de Áudio pelo Microfone
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const mimeType = recorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const file = new File([audioBlob], `desabafo-voz.webm`, { type: mimeType });
        processFile(file);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      alert("Permita o acesso ao microfone no navegador para gravar seu desabafo em áudio.");
    }
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatText = (text: string) => {
    const cleanText = text.replace(/^#{1,4}\s*/gm, "");
    const tokens = cleanText.split(/(\*\*.*?\*\*|\*[^*\n]+?\*)/g);
    return tokens.map((token, index) => {
      if (token.startsWith("**") && token.endsWith("**")) {
        return (
          <strong key={index} className="font-semibold text-rose-950 dark:text-rose-300">
            {token.slice(2, -2)}
          </strong>
        );
      }
      if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
        return (
          <em key={index} className="italic text-stone-700 dark:text-stone-300 font-medium">
            {token.slice(1, -1)}
          </em>
        );
      }
      return token;
    });
  };

  const sendRawMessage = async (textToSend: string, attachToSend: Attachment | null = null) => {
    if (isLimitReached) {
      setShowPaywallModal(true);
      return;
    }
    if ((!textToSend.trim() && !attachToSend) || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend.trim() || (attachToSend ? "Analise este arquivo/áudio do meu término." : ""),
      attachment: attachToSend || undefined,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    saveToHistory(updatedMessages);
    setInput("");
    setAttachment(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, agent: "reconquista", isPremium }),
      });

      const data = await res.json();

      const withReply: Message[] = [
        ...updatedMessages,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply || "Não consegui processar a resposta.",
        },
      ];
      setMessages(withReply);
      saveToHistory(withReply);
    } catch (err) {
      const withError: Message[] = [
        ...updatedMessages,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Oscilação momentânea na rede. Use o botão abaixo da sua mensagem para reenviar.",
        },
      ];
      setMessages(withError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await sendRawMessage(input, attachment);
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const partes: string[] = [];
    if (quiz.duracao) partes.push(`• Tempo de relação: ${quiz.duracao}`);
    if (quiz.idadesGeneros) partes.push(`• Idade e Gênero do casal: ${quiz.idadesGeneros}`);
    if (quiz.trabalho) partes.push(`• Rotina de trabalho: ${quiz.trabalho}`);
    if (quiz.convivio) partes.push(`• Como era o convívio e discussões: ${quiz.convivio}`);
    if (quiz.historico) partes.push(`• Outros términos ou traições: ${quiz.historico}`);
    if (quiz.motivoQuemTerminou) partes.push(`• Motivo do término e quem terminou: ${quiz.motivoQuemTerminou}`);
    if (quiz.tempoSemFalar) partes.push(`• Tempo sem conversar: ${quiz.tempoSemFalar}`);
    if (quiz.houveMensagens) partes.push(`• Tentativas de contato após término: ${quiz.houveMensagens}`);
    if (quiz.redesSociais) partes.push(`• Redes sociais e Stories: ${quiz.redesSociais}`);
    if (quiz.ultimaConversa) partes.push(`• Último registro de conversa: ${quiz.ultimaConversa}`);

    setShowQuestionnaire(false);

    if (partes.length === 0) return;

    const resumo = `📋 DIAGNÓSTICO DO MEU CASO DE RECONQUISTA:\n${partes.join("\n")}\n\nAnalise meu cenário com precisão e me diga qual é o diagnóstico e a estratégia ideal.`;
    await sendRawMessage(resumo, attachment);
  };

  return (
    <div className="fixed inset-0 flex h-[100dvh] w-full bg-[#faf7f5] dark:bg-[#140a0f] font-sans overflow-hidden transition-colors">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-[84%] max-w-xs lg:w-72 bg-white dark:bg-[#1c1016] border-r border-rose-100 dark:border-rose-400/15 flex flex-col transition-transform duration-200 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 border-b border-rose-100 dark:border-rose-400/15 flex items-center justify-between">
          <span className="font-serif font-bold text-stone-800 dark:text-stone-100 text-base">Meus Casos</span>
          <button
            onClick={() => createNewSession()}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-rose-900 dark:bg-rose-600 text-white hover:bg-rose-800 transition-colors"
          >
            + Novo Caso
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => selectSession(s)}
              className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all text-left border ${
                s.id === activeSessionId
                  ? "bg-rose-50/80 dark:bg-rose-500/15 border-rose-200 dark:border-rose-400/30 text-rose-950 dark:text-rose-200 font-medium"
                  : "bg-stone-50/60 dark:bg-white/5 border-transparent hover:bg-stone-100 dark:hover:bg-white/10 text-stone-700 dark:text-stone-300"
              }`}
            >
              <div className="truncate pr-2">
                <p className="text-xs truncate">{s.title}</p>
                <span className="text-[10px] text-stone-400 dark:text-stone-500">{s.updatedAt}</span>
              </div>
              {sessions.length > 1 && (
                <button
                  onClick={(e) => deleteSession(s.id, e)}
                  className="opacity-60 lg:opacity-0 lg:group-hover:opacity-100 text-stone-400 hover:text-rose-700 text-xs px-1.5"
                  title="Excluir caso"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-stone-100 dark:border-rose-400/15 text-[11px] text-stone-400 dark:text-stone-500 text-center">
          Sincronizado na sua conta (PC e Celular).
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <header className="relative z-20 flex items-center justify-between gap-1.5 px-2.5 sm:px-6 py-2.5 sm:py-3.5 bg-white/95 dark:bg-[#1c1016]/95 backdrop-blur-md border-b border-rose-100 dark:border-rose-400/15 shadow-sm shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-400/30 shrink-0"
            >
              <span>📂</span>
              <span>Casos ({sessions.length})</span>
            </button>
            <Link href="/" className="text-xs sm:text-sm font-medium px-2.5 py-1.5 rounded-full bg-stone-100 dark:bg-white/10 hover:bg-stone-200 transition-colors text-stone-700 dark:text-stone-200 shrink-0">
              ← Início
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-rose-900 to-orange-600 flex items-center justify-center text-white font-serif font-bold shadow-sm shrink-0">
                ❤️‍🩹
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-serif font-bold text-stone-900 dark:text-white leading-tight truncate text-sm sm:text-base">Reconquista</span>
                <span className="text-[10px] sm:text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowQuestionnaire(true)}
              className="hidden sm:inline-flex text-xs font-semibold px-3 py-1.5 rounded-full bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-200 hover:bg-rose-100 transition-colors"
            >
              📋 Ficha do Caso
            </button>
            <button
              onClick={() => {
                if (!isPremium) setShowPaywallModal(true);
              }}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3.5 py-1.5 rounded-full border transition-colors ${
                isPremium
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-400/40 cursor-default"
                  : "bg-rose-50 dark:bg-rose-500/15 text-rose-900 dark:text-rose-300 border-rose-200 dark:border-rose-400/30"
              }`}
            >
              <span>{isPremium ? "👑" : "✨"}</span>
              <span>
                {isPremium ? (
                  "VIP Ilimitado"
                ) : (
                  <>
                    <span className="hidden sm:inline">Mensagens: </span>
                    {Math.max(0, totalAllowed - assistantRepliesCount)}/{totalAllowed}
                  </>
                )}
              </span>
            </button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 max-w-4xl w-full mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-4">
              <div className="w-20 h-20 bg-gradient-to-tr from-rose-100 to-orange-50 dark:from-rose-500/20 dark:to-rose-900/10 border border-rose-200 dark:border-rose-400/20 rounded-full flex items-center justify-center text-4xl shadow-sm mb-2">
                ❤️‍🩹
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-800 dark:text-stone-100">
                Módulo de Reconquista e Alto Valor
              </h2>
              <p className="text-stone-500 dark:text-stone-400 max-w-md text-sm sm:text-base leading-relaxed">
                Preencha a ficha de diagnóstico para uma análise cirúrgica, grave um áudio desabafando ou cole o print da conversa (Ctrl+V).
              </p>
              <button
                onClick={() => setShowQuestionnaire(true)}
                className="px-5 py-2.5 rounded-full bg-rose-900 dark:bg-rose-600 text-white text-xs sm:text-sm font-semibold shadow hover:bg-rose-800 transition-colors"
              >
                📋 Abrir Questionário de Diagnóstico
              </button>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[88%] sm:max-w-[82%] rounded-3xl px-4 py-3 sm:px-6 sm:py-4 shadow-sm whitespace-pre-wrap leading-relaxed text-[15px] ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-rose-900 to-rose-800 text-rose-50 rounded-tr-sm shadow-md"
                      : "bg-white dark:bg-white/5 text-stone-800 dark:text-stone-200 border border-rose-100/80 dark:border-rose-400/20 border-l-4 border-l-rose-800 dark:border-l-rose-500 rounded-tl-sm shadow-md"
                  }`}
                >
                  {m.role === "assistant" && (
                    <div className="text-[11px] font-bold uppercase tracking-widest text-rose-800 dark:text-rose-400 mb-2 flex items-center gap-1.5">
                      <span>✦</span> PROTOCOLO DE RECONQUISTA
                    </div>
                  )}

                  {m.attachment && (
                    <div className="mb-3 rounded-xl overflow-hidden bg-black/10 p-1">
                      {m.attachment.mimeType.startsWith("image/") && (
                        <img src={m.attachment.previewUrl} alt="Print enviado" className="max-h-72 rounded-lg object-contain mx-auto" />
                      )}
                      {m.attachment.mimeType.startsWith("audio/") && (
                        <audio controls src={m.attachment.previewUrl} className="w-full max-w-xs" />
                      )}
                      {m.attachment.mimeType.startsWith("video/") && (
                        <video controls src={m.attachment.previewUrl} className="max-h-72 rounded-lg mx-auto" />
                      )}
                    </div>
                  )}

                  <div>{formatText(m.content)}</div>
                </div>

                {/* BOTÕES DE COPIAR E REENVIAR EMBAIXO DE CADA MENSAGEM */}
                <div className="flex items-center gap-3 mt-1.5 px-2 text-[11px] text-stone-400 dark:text-stone-500">
                  <button
                    type="button"
                    onClick={() => copyMessage(m.id, m.content)}
                    className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1"
                  >
                    {copiedId === m.id ? "✓ Copiado" : "📋 Copiar texto"}
                  </button>
                  {m.role === "user" && (
                    <button
                      type="button"
                      onClick={() => sendRawMessage(m.content)}
                      disabled={isLoading}
                      className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1"
                    >
                      🔄 Reenviar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-white/5 border border-rose-100 dark:border-rose-400/20 border-l-4 border-l-rose-800 dark:border-l-rose-500 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-700 dark:bg-rose-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 rounded-full bg-rose-700 dark:bg-rose-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 rounded-full bg-rose-700 dark:bg-rose-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Lendo seu relato com atenção e sentindo o momento de vocês...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer className="relative z-20 p-2.5 sm:p-4 pb-[max(0.65rem,env(safe-area-inset-bottom))] bg-white dark:bg-[#1c1016] border-t border-rose-100 dark:border-rose-400/15 shrink-0">
          <div className="max-w-4xl mx-auto">
            {attachment && (
              <div className="mb-3 flex items-center justify-between bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-400/30 px-4 py-2 rounded-2xl text-xs text-rose-900 dark:text-rose-200">
                <div className="flex items-center gap-3 truncate">
                  {attachment.mimeType.startsWith("image/") ? (
                    <img src={attachment.previewUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-rose-300" />
                  ) : (
                    <span className="text-lg">🎙️</span>
                  )}
                  <span className="font-medium truncate">{attachment.name} (Pronto para envio)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="ml-3 text-rose-800 dark:text-rose-300 font-bold px-2 py-0.5 rounded-full"
                >
                  ✕
                </button>
              </div>
            )}

            {isLimitReached ? (
              <div className="bg-rose-950 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                <div className="text-center sm:text-left">
                  <p className="font-serif font-bold text-sm sm:text-base text-amber-300">
                    Limite de {totalAllowed} análises gratuitas atingido.
                  </p>
                  <p className="text-xs text-rose-100">
                    Desbloqueie o Protocolo Premium para acessar o cronograma de repaginação e as estratégias completas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaywallModal(true)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs sm:text-sm rounded-xl shadow transition-colors shrink-0"
                >
                  🔓 Desbloquear Protocolo
                </button>
              </div>
            ) : (
              <form onSubmit={handleSend} className="relative flex items-end gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,audio/*,video/*"
                  className="hidden"
                />

                {/* Botão de Anexar Print/Arquivo */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Enviar Print, Áudio ou Vídeo"
                  className="p-3 sm:p-3.5 bg-stone-100 dark:bg-white/5 hover:bg-rose-100 dark:hover:bg-white/10 text-stone-600 dark:text-stone-300 rounded-full transition-colors shrink-0 border border-stone-200 dark:border-white/10 mb-0.5"
                >
                  📎
                </button>

                {/* Botão de Gravar Áudio no Microfone */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  title={isRecording ? "Parar gravação" : "Gravar desabafo em áudio"}
                  className={`p-3 sm:p-3.5 rounded-full transition-all shrink-0 border mb-0.5 flex items-center gap-1 ${
                    isRecording
                      ? "bg-red-600 text-white border-red-500 animate-pulse px-4"
                      : "bg-stone-100 dark:bg-white/5 hover:bg-rose-100 dark:hover:bg-white/10 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-white/10"
                  }`}
                >
                  <span>🎙️</span>
                  {isRecording && <span className="text-xs font-bold">{recordingSeconds}s ■</span>}
                </button>

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onPaste={handlePaste}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={Math.min(5, Math.max(1, input.split("\n").length))}
                  placeholder="Conte o caso, grave um áudio ou cole o print aqui (Ctrl+V)..."
                  className="w-full bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-800 dark:text-stone-100 rounded-3xl pl-4 pr-12 py-3 sm:py-3.5 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm sm:text-base resize-none max-h-40 overflow-y-auto"
                />

                <button
                  type="submit"
                  disabled={isLoading || (!input.trim() && !attachment)}
                  className="absolute right-2 bottom-1.5 p-3 bg-rose-900 dark:bg-rose-600 text-white rounded-full hover:bg-rose-800 disabled:opacity-40 transition-colors shadow-sm"
                >
                  ➤
                </button>
              </form>
            )}
          </div>
        </footer>
      </div>

      {/* MODAL DO QUESTIONÁRIO DE DIAGNÓSTICO DE RECONQUISTA (PODE SER PULADO) */}
      {showQuestionnaire && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1c1016] border border-rose-200 dark:border-rose-400/25 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
                  Mapeamento Comportamental • Opcional
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-white mt-0.5">
                  Ficha de Diagnóstico da Reconquista
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQuestionnaire(false)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
              >
                Pular →
              </button>
            </div>

            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-400/30 rounded-2xl p-3 mb-5 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              ⚠️ <strong>Importante:</strong> Todos os campos são opcionais e você pode pular este questionário se preferir, mas <strong>quanto mais detalhes preencher, mais cirúrgica e precisa será a estratégia da IA</strong>. Pular pode comprometer a profundidade da análise inicial.
            </div>

            <form onSubmit={handleQuizSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">1. Quanto tempo durou a relação?</label>
                  <input
                    type="text"
                    placeholder="Ex: 2 anos e meio"
                    value={quiz.duracao}
                    onChange={(e) => setQuiz({ ...quiz, duracao: e.target.value })}
                    className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-800 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">2. Idade e gênero de cada um?</label>
                  <input
                    type="text"
                    placeholder="Ex: Eu (H, 30) / Ela (M, 28)"
                    value={quiz.idadesGeneros}
                    onChange={(e) => setQuiz({ ...quiz, idadesGeneros: e.target.value })}
                    className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">3. Ambos trabalham atualmente?</label>
                  <input
                    type="text"
                    placeholder="Ex: Ambos trabalham / Só ela trabalha..."
                    value={quiz.trabalho}
                    onChange={(e) => setQuiz({ ...quiz, trabalho: e.target.value })}
                    className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-800 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">4. Há quanto tempo estão sem conversar?</label>
                  <input
                    type="text"
                    placeholder="Ex: 4 dias / 2 semanas"
                    value={quiz.tempoSemFalar}
                    onChange={(e) => setQuiz({ ...quiz, tempoSemFalar: e.target.value })}
                    className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">5. Como era o convívio? Era comum ter discussões?</label>
                <input
                  type="text"
                  placeholder="Ex: Era tranquilo, mas nos últimos meses brigávamos por ciúmes/rotina..."
                  value={quiz.convivio}
                  onChange={(e) => setQuiz({ ...quiz, convivio: e.target.value })}
                  className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">6. Já terminaram outras vezes? Houve traição (de quem)?</label>
                <input
                  type="text"
                  placeholder="Ex: Primeiro término, sem traição / Já terminamos 2 vezes..."
                  value={quiz.historico}
                  onChange={(e) => setQuiz({ ...quiz, historico: e.target.value })}
                  className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">7. Qual foi o motivo do término e quem terminou?</label>
                <input
                  type="text"
                  placeholder="Ex: Ela terminou dizendo que estava confusa e desgastada..."
                  value={quiz.motivoQuemTerminou}
                  onChange={(e) => setQuiz({ ...quiz, motivoQuemTerminou: e.target.value })}
                  className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">8. Houve mensagens após o término?</label>
                  <input
                    type="text"
                    placeholder="Ex: Mandei texto pedindo pra voltar e fui ignorado(a)"
                    value={quiz.houveMensagens}
                    onChange={(e) => setQuiz({ ...quiz, houveMensagens: e.target.value })}
                    className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-800 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">9. Ainda se seguem? Olham os stories?</label>
                  <input
                    type="text"
                    placeholder="Ex: Nos seguimos e ela vê todos os meus stories"
                    value={quiz.redesSociais}
                    onChange={(e) => setQuiz({ ...quiz, redesSociais: e.target.value })}
                    className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">10. Último registro de conversa que tiveram (ou cole o print com Ctrl+V):</label>
                <textarea
                  rows={2}
                  onPaste={handlePaste}
                  placeholder="Cole aqui a última troca de mensagens ou digite o que foi dito por último..."
                  value={quiz.ultimaConversa}
                  onChange={(e) => setQuiz({ ...quiz, ultimaConversa: e.target.value })}
                  className="w-full rounded-xl px-3.5 py-2 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                <button
                  type="submit"
                  className="w-full sm:flex-1 py-3 px-5 bg-gradient-to-r from-rose-900 to-rose-700 hover:from-rose-800 hover:to-rose-600 text-white font-bold rounded-2xl shadow-lg transition-all"
                >
                  🔍 Gerar Diagnóstico de Reconquista Agora
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuestionnaire(false)}
                  className="w-full sm:w-auto py-3 px-4 bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-stone-300 font-semibold rounded-2xl border border-stone-200 dark:border-white/10"
                >
                  Ignorar e ir ao Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaywallModal && !isPremium && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1c1016] border border-rose-100 dark:border-rose-400/20 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowPaywallModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 dark:bg-white/10 flex items-center justify-center text-stone-600 dark:text-stone-300 font-bold"
            >
              ✕
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-500/15 text-rose-900 dark:text-rose-300 flex items-center justify-center text-2xl mb-4">
              ❤️‍🩹
            </div>

            <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
              Módulo Avançado • Reconquista
            </span>
            <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mt-1 mb-2">
              Desbloqueie o Protocolo de Reconquista
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-5">
              Acesse a estratégia completa para o seu caso, reduza a dependência emocional e reverta o término:
            </p>

            <ul className="space-y-2.5 text-sm text-stone-700 dark:text-stone-300 mb-6">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Estratégia Personalizada:</strong> O passo a passo completo da tática indicada para o seu caso.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Plano de Repaginação:</strong> Rotina, aparência, lugares e hobbies para cortar a dependência e gerar atração.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Consultas Ilimitadas:</strong> Acompanhamento diário para cada fase do Contato Zero.</span>
              </li>
            </ul>

            <a
              href={CHECKOUT_URL}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-rose-900 to-rose-700 text-white font-bold text-center rounded-2xl shadow-lg block transition-all mb-3"
            >
              Desbloquear Protocolo Completo →
            </a>

            <button
              type="button"
              onClick={handleUnlockAdBonus}
              disabled={isWatchingAd}
              className="w-full py-3 px-4 bg-stone-100 dark:bg-white/5 text-stone-700 dark:text-stone-300 font-semibold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2 border border-stone-200 dark:border-white/10"
            >
              {isWatchingAd ? (
                <span>⏳ Carregando patrocinador... Aguarde 2s</span>
              ) : (
                <span>📺 Assistir 1 Anúncio para liberar +3 Mensagens Grátis</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}