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

interface ToolConfig {
  key: string;
  badge: string;
  title: string;
  desc: string;
  warning: string;
  buttonLabel: string;
  fields: {
    id: "f1" | "f2" | "f3" | "f4";
    label: string;
    placeholder: string;
    multiline?: boolean;
  }[];
}

function ToolSvgIcon({ type, className = "w-4 h-4" }: { type: string; className?: string }) {
  switch (type) {
    case "primeiro_contato":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
      );
    case "red_flags":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
        </svg>
      );
    case "pos_encontro":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
        </svg>
      );
    case "responder":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "analise":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
  }
}

const TOOL_CONFIGS: Record<string, ToolConfig> = {
  primeiro_contato: {
    key: "primeiro_contato",
    badge: "Especialidade da Lilith • Abertura Magnética",
    title: "Primeiro Contato Irresistível",
    desc: "Puxar assunto e gerar interesse imediato sem parecer óbvio.",
    warning:
      "Mensagens comuns como 'Oi, tudo bem?' são ignoradas. Preencha os detalhes abaixo (opcional) para a Lilith criar um abridor com charme e curiosidade impossível de ignorar.",
    buttonLabel: "Criar Mensagem de Primeiro Contato",
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
        placeholder: "Ex: Postou foto na academia, viagem, música, pet, bebida (ou cole o print)...",
      },
      {
        id: "f4",
        label: "4. Qual vibe você quer passar nessa primeira mensagem?",
        placeholder: "Ex: Misterioso(a) e envolvente, divertido(a) e leve, direto(a) ao ponto...",
      },
    ],
  },
  red_flags: {
    key: "red_flags",
    badge: "Especialidade da Lilith • Leitura de Intenções",
    title: "Detector de Red Flags",
    desc: "Identificar joguinhos, mentiras ou manipulação nas mensagens.",
    warning:
      "Pessoas manipuladoras ou indisponíveis dão sinais sutis logo nas primeiras conversas. Informe os dados abaixo para a Lilith ler as entrelinhas.",
    buttonLabel: "Analisar Sinais de Alerta Agora",
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
        label: "4. Cole aqui as mensagens suspeitas ou cole o print:",
        placeholder: "Cole o trecho da conversa para análise...",
        multiline: true,
      },
    ],
  },
  pos_encontro: {
    key: "pos_encontro",
    badge: "Especialidade da Lilith • Conexão Pós-Date",
    title: "O Jogo do Pós-Encontro",
    desc: "O que mandar depois de sair para manter a química lá no alto.",
    warning:
      "As primeiras 24h após o encontro definem se a pessoa vai sentir saudade ou esfriar achando que já te ganhou. Dê o contexto abaixo para acertarmos a mensagem.",
    buttonLabel: "Criar Mensagem Pós-Encontro",
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
    badge: "Especialidade da Lilith • Resposta Magnética",
    title: "O Que Eu Respondo Agora?",
    desc: "Resposta exata para virar o jogo e deixar a pessoa pensando em você.",
    warning:
      "Não responda no impulso! Informe exatamente o que a pessoa mandou para a Lilith desenhar uma resposta que gera encanto e coloca você no comando.",
    buttonLabel: "Gerar Minha Resposta Agora",
    fields: [
      {
        id: "f1",
        label: "1. Qual é a relação de vocês hoje?",
        placeholder: "Ex: Ficante, namorado(a), ex, contatinho novo...",
      },
      {
        id: "f2",
        label: "2. O que exatamente a pessoa acabou de te mandar? (Texto ou Cole a print)",
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
        label: "4. Que sentimento você quer despertar nessa pessoa?",
        placeholder: "Ex: Curiosidade, saudade, cortar o orgulho dele(a), gerar desejo...",
      },
    ],
  },
  analise: {
    key: "analise",
    badge: "Especialidade da Lilith • Entrelinhas do Amor",
    title: "Analisar Conversa e Subtexto",
    desc: "Traduza o que a pessoa realmente quis dizer nas entrelinhas.",
    warning:
      "As pessoas raramente dizem o que sentem de forma direta. Cole a conversa ou o print abaixo para a Lilith traduzir o que está nas entrelinhas.",
    buttonLabel: "Decifrar Conversa Agora",
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
        label: "3. Cole o histórico da conversa abaixo ou cole a print:",
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
    badge: "Consultoria da Lilith • Sem Julgamentos",
    title: "Diagnóstico & Conselho Amoroso",
    desc: "Desabafe sobre sua situação e receba uma orientação acolhedora e certeira.",
    warning:
      "Conte a verdade sem filtros. Quanto mais claro for o contexto abaixo, mais certeiro será o direcionamento da Lilith para o seu coração.",
    buttonLabel: "Receber Conselho da Lilith",
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
        label: "4. Qual resultado você mais deseja alcançar?",
        placeholder: "Ex: Virar o jogo e fazer a pessoa correr atrás / Saber se vale a pena insistir...",
      },
    ],
  },
};

