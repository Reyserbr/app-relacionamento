"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import RewardedAdModal from "@/components/RewardedAdModal";
import AssistantMessageCard from "@/components/AssistantMessageCard";

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
  attachments?: Attachment[];
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: Message[];
  bonusLimit?: number;
}

const STORAGE_KEY = "lilithlove_mistico_v1";
const CLOUD_KEY = "mistico";
const CHECKOUT_URL = "/planos";

const cleanDisplayTitle = (rawTitle: string) =>
  (rawTitle || "Leitura Astral").replace(/^[^\wÀ-ÿ]+/, "").trim() || "Leitura Astral";

export default function MisticoChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [bonusLimit, setBonusLimit] = useState<number>(0);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [astroQuiz, setAstroQuiz] = useState({
    objetivo: "Compatibilidade de Signos + Mapa Mental do Parceiro(a)",
    meusDados: "",
    dadosParceiro: "",
    statusRelacao: "",
    comportamentoDuvida: "",
    perguntaPrincipal: "",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const BASE_FREE_LIMIT = 3;
  const AD_BONUS_STEP = 2;

  const totalAllowed = BASE_FREE_LIMIT + bonusLimit;
  const assistantRepliesCount = messages.filter((m) => m.role === "assistant").length;
  const isLimitReached = !isPremium && assistantRepliesCount >= totalAllowed;

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
      const firstUserMsg = updatedMsgs.find((m) => m.role === "user")?.content || "Leitura Astral";
      const cleanTitle =
        firstUserMsg
          .replace(/^[^\wÀ-ÿ]+/, "")
          .replace(/^MAPA ASTRAL:\s*/i, "")
          .slice(0, 34) + (firstUserMsg.length > 34 ? "..." : "");

      const lightMessages = updatedMsgs.map((m) =>
        m.attachment || m.attachments
          ? { ...m, attachment: undefined, attachments: undefined }
          : m
      );

      const updatedSession: ChatSession = {
        id: activeSessionId || Date.now().toString(),
        title: updatedMsgs.length > 0 ? cleanTitle : "Leitura Astral",
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
      title: "Leitura Astral",
      updatedAt: "Agora",
      messages: [],
      bonusLimit: 0,
    };
    const updated = [newSession, ...currentList];
    setSessions(updated);
    setActiveSessionId(newId);
    setMessages([]);
    setBonusLimit(0);
    setStreamingMsgId(null);
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
    setStreamingMsgId(null);
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
    const nextBonus = bonusLimit + AD_BONUS_STEP;
    setBonusLimit(nextBonus);
    saveToHistory(messages, nextBonus);
    setShowPaywallModal(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const processFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert("O arquivo é muito grande! Envie arquivos de até 10MB.");
      return;
    }

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const MAX_DIM = 1280;
          let w = img.width;
          let h = img.height;
          if (w > MAX_DIM || h > MAX_DIM) {
            if (w > h) {
              h = Math.round((h * MAX_DIM) / w);
              w = MAX_DIM;
            } else {
              w = Math.round((w * MAX_DIM) / h);
              h = MAX_DIM;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.84);
            const base64Data = compressedDataUrl.split(",")[1];
            setAttachments((prev) =>
              prev.length >= 5
                ? prev
                : [
                    ...prev,
                    {
                      name: file.name || `anexo-${Date.now()}.jpg`,
                      mimeType: "image/jpeg",
                      data: base64Data,
                      previewUrl: compressedDataUrl,
                    },
                  ]
            );
          }
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(",")[1];
      setAttachments((prev) =>
        prev.length >= 5
          ? prev
          : [
              ...prev,
              {
                name: file.name || `anexo-${Date.now()}`,
                mimeType: file.type || "audio/webm",
                data: base64Data,
                previewUrl: result,
              },
            ]
      );
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    Array.from(fileList).forEach((f) => processFile(f));
    e.target.value = "";
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    let foundMedia = false;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/") || items[i].type.startsWith("audio/")) {
        const file = items[i].getAsFile();
        if (file) {
          foundMedia = true;
          processFile(file);
        }
      }
    }
    if (foundMedia) {
      e.preventDefault();
    }
  };

  const removeAttachment = (indexToRemove: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
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
        const file = new File([audioBlob], `pergunta-voz.webm`, { type: mimeType });
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
      alert("Permita o acesso ao microfone no navegador para gravar sua voz.");
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
          <strong key={index} className="font-semibold text-purple-950 dark:text-purple-300">
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

  const sendRawMessage = async (textToSend: string, attachListToSend: Attachment[] = []) => {
    if (isLimitReached) {
      setShowPaywallModal(true);
      return;
    }
    if ((!textToSend.trim() && attachListToSend.length === 0) || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content:
        textToSend.trim() ||
        (attachListToSend.length > 1
          ? `Analise estas ${attachListToSend.length} imagens na leitura astral.`
          : "Analise este áudio/imagem na leitura astral."),
      attachment: attachListToSend[0] || undefined,
      attachments: attachListToSend.length > 0 ? attachListToSend : undefined,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    saveToHistory(updatedMessages);
    setInput("");
    setAttachments([]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, agent: "mistico", isPremium }),
      });

      const data = await res.json();
      const newReplyId = (Date.now() + 1).toString();
      setStreamingMsgId(newReplyId);

      const withReply: Message[] = [
        ...updatedMessages,
        {
          id: newReplyId,
          role: "assistant",
          content: data.reply || "Não consegui processar a leitura.",
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
          content: "Oscilação momentânea na rede. Use o botão Reenviar logo abaixo da sua mensagem.",
        },
      ];
      setMessages(withError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await sendRawMessage(input, attachments);
  };

  const handleAstroQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const partes: string[] = [];
    if (astroQuiz.objetivo) partes.push(`• Foco da Leitura: ${astroQuiz.objetivo}`);
    if (astroQuiz.meusDados) partes.push(`• Meu Signo / Data de Nascimento: ${astroQuiz.meusDados}`);
    if (astroQuiz.dadosParceiro) partes.push(`• Signo / Nascimento da Pessoa Amada: ${astroQuiz.dadosParceiro}`);
    if (astroQuiz.statusRelacao) partes.push(`• Momento atual entre nós: ${astroQuiz.statusRelacao}`);
    if (astroQuiz.comportamentoDuvida) partes.push(`• O que mais me intriga no comportamento dele(a): ${astroQuiz.comportamentoDuvida}`);
    if (astroQuiz.perguntaPrincipal) partes.push(`• Minha dúvida principal: ${astroQuiz.perguntaPrincipal}`);

    setShowQuestionnaire(false);

    if (partes.length === 0 && attachments.length === 0) return;

    const resumo = `MAPA ASTRAL & SINASTRIA DO CASAL:\n${partes.join("\n")}\n\nFaça a leitura profunda da nossa compatibilidade, revele o mapa da mente dessa pessoa e abra as cartas para o nosso momento.`;
    await sendRawMessage(resumo, attachments);
  };

  return (
    <div className="fixed inset-0 flex h-[100dvh] w-full bg-[#faf7f5] dark:bg-[#160b1c] font-sans overflow-hidden transition-colors">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR RETRÁTIL COM ÍCONES VETORIAIS */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 bg-white dark:bg-[#110816] border-r border-purple-200/80 dark:border-purple-400/15 flex flex-col transition-all duration-200 ${
          isSidebarOpen ? "translate-x-0 w-[82%] max-w-[300px]" : "-translate-x-full lg:translate-x-0"
        } ${isDesktopCollapsed ? "lg:w-[68px]" : "lg:w-72"}`}
      >
        <div className="h-14 px-3.5 border-b border-purple-100 dark:border-purple-400/10 flex items-center justify-between shrink-0">
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
            Oráculo Astral
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
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-[#2a1438] hover:bg-[#381b4a] text-purple-100 border border-purple-300/20 font-semibold text-xs transition-all shadow-sm ${
              isDesktopCollapsed ? "lg:justify-center lg:px-0" : ""
            }`}
            title="Nova Leitura Astral"
          >
            <svg className="w-4 h-4 text-purple-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className={isDesktopCollapsed ? "lg:hidden" : ""}>Nova Leitura</span>
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
            title="Mapa dos Signos"
          >
            <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
            <span className={isDesktopCollapsed ? "lg:hidden" : ""}>Mapa dos Signos</span>
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
            href="/chat/reconquista"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 text-xs font-medium transition-colors ${
              isDesktopCollapsed ? "lg:justify-center lg:px-0" : ""
            }`}
            title="Reconquiste"
          >
            <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <span className={isDesktopCollapsed ? "lg:hidden" : ""}>Reconquiste</span>
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
          className={`flex-1 overflow-y-auto px-2.5 py-2 space-y-1.5 border-t border-stone-100 dark:border-white/5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            isDesktopCollapsed ? "lg:hidden" : ""
          }`}
        >
          <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Minhas Leituras
          </p>
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => selectSession(s)}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-2xl cursor-pointer transition-all text-left border ${
                s.id === activeSessionId
                  ? "bg-purple-50/90 dark:bg-[#241230] border-purple-200 dark:border-purple-400/30 text-purple-950 dark:text-purple-200 font-medium"
                  : "border-transparent hover:bg-stone-100 dark:hover:bg-white/5 text-stone-700 dark:text-stone-300"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate pr-2">
                <svg className="w-3.5 h-3.5 text-purple-400/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
                <div className="truncate">
                  <p className="text-xs truncate">{cleanDisplayTitle(s.title)}</p>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500">{s.updatedAt}</span>
                </div>
              </div>
              {sessions.length > 1 && (
                <button
                  onClick={(e) => deleteSession(s.id, e)}
                  className="opacity-60 lg:opacity-0 lg:group-hover:opacity-100 text-stone-400 hover:text-purple-700 text-xs px-1.5"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div className={`p-3 border-t border-stone-100 dark:border-purple-400/10 flex items-center justify-between text-xs text-stone-500 ${isDesktopCollapsed ? "lg:justify-center" : ""}`}>
          <UserButton afterSignOutUrl="/" />
          <span className={`text-[11px] truncate ml-2 ${isDesktopCollapsed ? "lg:hidden" : ""}`}>
            Sincronizado na conta
          </span>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-[#faf7f5] dark:bg-gradient-to-b dark:from-[#1d0e26] dark:via-[#160b1c] dark:to-[#110816]">
        <header className="relative z-20 h-14 flex items-center justify-between gap-2 px-3 sm:px-5 bg-white/90 dark:bg-[#160b1c]/90 backdrop-blur-md border-b border-stone-200/60 dark:border-purple-300/10 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-full bg-stone-100 dark:bg-[#241230] hover:bg-stone-200 text-stone-700 dark:text-stone-200 flex items-center justify-center shrink-0"
              title="Abrir Menu e Histórico"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setShowQuestionnaire(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-[#241230] transition-colors min-w-0"
            >
              <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
              <span className="font-serif font-bold text-stone-900 dark:text-white text-base sm:text-lg truncate">
                Oráculo
              </span>
              <span className="text-xs text-stone-400">▾</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowQuestionnaire(true)}
              className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-[#241230] border border-stone-200/70 dark:border-purple-300/15 hover:bg-purple-100 dark:hover:bg-[#321942] text-stone-700 dark:text-stone-200 flex items-center justify-center transition-colors"
              title="Mapa dos Signos"
            >
              <svg className="w-4 h-4 text-purple-500 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </button>

            <button
              onClick={() => {
                if (!isPremium) setShowPaywallModal(true);
              }}
              className={`flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                isPremium
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-400/30 cursor-default"
                  : "bg-purple-50 dark:bg-[#241230] text-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-300/20"
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

        <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 max-w-3xl w-full mx-auto [scrollbar-width:thin] [scrollbar-color:rgba(168,85,247,0.2)_transparent]">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-3 space-y-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-purple-500/15 to-indigo-500/10 dark:from-[#321942] dark:to-[#1f0e2b] border border-purple-200 dark:border-purple-300/20 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-300 shadow-md">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-800 dark:text-stone-100">
                Astrologia do Amor, Signos & Tarot
              </h2>
              <p className="text-stone-500 dark:text-stone-300/80 max-w-md text-xs sm:text-sm leading-relaxed">
                Descubra a compatibilidade dos signos de vocês, gere o Mapa Astral da mente do seu parceiro(a) ou consulte seu Horóscopo Amoroso do dia.
              </p>
              <button
                onClick={() => setShowQuestionnaire(true)}
                className="px-5 py-2.5 rounded-xl bg-white dark:bg-[#241230] hover:bg-purple-50 dark:hover:bg-[#321942] border border-stone-200 dark:border-purple-300/25 text-stone-800 dark:text-stone-100 text-xs sm:text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-purple-500 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                <span>Preencher Dados dos Signos / Mapa Astral</span>
              </button>
            </div>
          ) : (
            messages.map((m) => {
              const msgAttachments =
                Array.isArray(m.attachments) && m.attachments.length > 0
                  ? m.attachments
                  : m.attachment
                  ? [m.attachment]
                  : [];

              return m.role === "assistant" ? (
                <AssistantMessageCard
                  key={m.id}
                  messageId={m.id}
                  content={m.content}
                  agent="mistico"
                  isNew={m.id === streamingMsgId}
                  copiedId={copiedId}
                  onCopy={copyMessage}
                  attachment={m.attachment}
                  attachments={m.attachments}
                />
              ) : (
                <div key={m.id} className="flex flex-col items-end">
                  {msgAttachments.length > 0 && (
                    <div className="mb-2 flex flex-wrap justify-end gap-2 max-w-[88%] sm:max-w-[78%]">
                      {msgAttachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl overflow-hidden border border-purple-400/25 bg-black/20 shadow-md"
                        >
                          {att.mimeType.startsWith("image/") && (
                            <img
                              src={att.previewUrl}
                              alt={`Anexo ${idx + 1}`}
                              className="max-h-60 sm:max-h-72 w-auto object-contain"
                            />
                          )}
                          {att.mimeType.startsWith("audio/") && (
                            <audio controls src={att.previewUrl} className="w-64 p-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="max-w-[88%] sm:max-w-[78%] rounded-3xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-md whitespace-pre-wrap leading-relaxed text-sm sm:text-[15px] bg-gradient-to-br from-[#4c1d6e] to-[#34124d] text-purple-50 rounded-tr-sm border border-purple-400/20">
                    <div>{formatText(m.content)}</div>
                  </div>

                  <div className="flex items-center gap-3 mt-1 px-2 text-[11px] text-stone-400 dark:text-stone-500">
                    <button
                      type="button"
                      onClick={() => copyMessage(m.id, m.content)}
                      className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>{copiedId === m.id ? "Copiado" : "Copiar texto"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => sendRawMessage(m.content, msgAttachments)}
                      disabled={isLoading}
                      className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                      <span>Reenviar</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {isLoading && (
            <div className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#321942] to-[#4c1d6e] border border-purple-400/30 flex items-center justify-center text-purple-200 shrink-0 animate-pulse">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-300 font-medium">
                <span>Sintonizando a energia dos signos e abrindo a leitura...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* BARRA DE DIGITAÇÃO COM MINIATURAS DE MÚLTIPLOS PRINTS E SEM SCROLLBAR BRANCA */}
        <footer className="relative z-20 px-3 sm:px-6 pt-2 pb-[max(0.85rem,env(safe-area-inset-bottom))] bg-transparent shrink-0">
          <div className="max-w-3xl mx-auto">
            {isLimitReached ? (
              <div className="bg-purple-950 text-white p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-md">
                <div className="text-center sm:text-left">
                  <p className="font-serif font-bold text-xs sm:text-sm text-amber-300">
                    Limite de {totalAllowed} leituras gratuitas atingido.
                  </p>
                  <p className="text-[11px] text-purple-100">
                    Assista 1 anúncio rápido para liberar +2 leituras ou desbloqueie o Oráculo VIP completo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaywallModal(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl shadow transition-colors shrink-0"
                >
                  Revelar Destino Agora
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSend}
                className="flex flex-col bg-white dark:bg-[#241230] border border-stone-300/90 dark:border-purple-300/20 rounded-[28px] px-3 py-2 shadow-lg transition-all"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,audio/*,video/*"
                  multiple
                  className="hidden"
                />

                {attachments.length > 0 && (
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-2.5 pt-1 px-1 mb-1 border-b border-stone-200/60 dark:border-white/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="relative group shrink-0 w-14 h-14 rounded-2xl overflow-hidden border border-purple-300/40 bg-black/20 shadow-sm"
                      >
                        {att.mimeType.startsWith("image/") ? (
                          <img
                            src={att.previewUrl}
                            alt={`Anexo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-purple-300 text-xs font-bold">
                            Áudio
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/75 hover:bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center shadow transition-colors"
                          title="Remover anexo"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {attachments.length < 5 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-14 h-14 rounded-2xl border border-dashed border-stone-300 dark:border-purple-300/30 hover:border-purple-400 flex flex-col items-center justify-center text-stone-400 dark:text-purple-300/70 text-[10px] shrink-0 transition-colors"
                        title="Adicionar mais uma imagem"
                      >
                        <span className="text-base leading-none">+</span>
                        <span>Foto</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Adicionar Imagens ou Áudio"
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
                    rows={Math.min(5, Math.max(1, input.split("\n").length))}
                    placeholder="Pergunte ao Oráculo (ou cole prints com Ctrl+V)"
                    style={{ border: "none", outline: "none", boxShadow: "none" }}
                    className="flex-1 bg-transparent !border-0 !ring-0 !outline-none !shadow-none appearance-none text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-400/80 px-1 py-1 text-sm sm:text-base resize-none max-h-36 overflow-y-auto leading-normal [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  />

                  <button
                    type="button"
                    onClick={toggleRecording}
                    title={isRecording ? "Parar gravação" : "Gravar pergunta em áudio"}
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
                    disabled={isLoading || (!input.trim() && attachments.length === 0)}
                    className="w-9 h-9 bg-[#4c1d6e] hover:bg-[#5e2487] dark:bg-[#62268c] dark:hover:bg-[#762ea8] text-white rounded-full disabled:opacity-40 flex items-center justify-center shrink-0 transition-all shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                    </svg>
                  </button>
                </div>
              </form>
            )}
          </div>
        </footer>
      </div>

      {/* MODAL DO QUESTIONÁRIO DE ASTROLOGIA, SIGNOS & MAPA DO PARCEIRO */}
      {showQuestionnaire && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a0d24] border border-purple-200 dark:border-purple-400/25 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl my-auto max-h-[90dvh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                  Sinastria Amorosa & Tarot • Opcional
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-white mt-0.5">
                  Mapa Astral do Casal & Compatibilidade
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

            <div className="bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-400/30 rounded-2xl p-3 mb-5 text-xs text-purple-900 dark:text-purple-200 leading-relaxed">
              <strong>Dica Astral:</strong> Você pode pular este quadro e conversar livremente se quiser, mas informar os <strong>signos ou datas de nascimento</strong> permite que o Oráculo trace o Mapa Mental exato da pessoa amada e a compatibilidade real de vocês.
            </div>

            <form onSubmit={handleAstroQuizSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1.5">1. O que você deseja revelar agora?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Compatibilidade de Signos + Mapa Mental do Parceiro(a)",
                    "Decifrar o Silêncio / Futuro da Relação no Tarot",
                    "Como Conquistar / Deixar esse Signo Obcecado",
                    "Meu Horóscopo Amoroso do Dia & Energia Atual",
                  ].map((opcao) => (
                    <button
                      type="button"
                      key={opcao}
                      onClick={() => setAstroQuiz({ ...astroQuiz, objetivo: opcao })}
                      className={`text-left p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        astroQuiz.objetivo === opcao
                          ? "bg-purple-900 text-white border-purple-700 shadow-sm"
                          : "bg-stone-50 dark:bg-[#241230] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-purple-300/15 hover:bg-purple-50"
                      }`}
                    >
                      {opcao}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">2. Seu Signo e Data de Nascimento:</label>
                  <input
                    type="text"
                    placeholder="Ex: Escorpião (14/11/1995)"
                    value={astroQuiz.meusDados}
                    onChange={(e) => setAstroQuiz({ ...astroQuiz, meusDados: e.target.value })}
                    className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-[#241230] border border-stone-200 dark:border-purple-300/15 text-stone-800 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">3. Signo / Data de Nascimento dele(a):</label>
                  <input
                    type="text"
                    placeholder="Ex: Aquário (20/02) — ou só o signo"
                    value={astroQuiz.dadosParceiro}
                    onChange={(e) => setAstroQuiz({ ...astroQuiz, dadosParceiro: e.target.value })}
                    className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-[#241230] border border-stone-200 dark:border-purple-300/15 text-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">4. Qual o status atual de vocês?</label>
                  <input
                    type="text"
                    placeholder="Ex: Ficando / Namorando / Afastados / Ex"
                    value={astroQuiz.statusRelacao}
                    onChange={(e) => setAstroQuiz({ ...astroQuiz, statusRelacao: e.target.value })}
                    className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-[#241230] border border-stone-200 dark:border-purple-300/15 text-stone-800 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">5. O que mais te intriga no jeito dele(a)?</label>
                  <input
                    type="text"
                    placeholder="Ex: Uma hora é carinhoso(a), depois some e fica frio..."
                    value={astroQuiz.comportamentoDuvida}
                    onChange={(e) => setAstroQuiz({ ...astroQuiz, comportamentoDuvida: e.target.value })}
                    className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-[#241230] border border-stone-200 dark:border-purple-300/15 text-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">6. Qual pergunta específica você quer fazer aos Astros / Tarot?</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Nós temos futuro juntos? O que ele(a) realmente sente por mim hoje?"
                  value={astroQuiz.perguntaPrincipal}
                  onChange={(e) => setAstroQuiz({ ...astroQuiz, perguntaPrincipal: e.target.value })}
                  className="w-full rounded-xl px-3.5 py-2 bg-stone-50 dark:bg-[#241230] border border-stone-200 dark:border-purple-300/15 text-stone-800 dark:text-stone-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                <button
                  type="submit"
                  className="w-full sm:flex-1 py-3 px-5 bg-gradient-to-r from-purple-900 to-indigo-700 hover:from-purple-800 hover:to-indigo-600 text-white font-bold rounded-2xl shadow-lg transition-all"
                >
                  Gerar Mapa Astral do Casal & Abrir Cartas →
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
        theme="purple"
        badgeText="Oráculo VIP • LilithLove"
        titleText="Desbloqueie o Dossiê Astral Completo"
        rewardLabel="+2 Leituras Grátis"
      />
    </div>
  );
}