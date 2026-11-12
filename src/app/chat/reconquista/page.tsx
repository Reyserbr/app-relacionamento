"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import RewardedAdModal from "@/components/RewardedAdModal";

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

const cleanDisplayTitle = (rawTitle: string) =>
  (rawTitle || "Caso de Reconquista").replace(/^[^\wÀ-ÿ]+/, "").trim() || "Caso de Reconquista";

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
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // REGRAS DO MÓDULO RECONQUISTA:
  // 1 mensagem grátis inicial + 1 mensagem por anúncio assistido, limitado a no máximo 10 pedidos no total
  const BASE_FREE_LIMIT = 1;
  const AD_BONUS_STEP = 1;
  const MAX_TOTAL_FREE_REQUESTS = 10;

  const totalAllowed = Math.min(MAX_TOTAL_FREE_REQUESTS, BASE_FREE_LIMIT + bonusLimit);
  const assistantRepliesCount = messages.filter((m) => m.role === "assistant").length;
  const isLimitReached = !isPremium && assistantRepliesCount >= totalAllowed;
  const canUnlockMoreWithAds = totalAllowed < MAX_TOTAL_FREE_REQUESTS;

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
      const cleanTitle =
        firstUserMsg
          .replace(/^[^\wÀ-ÿ]+/, "")
          .replace(/^DIAGNÓSTICO:\s*/i, "")
          .slice(0, 34) + (firstUserMsg.length > 34 ? "..." : "");

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
    if (!canUnlockMoreWithAds) return;
    const maxBonus = MAX_TOTAL_FREE_REQUESTS - BASE_FREE_LIMIT;
    const nextBonus = Math.min(maxBonus, bonusLimit + AD_BONUS_STEP);
    setBonusLimit(nextBonus);
    saveToHistory(messages, nextBonus);
    setShowPaywallModal(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

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

    const resumo = `DIAGNÓSTICO DO MEU CASO DE RECONQUISTA:\n${partes.join("\n")}\n\nAnalise meu cenário com precisão e me diga qual é o diagnóstico e a estratégia ideal.`;
    await sendRawMessage(resumo, attachment);
  };

  return (
    <div className="fixed inset-0 flex h-[100dvh] w-full bg-[#faf7f5] dark:bg-[#1a0b12] font-sans overflow-hidden transition-colors">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR RETRÁTIL COM ÍCONES VETORIAIS */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 bg-white dark:bg-[#14080e] border-r border-stone-200/80 dark:border-rose-300/10 flex flex-col transition-all duration-200 ${
          isSidebarOpen ? "translate-x-0 w-[82%] max-w-[300px]" : "-translate-x-full lg:translate-x-0"
        } ${isDesktopCollapsed ? "lg:w-[68px]" : "lg:w-72"}`}
      >
        <div className="h-14 px-3.5 border-b border-stone-100 dark:border-rose-300/10 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
              } else {
                setIsDesktopCollapsed(!isDesktopCollapsed);
              }
            }}
            className="w-9 h-9 rounded-full hover:bg-stone-100 dark:hover:bg-white/10 flex items-center justify-center text-stone-600 dark:text-stone-300 transition-colors"
            title="Alternar menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <span className={`font-serif font-bold text-stone-800 dark:text-stone-100 text-base truncate ${isDesktopCollapsed ? "lg:hidden" : ""}`}>
            Reconquiste
          </span>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden w-8 h-8 rounded-full hover:bg-stone-100 dark:hover:bg-white/10 flex items-center justify-center text-stone-500 dark:text-stone-400"
          >
            ✕
          </button>
        </div>

        <div className="p-2.5 space-y-1.5 shrink-0">
          <button
            type="button"
            onClick={() => createNewSession()}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-[#381826] hover:bg-[#4a2033] text-rose-100 border border-rose-300/20 font-semibold text-xs transition-all shadow-sm ${
              isDesktopCollapsed ? "lg:justify-center lg:px-0" : ""
            }`}
            title="Novo Caso de Reconquista"
          >
            <svg className="w-4 h-4 text-rose-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className={isDesktopCollapsed ? "lg:hidden" : ""}>Novo Caso</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSidebarOpen(false);
              setShowQuestionnaire(true);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5 text-xs font-medium transition-colors ${
              isDesktopCollapsed ? "lg:justify-center lg:px-0" : ""
            }`}
            title="Abrir Ficha do Caso"
          >
            <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
            <span className={isDesktopCollapsed ? "lg:hidden" : ""}>Ficha de Diagnóstico</span>
          </button>

          <Link
            href="/chat/lilith"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 text-xs font-medium transition-colors ${
              isDesktopCollapsed ? "lg:justify-center lg:px-0" : ""
            }`}
            title="Consultoria da Lilith"
          >
            <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <span className={isDesktopCollapsed ? "lg:hidden" : ""}>Consultoria da Lilith</span>
          </Link>

          <Link
            href="/chat/mistico"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 text-xs font-medium transition-colors ${
              isDesktopCollapsed ? "lg:justify-center lg:px-0" : ""
            }`}
            title="Oráculo Astral"
          >
            <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
            <span className={isDesktopCollapsed ? "lg:hidden" : ""}>Oráculo Astral</span>
          </Link>

          <Link
            href="/"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 text-xs font-medium transition-colors ${
              isDesktopCollapsed ? "lg:justify-center lg:px-0" : ""
            }`}
            title="Voltar ao Início"
          >
            <svg className="w-4 h-4 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className={isDesktopCollapsed ? "lg:hidden" : ""}>Voltar ao Início</span>
          </Link>
        </div>

        <div
          className={`flex-1 overflow-y-auto px-2.5 py-2 space-y-1.5 border-t border-stone-100 dark:border-white/5 [scrollbar-width:thin] [scrollbar-color:rgba(244,63,94,0.2)_transparent] ${
            isDesktopCollapsed ? "lg:hidden" : ""
          }`}
        >
          <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Meus Casos de Reconquista
          </p>
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => selectSession(s)}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-2xl cursor-pointer transition-all text-left border ${
                s.id === activeSessionId
                  ? "bg-rose-50/90 dark:bg-[#2a131e] border-rose-200 dark:border-rose-400/30 text-rose-950 dark:text-rose-200 font-medium"
                  : "border-transparent hover:bg-stone-100 dark:hover:bg-white/5 text-stone-700 dark:text-stone-300"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate pr-2">
                <svg className="w-3.5 h-3.5 text-rose-400/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                <div className="truncate">
                  <p className="text-xs truncate">{cleanDisplayTitle(s.title)}</p>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500">{s.updatedAt}</span>
                </div>
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

        <div className={`p-3 border-t border-stone-100 dark:border-rose-300/10 flex items-center justify-between text-xs text-stone-500 ${isDesktopCollapsed ? "lg:justify-center" : ""}`}>
          <UserButton afterSignOutUrl="/" />
          <span className={`text-[11px] truncate ml-2 ${isDesktopCollapsed ? "lg:hidden" : ""}`}>
            Sincronizado na conta
          </span>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-[#faf7f5] dark:bg-gradient-to-b dark:from-[#1f0d16] dark:via-[#1a0b12] dark:to-[#14080e]">
        <header className="relative z-20 h-14 flex items-center justify-between gap-2 px-3 sm:px-5 bg-white/90 dark:bg-[#1a0b12]/90 backdrop-blur-md border-b border-stone-200/60 dark:border-rose-300/10 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-full bg-stone-100 dark:bg-[#28121d] hover:bg-stone-200 text-stone-700 dark:text-stone-200 flex items-center justify-center shrink-0"
              title="Abrir Menu e Histórico"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setShowQuestionnaire(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-[#28121d] transition-colors min-w-0"
            >
              <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              <span className="font-serif font-bold text-stone-900 dark:text-white text-base sm:text-lg truncate">
                Reconquiste
              </span>
              <span className="text-xs text-stone-400">▾</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowQuestionnaire(true)}
              className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-[#28121d] border border-stone-200/70 dark:border-rose-300/15 hover:bg-rose-100 dark:hover:bg-[#381826] text-stone-700 dark:text-stone-200 flex items-center justify-center transition-colors"
              title="Ficha de Diagnóstico"
            >
              <svg className="w-4 h-4 text-rose-500 dark:text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </button>

            <button
              onClick={() => {
                if (!isPremium) setShowPaywallModal(true);
              }}
              className={`flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                isPremium
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-400/30 cursor-default"
                  : "bg-rose-50 dark:bg-[#28121d] text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-300/20"
              }`}
            >
              <svg className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
              </svg>
              <span>
                {isPremium ? (
                  "VIP"
                ) : (
                  <>
                    {Math.max(0, totalAllowed - assistantRepliesCount)}/{totalAllowed}
                  </>
                )}
              </span>
            </button>

            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 max-w-3xl w-full mx-auto [scrollbar-width:thin] [scrollbar-color:rgba(244,63,94,0.2)_transparent]">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-3 space-y-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-rose-500/15 to-orange-500/10 dark:from-[#381826] dark:to-[#240e18] border border-rose-200 dark:border-rose-300/20 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-300 shadow-md">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-800 dark:text-stone-100">
                Módulo de Reconquista
              </h2>
              <p className="text-stone-500 dark:text-stone-300/80 max-w-md text-xs sm:text-sm leading-relaxed">
                Preencha a ficha de diagnóstico para uma análise cirúrgica, grave um áudio desabafando ou cole o print da conversa.
              </p>
              <button
                onClick={() => setShowQuestionnaire(true)}
                className="px-5 py-2.5 rounded-xl bg-white dark:bg-[#28121d] hover:bg-rose-50 dark:hover:bg-[#381826] border border-stone-200 dark:border-rose-300/25 text-stone-800 dark:text-stone-100 text-xs sm:text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-rose-500 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
                <span>Abrir Questionário de Diagnóstico</span>
              </button>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[90%] sm:max-w-[82%] rounded-3xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-sm whitespace-pre-wrap leading-relaxed text-sm sm:text-[15px] ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-[#6b1630] to-[#4a0f21] text-rose-50 rounded-tr-sm shadow-md border border-rose-400/20"
                      : "bg-white dark:bg-[#24101a] text-stone-800 dark:text-stone-200 border border-rose-100/80 dark:border-rose-300/20 border-l-4 border-l-rose-800 dark:border-l-rose-500 rounded-tl-sm shadow-md"
                  }`}
                >
                  {m.role === "assistant" && (
                    <div className="text-[10px] font-bold uppercase tracking-widest text-rose-800 dark:text-rose-400 mb-1.5 flex items-center gap-1.5">
                      <span>✦</span> RECONQUISTE • PROTOCOLO DE REVERSÃO
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

                <div className="flex items-center gap-3 mt-1 px-2 text-[11px] text-stone-400 dark:text-stone-500">
                  <button
                    type="button"
                    onClick={() => copyMessage(m.id, m.content)}
                    className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>{copiedId === m.id ? "Copiado" : "Copiar texto"}</span>
                  </button>
                  {m.role === "user" && (
                    <button
                      type="button"
                      onClick={() => sendRawMessage(m.content)}
                      disabled={isLoading}
                      className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                      <span>Reenviar</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-[#24101a] border border-rose-100 dark:border-rose-300/20 border-l-4 border-l-rose-800 dark:border-l-rose-500 rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-700 dark:bg-rose-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 rounded-full bg-rose-700 dark:bg-rose-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 rounded-full bg-rose-700 dark:bg-rose-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
                <span className="text-xs text-stone-500 dark:text-stone-300 font-medium">Lendo seu relato com atenção e sentindo o momento de vocês...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* BARRA DE DIGITAÇÃO ESTILO CHATGPT */}
        <footer className="relative z-20 px-3 sm:px-6 pt-2 pb-[max(0.85rem,env(safe-area-inset-bottom))] bg-transparent shrink-0">
          <div className="max-w-3xl mx-auto">
            {attachment && (
              <div className="mb-2 flex items-center justify-between bg-rose-50 dark:bg-[#28121d] border border-rose-200 dark:border-rose-400/30 px-3.5 py-2 rounded-2xl text-xs text-rose-900 dark:text-rose-200">
                <div className="flex items-center gap-2.5 truncate">
                  {attachment.mimeType.startsWith("image/") ? (
                    <img src={attachment.previewUrl} alt="Preview" className="w-8 h-8 rounded-lg object-cover border border-rose-300" />
                  ) : (
                    <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                  )}
                  <span className="font-medium truncate">{attachment.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="ml-2 text-rose-800 dark:text-rose-300 font-bold px-2 py-0.5 rounded-full"
                >
                  ✕
                </button>
              </div>
            )}

            {isLimitReached ? (
              <div className="bg-rose-950 text-white p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-md">
                <div className="text-center sm:text-left">
                  <p className="font-serif font-bold text-xs sm:text-sm text-amber-300">
                    {canUnlockMoreWithAds
                      ? `Limite de ${totalAllowed} análise(s) gratuita(s) atingido.`
                      : `Limite máximo de ${MAX_TOTAL_FREE_REQUESTS} análises gratuitas atingido!`}
                  </p>
                  <p className="text-[11px] text-rose-100">
                    {canUnlockMoreWithAds
                      ? "Assista 1 anúncio rápido para liberar +1 análise ou desbloqueie o Protocolo VIP completo."
                      : "Para acessar a estratégia completa de reconquista e continuar conversando sem limites, torne-se VIP."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaywallModal(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl shadow transition-colors shrink-0"
                >
                  {canUnlockMoreWithAds ? "Liberar +1 ou VIP" : "Desbloquear Protocolo VIP"}
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSend}
                className="flex items-center gap-2 bg-white dark:bg-[#26121c] border border-stone-300/90 dark:border-rose-300/20 rounded-[28px] px-3 py-1.5 shadow-lg transition-all"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,audio/*,video/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Adicionar Print, Foto ou Áudio"
                  className="w-9 h-9 rounded-full hover:bg-stone-100 dark:hover:bg-white/10 text-stone-600 dark:text-stone-300 flex items-center justify-center shrink-0 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
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
                  rows={Math.min(4, Math.max(1, input.split("\n").length))}
                  placeholder="Pergunte ao Reconquiste"
                  style={{ border: "none", outline: "none", boxShadow: "none" }}
                  className="flex-1 bg-transparent !border-0 !ring-0 !outline-none !shadow-none appearance-none text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-400/80 px-1 py-1.5 text-sm sm:text-base resize-none max-h-32 overflow-y-auto leading-normal"
                />

                <button
                  type="button"
                  onClick={toggleRecording}
                  title={isRecording ? "Parar gravação" : "Gravar desabafo em áudio"}
                  className={`h-9 rounded-full transition-all shrink-0 flex items-center justify-center gap-1 ${
                    isRecording
                      ? "bg-rose-600 text-white animate-pulse px-3"
                      : "w-9 hover:bg-stone-100 dark:hover:bg-white/10 text-stone-500 dark:text-stone-300"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                  {isRecording && <span className="text-[11px] font-bold">{recordingSeconds}s</span>}
                </button>

                <button
                  type="submit"
                  disabled={isLoading || (!input.trim() && !attachment)}
                  className="w-9 h-9 bg-[#5c162e] hover:bg-[#731c3a] dark:bg-[#7a1c3a] dark:hover:bg-[#912246] text-white rounded-full disabled:opacity-40 flex items-center justify-center shrink-0 transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                  </svg>
                </button>
              </form>
            )}
          </div>
        </footer>
      </div>

      {/* MODAL DO QUESTIONÁRIO DE DIAGNÓSTICO DE RECONQUISTA */}
      {showQuestionnaire && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1c0d15] border border-rose-200 dark:border-rose-300/25 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl my-auto max-h-[90dvh] overflow-y-auto">
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
              <strong>Importante:</strong> Todos os campos são opcionais e você pode pular este questionário se preferir, mas <strong>quanto mais detalhes preencher, mais cirúrgica e precisa será a estratégia da IA</strong>. Pular pode comprometer a profundidade da análise inicial.
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
                    className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-[#28121d] border border-stone-200 dark:border-rose-300/15 text-stone-800 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">2. Idade e gênero de cada um?</label>
                  <input
                    type="text"
                    placeholder="Ex: Eu (H, 30) / Ela (M, 28)"
                    value={quiz.idadesGeneros}
                    onChange={(e) => setQuiz({ ...quiz, idadesGeneros: e.target.value })}
                    className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-[#28121d] border border-stone-200 dark:border-rose-300/15 text-stone-800 dark:text-stone-100"
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
                    className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-[#28121d] border border-stone-200 dark:border-rose-300/15 text-stone-800 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">4. Há quanto tempo estão sem conversar?</label>
                  <input
                    type="text"
                    placeholder="Ex: 4 dias / 2 semanas"
                    value={quiz.tempoSemFalar}
                    onChange={(e) => setQuiz({ ...quiz, tempoSemFalar: e.target.value })}
                    className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-[#28121d] border border-stone-200 dark:border-rose-300/15 text-stone-800 dark:text-stone-100"
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
                  className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-[#28121d] border border-stone-200 dark:border-rose-300/15 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">6. Já terminaram outras vezes? Houve traição (de quem)?</label>
                <input
                  type="text"
                  placeholder="Ex: Primeiro término, sem traição / Já terminamos 2 vezes..."
                  value={quiz.historico}
                  onChange={(e) => setQuiz({ ...quiz, historico: e.target.value })}
                  className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-[#28121d] border border-stone-200 dark:border-rose-300/15 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">7. Qual foi o motivo do término e quem terminou?</label>
                <input
                  type="text"
                  placeholder="Ex: Ela terminou dizendo que estava confusa e desgastada..."
                  value={quiz.motivoQuemTerminou}
                  onChange={(e) => setQuiz({ ...quiz, motivoQuemTerminou: e.target.value })}
                  className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-[#28121d] border border-stone-200 dark:border-rose-300/15 text-stone-800 dark:text-stone-100"
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
                    className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-[#28121d] border border-stone-200 dark:border-rose-300/15 text-stone-800 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">9. Ainda se seguem? Olham os stories?</label>
                  <input
                    type="text"
                    placeholder="Ex: Nos seguimos e ela vê todos os meus stories"
                    value={quiz.redesSociais}
                    onChange={(e) => setQuiz({ ...quiz, redesSociais: e.target.value })}
                    className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-[#28121d] border border-stone-200 dark:border-rose-300/15 text-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">10. Último registro de conversa que tiveram ou cole o print:</label>
                <textarea
                  rows={2}
                  onPaste={handlePaste}
                  placeholder="Cole aqui a última troca de mensagens ou digite o que foi dito por último..."
                  value={quiz.ultimaConversa}
                  onChange={(e) => setQuiz({ ...quiz, ultimaConversa: e.target.value })}
                  className="w-full rounded-xl px-3.5 py-2 bg-stone-50 dark:bg-[#28121d] border border-stone-200 dark:border-rose-300/15 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                <button
                  type="submit"
                  className="w-full sm:flex-1 py-3 px-5 bg-gradient-to-r from-[#6b1630] to-[#8a1c3e] hover:from-[#7d1a38] hover:to-[#9e2147] text-white font-bold rounded-2xl shadow-lg transition-all"
                >
                  Gerar Diagnóstico de Reconquista Agora →
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

      {/* MODAL DE PAYWALL + ANÚNCIO DE 10 SEGUNDOS */}
      <RewardedAdModal
        isOpen={showPaywallModal && !isPremium}
        onClose={() => setShowPaywallModal(false)}
        onRewardEarned={handleUnlockAdBonus}
        checkoutUrl={CHECKOUT_URL}
        theme="rose"
        badgeText="Módulo Avançado • Reconquiste"
        titleText="Desbloqueie o Protocolo de Reconquista"
        rewardLabel={`+1 Análise Grátis (${totalAllowed}/${MAX_TOTAL_FREE_REQUESTS})`}
        canWatchAd={canUnlockMoreWithAds}
        maxReachedText="Você atingiu o limite máximo de 10 análises com anúncios no módulo de Reconquista. Desbloqueie o Protocolo VIP para acessar a estratégia completa e mensagens ilimitadas."
      />
    </div>
  );
}