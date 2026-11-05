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

interface ToolConfig {
  key: string;
  badge: string;
  title: string;
  desc: string;
  icon: string;
  warning: string;
  buttonLabel: string;
  fields: {
    id: "f1" | "f2" | "f3" | "f4";
    label: string;
    placeholder: string;
    multiline?: boolean;
  }[];
}

const TOOL_CONFIGS: Record<string, ToolConfig> = {
  primeiro_contato: {
    key: "primeiro_contato",
    badge: "Ferramenta Tática • Abertura Magnética",
    title: "Primeiro Contato Irresistível",
    desc: "Puxar assunto e gerar interesse imediato sem parecer óbvio.",
    icon: "👋",
    warning:
      "Mensagens comuns como 'Oi, tudo bem?' são ignoradas. Preencha os detalhes abaixo (opcional) para a Lilith criar um abridor com provocação leve e curiosidade impossível de ignorar.",
    buttonLabel: "🔥 Gerar Abordagem de Primeiro Contato",
    fields: [
      {
        id: "f1",
        label: "1. Onde você vai mandar mensagem?",
        placeholder: "Ex: Direct do Instagram, WhatsApp, Tinder/Bumble, respondeu meu Story...",
      },
      {
        id: "f2",
        label: "2. Vocês já se conhecem ou nunca se falaram?",
        placeholder: "Ex: Nunca nos falamos / Nos vimos numa festa / Já ficamos no passado...",
      },
      {
        id: "f3",
        label: "3. O que chama atenção no perfil, bio ou último Story dessa pessoa?",
        placeholder: "Ex: Postou foto na academia, viagem, música, pet, bebida (ou cole o print com Ctrl+V)...",
      },
      {
        id: "f4",
        label: "4. Qual vibe você quer passar nessa primeira mensagem?",
        placeholder: "Ex: Misterioso(a) e provocante, divertido(a) e debochado(a), direto(a) ao ponto...",
      },
    ],
  },
  red_flags: {
    key: "red_flags",
    badge: "Scanner Comportamental • Prevenção",
    title: "Detector de Red Flags",
    desc: "Identificar joguinhos, mentiras ou manipulação nas mensagens.",
    icon: "🚩",
    warning:
      "Pessoas manipuladoras ou indisponíveis dão sinais sutis logo nas primeiras conversas. Informe os dados abaixo para a Lilith escanear as entrelinhas.",
    buttonLabel: "🚩 Escanear Red Flags Agora",
    fields: [
      {
        id: "f1",
        label: "1. Há quanto tempo vocês estão conversando ou saindo?",
        placeholder: "Ex: 2 semanas / 3 meses / Acabamos de nos conhecer...",
      },
      {
        id: "f2",
        label: "2. Qual atitude ou frase dessa pessoa acendeu seu alerta?",
        placeholder: "Ex: Some no fim de semana, fala muito de ex, promete demais e cumpre pouco...",
      },
      {
        id: "f3",
        label: "3. Como ela reage quando você faz uma pergunta direta?",
        placeholder: "Ex: Muda de assunto, se faz de vítima, diz que sou inseguro(a)...",
      },
      {
        id: "f4",
        label: "4. Cole aqui as mensagens suspeitas (ou aperte Ctrl+V para colar o print):",
        placeholder: "Cole o trecho da conversa para leitura fria...",
        multiline: true,
      },
    ],
  },
  pos_encontro: {
    key: "pos_encontro",
    badge: "Estratégia Pós-Date • Alta Atração",
    title: "O Jogo do Pós-Encontro",
    desc: "O que mandar depois de sair para manter a química lá no alto.",
    icon: "🥂",
    warning:
      "As primeiras 24h após o encontro definem se a pessoa vai viciar em você ou esfriar achando que já te ganhou. Dê o contexto abaixo para acertarmos o timing e a mensagem.",
    buttonLabel: "🥂 Traçar Estratégia Pós-Encontro",
    fields: [
      {
        id: "f1",
        label: "1. Quando foi o encontro e como terminou?",
        placeholder: "Ex: Foi ontem à noite, rolou beijo/química incrível / Foi hoje e ficou dúvida...",
      },
      {
        id: "f2",
        label: "2. Alguém já mandou mensagem depois que se despediram?",
        placeholder: "Ex: Ainda ninguém mandou nada / Ele(a) mandou 'cheguei bem'...",
      },
      {
        id: "f3",
        label: "3. Teve algum assunto engraçado ou piada interna no encontro?",
        placeholder: "Ex: Rimos do garçom, apostamos quem ganhava no jogo, falamos sobre um filme...",
      },
      {
        id: "f4",
        label: "4. Qual é o seu objetivo agora?",
        placeholder: "Ex: Fazer ele(a) sentir saudade e me chamar de novo / Quebrar o gelo sem parecer carente...",
      },
    ],
  },
  responder: {
    key: "responder",
    badge: "Resposta Cirúrgica • Inversão de Poder",
    title: "O Que Eu Respondo Agora?",
    desc: "Resposta exata para virar o jogo e deixar a pessoa pensando em você.",
    icon: "✍️",
    warning:
      "Não responda no impulso! Informe exatamente o que a pessoa mandou para a Lilith calcular uma resposta que gera tensão e coloca você no comando.",
    buttonLabel: "✍️ Gerar Minha Resposta Agora",
    fields: [
      {
        id: "f1",
        label: "1. Qual é a relação de vocês hoje?",
        placeholder: "Ex: Ficante, namorado(a), ex, contatinho novo...",
      },
      {
        id: "f2",
        label: "2. O que exatamente a pessoa acabou de te mandar? (Texto ou Ctrl+V no print)",
        placeholder: "Cole a mensagem exata que você recebeu...",
        multiline: true,
      },
      {
        id: "f3",
        label: "3. Qual o contexto antes dessa mensagem?",
        placeholder: "Ex: Estava sumido(a) há 3 dias e apareceu do nada / Estamos no meio de uma discussão...",
      },
      {
        id: "f4",
        label: "4. Que efeito você quer causar na cabeça dessa pessoa?",
        placeholder: "Ex: Deixar com pulga atrás da orelha, cortar o orgulho dele(a), gerar desejo...",
      },
    ],
  },
  analise: {
    key: "analise",
    badge: "Raio-X Psicológico • Leitura Fria",
    title: "Analisar Conversa e Subtexto",
    desc: "Traduza o que a pessoa realmente quis dizer nas entrelinhas.",
    icon: "🔍",
    warning:
      "As pessoas raramente dizem o que pensam de forma direta. Cole a conversa ou o print abaixo para a Lilith traduzir o que está nas entrelinhas.",
    buttonLabel: "🔍 Decifrar Conversa Agora",
    fields: [
      {
        id: "f1",
        label: "1. Quem é essa pessoa para você e há quanto tempo se falam?",
        placeholder: "Ex: Ficante há 1 mês / Namorado(a) / Alguém que estou conhecendo...",
      },
      {
        id: "f2",
        label: "2. Qual é a sua maior dúvida sobre essa conversa?",
        placeholder: "Ex: Quero saber se perdeu o interesse, se está fazendo joguinho...",
      },
      {
        id: "f3",
        label: "3. Cole o histórico da conversa abaixo (ou aperte Ctrl+V para colar o print):",
        placeholder: "Cole as mensagens aqui...",
        multiline: true,
      },
      {
        id: "f4",
        label: "4. Algum detalhe extra de comportamento fora do chat?",
        placeholder: "Ex: Pessoalmente é carinhoso(a), mas no WhatsApp demora horas...",
      },
    ],
  },
  conselho: {
    key: "conselho",
    badge: "Consultoria Estratégica • Sem Julgamentos",
    title: "Diagnóstico & Conselho Amoroso",
    desc: "Desabafe sobre sua situação e receba um plano de ação estratégico.",
    icon: "💬",
    warning:
      "Conte a verdade sem filtros. Quanto mais claro for o contexto abaixo, mais certeiro será o plano de ação da Lilith para o seu caso.",
    buttonLabel: "💬 Receber Diagnóstico da Lilith",
    fields: [
      {
        id: "f1",
        label: "1. Qual é a situação atual entre vocês?",
        placeholder: "Ex: Estamos ficando mas esfriou / Namoramos e estamos em crise...",
      },
      {
        id: "f2",
        label: "2. O que aconteceu recentemente que te deixou assim?",
        placeholder: "Desabafe livremente sobre o que houve...",
        multiline: true,
      },
      {
        id: "f3",
        label: "3. Qual foi a sua última atitude em relação a essa pessoa?",
        placeholder: "Ex: Cobrei atenção, me afastei em silêncio, tentei conversar...",
      },
      {
        id: "f4",
        label: "4. Qual resultado você mais quer alcançar?",
        placeholder: "Ex: Virar o jogo e fazer a pessoa correr atrás / Saber se vale a pena insistir...",
      },
    ],
  },
};