const STORAGE_KEY = "lilithlove_sessions_v1";
const CLOUD_KEY = "lilith";
const CHECKOUT_URL = "/planos";

// Remove emojis antigos do início dos títulos salvos no histórico
const cleanDisplayTitle = (rawTitle: string) =>
  (rawTitle || "Nova Conversa").replace(/^[^\wÀ-ÿ]+/, "").trim() || "Nova Conversa";

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
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [showCaseSelector, setShowCaseSelector] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolConfig | null>(null);
  const [toolForm, setToolForm] = useState({ f1: "", f2: "", f3: "", f4: "" });

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
        title: toolPicked.title,
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
      const firstUserMsg = updatedMsgs.find((m) => m.role === "user")?.content || "Nova Conversa";
      const cleanTitle =
        firstUserMsg
          .replace(/^[^\wÀ-ÿ]+/, "")
          .replace(/^ESPECIALIDADE LILITH:\s*/i, "")
          .slice(0, 34) + (firstUserMsg.length > 34 ? "..." : "");

      const lightMessages = updatedMsgs.map((m) =>
        m.attachment ? { ...m, attachment: undefined } : m
      );

      const updatedSession: ChatSession = {
        id: activeSessionId || Date.now().toString(),
        title: updatedMsgs.length > 0 ? cleanTitle : "Nova Conversa",
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

  const createNewSession = (currentList = sessions, pickedTool: ToolConfig | null = null) => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: pickedTool ? pickedTool.title : "Nova Conversa",
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
    const nextBonus = bonusLimit + 3;
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

    const promptMontado = `ESPECIALIDADE LILITH: ${currentTool.title.toUpperCase()}\n${partes.join(
      "\n"
    )}\n\nAplique sua leitura comportamental e emocional para este caso (${
      currentTool.title
    }), fugindo de respostas mornas ou clichês.`;

    await sendRawMessage(promptMontado, attachment);
  };

  return (
    <div className="fixed inset-0 flex h-[100dvh] w-full bg-[#faf7f5] dark:bg-[#1a0b12] font-sans overflow-hidden transition-colors">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* BARRA LATERAL RETRÁTIL COM ÍCONES VETORIAIS */}
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
            title="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <span className={`font-serif font-bold text-stone-800 dark:text-stone-100 text-base truncate ${isDesktopCollapsed ? "lg:hidden" : ""}`}>
            LilithLove
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
            onClick={() => {
              setIsSidebarOpen(false);
              setShowCaseSelector(true);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-[#381826] hover:bg-[#4a2033] text-rose-100 border border-rose-300/20 font-semibold text-xs transition-all shadow-sm ${
              isDesktopCollapsed ? "lg:justify-center lg:px-0" : ""
            }`}
            title="Nova Conversa com a Lilith"
          >
            <svg className="w-4 h-4 text-rose-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className={isDesktopCollapsed ? "lg:hidden" : ""}>Nova Conversa</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSidebarOpen(false);
              setShowCaseSelector(true);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5 text-xs font-medium transition-colors ${
              isDesktopCollapsed ? "lg:justify-center lg:px-0" : ""
            }`}
            title="Especialidades da Lilith"
          >
            <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <span className={isDesktopCollapsed ? "lg:hidden" : ""}>Especialidades da Lilith</span>
          </button>

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
            title="Voltar para a Página Inicial"
          >
            <svg className="w-4 h-4 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className={isDesktopCollapsed ? "lg:hidden" : ""}>Voltar ao Início</span>
          </Link>
        </div>

        {/* Lista de Conversas com barra de scroll fina e sem emojis antigos */}
        <div
          className={`flex-1 overflow-y-auto px-2.5 py-2 space-y-1.5 border-t border-stone-100 dark:border-white/5 [scrollbar-width:thin] [scrollbar-color:rgba(244,63,94,0.2)_transparent] ${
            isDesktopCollapsed ? "lg:hidden" : ""
          }`}
        >
          <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Minhas Conversas
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
                  title="Excluir conversa"
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

      {/* ÁREA PRINCIPAL DO CHAT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-[#faf7f5] dark:bg-gradient-to-b dark:from-[#1f0d16] dark:via-[#1a0b12] dark:to-[#14080e]">
        {/* TOPO LIMPO COM ÍCONES VETORIAIS */}
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
              onClick={() => setShowCaseSelector(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-[#28121d] transition-colors min-w-0"
            >
              <span className="font-serif font-bold text-stone-900 dark:text-white text-base sm:text-lg truncate">
                Lilith
              </span>
              <span className="text-xs text-stone-400">▾</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowCaseSelector(true)}
              className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-[#28121d] border border-stone-200/70 dark:border-rose-300/15 hover:bg-rose-100 dark:hover:bg-[#381826] text-stone-700 dark:text-stone-200 flex items-center justify-center transition-colors"
              title="Nova Conversa / Especialidades"
            >
              <svg className="w-4 h-4 text-rose-500 dark:text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
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

        {/* ÁREA DE MENSAGENS */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 max-w-3xl w-full mx-auto [scrollbar-width:thin] [scrollbar-color:rgba(244,63,94,0.2)_transparent]">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-3 space-y-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-rose-500/15 to-amber-500/10 dark:from-[#381826] dark:to-[#240e18] border border-rose-200 dark:border-rose-300/20 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-300 shadow-md">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-800 dark:text-stone-100">
                Por onde quer começar?
              </h2>
              <p className="text-stone-500 dark:text-stone-300/80 max-w-md text-xs sm:text-sm leading-relaxed">
                Selecione abaixo qual situação vamos analisar, grave um áudio ou aperte <strong>Ctrl+V para colar o print</strong> da conversa.
              </p>

              <div className="flex flex-wrap justify-center gap-2.5 max-w-xl pt-2">
                {Object.values(TOOL_CONFIGS).map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      setToolForm({ f1: "", f2: "", f3: "", f4: "" });
                      setActiveTool(t);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#28121d] hover:bg-rose-50 dark:hover:bg-[#381826] border border-stone-200/80 dark:border-rose-300/20 text-xs font-semibold text-stone-700 dark:text-stone-100 shadow-sm transition-all flex items-center gap-2"
                  >
                    <ToolSvgIcon type={t.key} className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                    <span>{t.title}</span>
                  </button>
                ))}
              </div>
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
                      <span>✦</span> LILITH • CONSULTORIA AMOROSA
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
                <span className="text-xs text-stone-500 dark:text-stone-300 font-medium">Lilith está lendo as entrelinhas do seu relato...</span>
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
                    Você atingiu o limite de {totalAllowed} análises gratuitas deste caso.
                  </p>
                  <p className="text-[11px] text-rose-100">
                    Desbloqueie o Plano de Ação Premium para liberar o roteiro completo e mensagens ilimitadas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaywallModal(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl shadow transition-colors shrink-0"
                >
                  Desbloquear Agora
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
                  placeholder="Pergunte a Lilith"
                  style={{ border: "none", outline: "none", boxShadow: "none" }}
                  className="flex-1 bg-transparent !border-0 !ring-0 !outline-none !shadow-none appearance-none text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-400/80 px-1 py-1.5 text-sm sm:text-base resize-none max-h-32 overflow-y-auto leading-normal"
                />

                <button
                  type="button"
                  onClick={toggleRecording}
                  title={isRecording ? "Parar gravação" : "Gravar áudio"}
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

      {/* MODAL DE ESCOLHA DE ESPECIALIDADE DA LILITH */}
      {showCaseSelector && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1c0d15] border border-rose-200 dark:border-rose-300/20 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl my-auto max-h-[90dvh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 block">
                  Consultoria da Lilith • LilithLove
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-white mt-0.5">
                  Qual situação vamos analisar agora?
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
                  Escolha o tema abaixo para a Lilith preparar a análise ideal para você:
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
              {Object.values(TOOL_CONFIGS).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => createNewSession(sessions, t)}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-[#28121d] hover:bg-rose-50 dark:hover:bg-[#381826] border border-stone-200/80 dark:border-rose-300/15 hover:border-rose-300 dark:hover:border-rose-400/40 text-left transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 dark:bg-white/10 flex items-center justify-center text-rose-600 dark:text-rose-300 shrink-0 group-hover:scale-110 transition-transform">
                    <ToolSvgIcon type={t.key} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-100 mb-0.5">
                      {t.title}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-300/80 leading-snug">
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
                  className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-[#28121d] text-rose-800 dark:text-rose-200 font-semibold border border-rose-200 dark:border-rose-400/25 flex items-center gap-1.5"
                >
                  <span>Ir para Reconquiste →</span>
                </Link>
                <Link
                  href="/chat/mistico"
                  className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 font-semibold border border-purple-200 dark:border-purple-400/25 flex items-center gap-1.5"
                >
                  <span>Ir para Oráculo Astral →</span>
                </Link>
              </div>
              <button
                type="button"
                onClick={() => createNewSession(sessions, null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-300 font-semibold hover:bg-stone-200"
              >
                Conversa Livre com a Lilith →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DO QUESTIONÁRIO DA ESPECIALIDADE */}
      {activeTool && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1c0d15] border border-rose-200 dark:border-rose-300/25 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl my-auto max-h-[90dvh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/10 dark:bg-[#28121d] border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-300 shrink-0">
                  <ToolSvgIcon type={activeTool.key} className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 block">
                    {activeTool.badge}
                  </span>
                  <h3 className="text-lg sm:text-2xl font-serif font-bold text-stone-900 dark:text-white">
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
              <strong>Dica da Lilith:</strong> {activeTool.warning}
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
                      className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-[#28121d] border border-stone-200 dark:border-rose-300/15 text-stone-800 dark:text-stone-100"
                    />
                  ) : (
                    <input
                      type="text"
                      onPaste={handlePaste}
                      placeholder={field.placeholder}
                      value={toolForm[field.id]}
                      onChange={(e) => setToolForm({ ...toolForm, [field.id]: e.target.value })}
                      className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-[#28121d] border border-stone-200 dark:border-rose-300/15 text-stone-800 dark:text-stone-100"
                    />
                  )}
                </div>
              ))}

              {attachment && (
                <div className="flex items-center justify-between bg-rose-50 dark:bg-[#28121d] border border-rose-200 dark:border-rose-400/30 px-3.5 py-2 rounded-xl text-xs text-rose-900 dark:text-rose-200">
                  <span className="truncate">Print/Arquivo anexado: {attachment.name}</span>
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
                  className="w-full sm:flex-1 py-3 px-5 bg-gradient-to-r from-[#6b1630] to-[#8a1c3e] hover:from-[#7d1a38] hover:to-[#9e2147] text-white font-bold rounded-2xl shadow-lg transition-all"
                >
                  {activeTool.buttonLabel} →
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

      {/* MODAL DE PAYWALL + ANÚNCIO DE 10 SEGUNDOS INTEGRADO */}
      <RewardedAdModal
        isOpen={showPaywallModal && !isPremium}
        onClose={() => setShowPaywallModal(false)}
        onRewardEarned={handleUnlockAdBonus}
        checkoutUrl={CHECKOUT_URL}
        theme="rose"
      />
    </div>
  );
}