const STORAGE_KEY = "lilithlove_sessions_v1";
const CLOUD_KEY = "lilith";
const CHECKOUT_URL = "/planos";

export default function LilithChat() {
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

  // Modal de Seleção de Novo Caso e Modal do Questionário da Ferramenta
  const [showCaseSelector, setShowCaseSelector] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolConfig | null>(null);
  const [toolForm, setToolForm] = useState({ f1: "", f2: "", f3: "", f4: "" });

  // Estados do Gravador de Áudio
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const BASE_FREE_LIMIT = 5;
  const totalAllowed = BASE_FREE_LIMIT + bonusLimit;
  const assistantRepliesCount = messages.filter((m) => m.role === "assistant").length;
  const isLimitReached = !isPremium && assistantRepliesCount >= totalAllowed;

  useEffect(() => {
    let localSessions: ChatSession[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) localSessions = JSON.parse(raw);
    } catch (_) {}

    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");

    if (action) {
      const newId = Date.now().toString();
      const toolPicked = TOOL_CONFIGS[action] || TOOL_CONFIGS.conselho;
      const newSession: ChatSession = {
        id: newId,
        title: `${toolPicked.icon} ${toolPicked.title}`,
        updatedAt: "Agora",
        messages: [],
        bonusLimit: 0,
      };
      const updated = [newSession, ...localSessions];
      setSessions(updated);
      setActiveSessionId(newId);
      setMessages([]);
      setBonusLimit(0);
      setActiveTool(toolPicked);
      setToolForm({ f1: "", f2: "", f3: "", f4: "" });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (_) {}
      window.history.replaceState(null, "", "/chat/lilith");
    } else if (localSessions.length > 0) {
      setSessions(localSessions);
      setActiveSessionId(localSessions[0].id);
      setMessages(localSessions[0].messages);
      setBonusLimit(localSessions[0].bonusLimit || 0);
    } else {
      createNewSession([], null);
    }

    fetch(`/api/history?key=${CLOUD_KEY}`)
      .then((r) => r.json())
      .then((d) => {
        if (!action && Array.isArray(d.sessions) && d.sessions.length > 0) {
          const hasCloudMessages = d.sessions.some((s: ChatSession) => s.messages?.length > 0);
          const hasLocalMessages = localSessions.some((s) => s.messages?.length > 0);
          if (hasCloudMessages && (!hasLocalMessages || d.sessions.length >= localSessions.length)) {
            setSessions(d.sessions);
            setActiveSessionId(d.sessions[0].id);
            setMessages(d.sessions[0].messages || []);
            setBonusLimit(d.sessions[0].bonusLimit || 0);
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
      const firstUserMsg = updatedMsgs.find((m) => m.role === "user")?.content || "Novo Caso";
      const cleanTitle =
        firstUserMsg
          .replace(/^[^\wÀ-ÿ]+/, "")
          .replace(/^FERRAMENTA ATIVADA:\s*/i, "")
          .slice(0, 34) + (firstUserMsg.length > 34 ? "..." : "");

      const lightMessages = updatedMsgs.map((m) =>
        m.attachment ? { ...m, attachment: undefined } : m
      );

      const updatedSession: ChatSession = {
        id: activeSessionId || Date.now().toString(),
        title: updatedMsgs.length > 0 ? cleanTitle : "Novo Caso",
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

  // Cria uma nova sessão já vinculada à ferramenta escolhida pelo usuário
  const createNewSession = (currentList = sessions, pickedTool: ToolConfig | null = null) => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: pickedTool ? `${pickedTool.icon} ${pickedTool.title}` : "Novo Caso",
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
    setShowCaseSelector(false);

    if (pickedTool) {
      setToolForm({ f1: "", f2: "", f3: "", f4: "" });
      setActiveTool(pickedTool);
    }

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
        createNewSession([], null);
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
      alert("Permita o acesso ao microfone no navegador para gravar seu áudio.");
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
      content: textToSend.trim() || (attachToSend ? "Analise este arquivo que estou enviando." : ""),
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
        body: JSON.stringify({ messages: updatedMessages, isPremium }),
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
    await sendRawMessage(input, attachment);
  };

  const handleToolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTool) return;

    const partes: string[] = [];
    activeTool.fields.forEach((f) => {
      const val = toolForm[f.id]?.trim();
      if (val) partes.push(`• ${f.label.replace(/^\d+\.\s*/, "")} ${val}`);
    });

    const currentTool = activeTool;
    setActiveTool(null);

    if (partes.length === 0 && !attachment) return;

    const promptMontado = `${currentTool.icon} FERRAMENTA ATIVADA: ${currentTool.title.toUpperCase()}\n${partes.join(
      "\n"
    )}\n\nAplique sua leitura comportamental avançada especificamente para este módulo (${
      currentTool.title
    }), fugindo de abordagens mornas ou clichês.`;

    await sendRawMessage(promptMontado, attachment);
  };

  return (
    <div className="flex h-screen bg-[#faf7f5] dark:bg-[#140a0f] font-sans overflow-hidden transition-colors">
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
          {/* Botão + Novo Caso agora abre o seletor de ferramentas para direcionar o caso */}
          <button
            onClick={() => setShowCaseSelector(true)}
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

      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <header className="flex items-center justify-between gap-2 px-3 sm:px-6 py-3 sm:py-4 bg-white/90 dark:bg-[#1c1016]/90 backdrop-blur-md border-b border-rose-100 dark:border-rose-400/15 shadow-sm shrink-0">
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
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-rose-900 to-rose-600 flex items-center justify-center text-white font-serif font-bold shadow-sm shrink-0">
                L
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-serif font-bold text-stone-900 dark:text-white leading-tight truncate text-sm sm:text-base">Lilith</span>
                <span className="text-[10px] sm:text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setShowCaseSelector(true)}
              className="hidden md:inline-flex text-xs font-semibold px-3 py-1.5 rounded-full bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-200 hover:bg-rose-100 transition-colors"
            >
              ⚡ Escolher Ferramenta
            </button>
            <button
              onClick={() => {
                if (!isPremium) setShowPaywallModal(true);
              }}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3.5 py-1.5 rounded-full border transition-colors ${
                isPremium
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-400/40 cursor-default"
                  : "bg-rose-50 dark:bg-rose-500/15 text-rose-900 dark:text-rose-300 border-rose-200 dark:border-rose-400/30 hover:bg-rose-100"
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
            <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-5">
              <div className="w-20 h-20 bg-gradient-to-tr from-rose-100 to-orange-50 dark:from-rose-500/20 dark:to-rose-900/10 border border-rose-200 dark:border-rose-400/20 rounded-full flex items-center justify-center text-4xl shadow-sm">
                🔮
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-800 dark:text-stone-100">
                Me mostre a verdade.
              </h2>
              <p className="text-stone-500 dark:text-stone-400 max-w-md text-sm sm:text-base leading-relaxed">
                Selecione abaixo qual situação vamos analisar, grave um áudio ou aperte <strong>Ctrl+V para colar o print</strong> da conversa.
              </p>

              <div className="flex flex-wrap justify-center gap-2 max-w-xl pt-2">
                {Object.values(TOOL_CONFIGS).map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      setToolForm({ f1: "", f2: "", f3: "", f4: "" });
                      setActiveTool(t);
                    }}
                    className="px-3.5 py-2 rounded-full bg-white dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/15 border border-stone-200 dark:border-white/10 text-xs font-semibold text-stone-700 dark:text-stone-200 shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <span>{t.icon}</span>
                    <span>{t.title}</span>
                  </button>
                ))}
              </div>
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
                      <span>✦</span> DIAGNÓSTICO DE LILITH
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
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Lilith está lendo as entrelinhas do seu relato...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer className="p-3 sm:p-4 bg-white dark:bg-[#1c1016] border-t border-rose-100 dark:border-rose-400/15 shrink-0">
          <div className="max-w-4xl mx-auto">
            {attachment && (
              <div className="mb-3 flex items-center justify-between bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-400/30 px-4 py-2 rounded-2xl text-xs text-rose-900 dark:text-rose-200">
                <div className="flex items-center gap-3 truncate">
                  {attachment.mimeType.startsWith("image/") ? (
                    <img src={attachment.previewUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-rose-300" />
                  ) : (
                    <span className="text-lg">🎙️</span>
                  )}
                  <span className="font-medium truncate">{attachment.name} (Pronto para análise)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="ml-3 text-rose-800 dark:text-rose-300 hover:text-rose-950 font-bold px-2 py-0.5 rounded-full"
                >
                  ✕
                </button>
              </div>
            )}

            {isLimitReached ? (
              <div className="bg-rose-950 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                <div className="text-center sm:text-left">
                  <p className="font-serif font-bold text-sm sm:text-base text-amber-300">
                    Você atingiu o limite de {totalAllowed} análises gratuitas deste caso.
                  </p>
                  <p className="text-xs text-rose-100">
                    Desbloqueie o Plano de Ação Premium para liberar o roteiro completo e mensagens ilimitadas.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowPaywallModal(true)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs sm:text-sm rounded-xl shadow transition-colors"
                  >
                    🔓 Desbloquear Agora
                  </button>
                </div>
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

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Enviar Print, Áudio ou Vídeo"
                  className="p-3 sm:p-3.5 bg-stone-100 dark:bg-white/5 hover:bg-rose-100 dark:hover:bg-white/10 text-stone-600 dark:text-stone-300 rounded-full transition-colors shrink-0 border border-stone-200 dark:border-white/10 mb-0.5"
                >
                  📎
                </button>

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
                  placeholder="Conte o caso, grave um áudio ou cole o print (Ctrl+V)..."
                  className="w-full bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-800 dark:text-stone-100 dark:placeholder-stone-500 rounded-3xl pl-4 pr-12 py-3 sm:py-3.5 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-500/40 focus:border-rose-400 transition-all shadow-inner text-sm sm:text-base resize-none max-h-40 overflow-y-auto"
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

      {/* NOVO MODAL QUANDO CLICA EM "+ NOVO CASO": ESCOLHA QUAL CASO ANALISAR */}
      {showCaseSelector && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1c1016] border border-rose-200 dark:border-rose-400/25 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl my-auto">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 block">
                  Novo Diagnóstico • LilithLove
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-white mt-0.5">
                  Qual caso vamos analisar agora?
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
                  Escolha o objetivo abaixo para abrirmos a ficha tática ideal para a sua situação:
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCaseSelector(false)}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-300 flex items-center justify-center font-bold shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {Object.values(TOOL_CONFIGS).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => createNewSession(sessions, t)}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/15 border border-stone-200/80 dark:border-white/10 hover:border-rose-300 dark:hover:border-rose-400/40 text-left transition-all group"
                >
                  <span className="text-2xl p-2 rounded-xl bg-white dark:bg-white/10 shadow-sm group-hover:scale-110 transition-transform">
                    {t.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-stone-800 dark:text-stone-100 mb-0.5">
                      {t.title}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-snug">
                      {t.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-stone-100 dark:border-white/10 text-xs">
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Link
                  href="/chat/reconquista"
                  className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 font-semibold border border-rose-200 dark:border-rose-400/25"
                >
                  ❤️‍🩹 Ir para Módulo de Reconquista
                </Link>
                <Link
                  href="/chat/mistico"
                  className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 font-semibold border border-purple-200 dark:border-purple-400/25"
                >
                  🔮 Ir para Astrologia & Tarot
                </Link>
              </div>
              <button
                type="button"
                onClick={() => createNewSession(sessions, null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-300 font-semibold hover:bg-stone-200"
              >
                Abrir Chat Livre sem Ficha →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DO QUESTIONÁRIO DA FERRAMENTA (SEM A BARRA DE SCROLL E SEM AS TAGS) */}
      {activeTool && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1c1016] border border-rose-200 dark:border-rose-400/25 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center text-2xl shrink-0">
                  {activeTool.icon}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 block">
                    {activeTool.badge}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-white">
                    {activeTool.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTool(null)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-300 hover:bg-stone-200 shrink-0"
              >
                Pular →
              </button>
            </div>

            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-400/30 rounded-2xl p-3 mb-5 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              ⚡ <strong>Calibragem de Precisão:</strong> {activeTool.warning}
            </div>

            <form onSubmit={handleToolSubmit} className="space-y-3.5 text-xs sm:text-sm">
              {activeTool.fields.map((field) => (
                <div key={field.id}>
                  <label className="block font-semibold text-stone-700 dark:text-stone-200 mb-1">
                    {field.label}
                  </label>
                  {field.multiline ? (
                    <textarea
                      rows={3}
                      onPaste={handlePaste}
                      placeholder={field.placeholder}
                      value={toolForm[field.id]}
                      onChange={(e) => setToolForm({ ...toolForm, [field.id]: e.target.value })}
                      className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-800 dark:text-stone-100"
                    />
                  ) : (
                    <input
                      type="text"
                      onPaste={handlePaste}
                      placeholder={field.placeholder}
                      value={toolForm[field.id]}
                      onChange={(e) => setToolForm({ ...toolForm, [field.id]: e.target.value })}
                      className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-800 dark:text-stone-100"
                    />
                  )}
                </div>
              ))}

              {attachment && (
                <div className="flex items-center justify-between bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-400/30 px-3.5 py-2 rounded-xl text-xs text-rose-900 dark:text-rose-200">
                  <span className="truncate">📎 Print/Arquivo anexado: {attachment.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachment(null)}
                    className="font-bold ml-2"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                <button
                  type="submit"
                  className="w-full sm:flex-1 py-3 px-5 bg-gradient-to-r from-rose-900 to-rose-700 hover:from-rose-800 hover:to-rose-600 text-white font-bold rounded-2xl shadow-lg transition-all"
                >
                  {activeTool.buttonLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTool(null)}
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
              👑
            </div>

            <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
              Acesso VIP • LilithLove
            </span>
            <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mt-1 mb-2">
              Desbloqueie o Plano de Ação Completo
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-5">
              Tenha acesso imediato à mensagem exata para virar o jogo e consultas ilimitadas com a Lilith:
            </p>

            <ul className="space-y-2.5 text-sm text-stone-700 dark:text-stone-300 mb-6">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                <span><strong>A Mensagem Cirúrgica:</strong> O texto exato para copiar, colar e quebrar o silêncio.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                <span><strong>Guia de Stories e Postura:</strong> O que postar para ativar gatilho de perda.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                <span><strong>Consultas Ilimitadas:</strong> Envie quantos prints, áudios e textos quiser.</span>
              </li>
            </ul>

            <a
              href={CHECKOUT_URL}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-rose-900 to-rose-700 text-white font-bold text-center rounded-2xl shadow-lg block transition-all mb-3"
            >
              Desbloquear Acesso Premium Ilimitado →
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