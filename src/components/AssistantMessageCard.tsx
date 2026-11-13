"use client";

import { useState, useEffect } from "react";

interface AttachmentItem {
  name: string;
  mimeType: string;
  previewUrl: string;
}

interface AssistantMessageCardProps {
  messageId: string;
  content: string;
  agent: "lilith" | "reconquista" | "mistico";
  isNew?: boolean;
  copiedId: string | null;
  onCopy: (id: string, text: string) => void;
  attachment?: AttachmentItem;
  attachments?: AttachmentItem[];
}

export default function AssistantMessageCard({
  messageId,
  content,
  agent,
  isNew = false,
  copiedId,
  onCopy,
  attachment,
  attachments,
}: AssistantMessageCardProps) {
  const [displayedText, setDisplayedText] = useState(isNew ? "" : content);
  const [isTyping, setIsTyping] = useState(isNew);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [feedbackSentMsg, setFeedbackSentMsg] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`lilith_fb_${messageId}`);
      if (saved === "up" || saved === "down") setFeedback(saved);
    } catch (_) {}
  }, [messageId]);

  useEffect(() => {
    if (!isNew) {
      setDisplayedText(content);
      setIsTyping(false);
      return;
    }

    let currentIndex = 0;
    const totalLength = content.length;
    setIsTyping(true);

    const interval = setInterval(() => {
      currentIndex += 5;
      if (currentIndex >= totalLength) {
        setDisplayedText(content);
        setIsTyping(false);
        clearInterval(interval);
      } else {
        setDisplayedText(content.slice(0, currentIndex));
      }
    }, 18);

    return () => clearInterval(interval);
  }, [content, isNew]);

  const handleFeedback = async (vote: "up" | "down") => {
    if (feedback === vote) return;
    setFeedback(vote);
    try {
      localStorage.setItem(`lilith_fb_${messageId}`, vote);
    } catch (_) {}

    setFeedbackSentMsg(vote === "up" ? "Obrigado pelo feedback!" : "Registrado para calibrar a IA.");
    setTimeout(() => setFeedbackSentMsg(""), 3000);

    try {
      await fetch("/api/affiliate/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vote,
          agent,
          snippet: content.slice(0, 140),
        }),
      });
    } catch (_) {}
  };

  const isPurple = agent === "mistico";

  const agentBadge =
    agent === "reconquista"
      ? "RECONQUISTE • PROTOCOLO DE REVERSÃO"
      : agent === "mistico"
      ? "ORÁCULO • REVELAÇÃO ASTRAL"
      : "LILITH • CONSULTORIA AMOROSA";

  const renderFormattedContent = (raw: string) => {
    // Remove ### e remove linhas que são apenas "---"
    const cleanText = raw
      .replace(/^#{1,4}\s*/gm, "")
      .replace(/^\s*---+\s*$/gm, "");
    const paragraphs = cleanText.split(/\n\n+/);

    const parseInline = (line: string) => {
      const tokens = line.split(/(\*\*.*?\*\*|\*[^*\n]+?\*)/g);
      return tokens.map((token, index) => {
        if (token.startsWith("**") && token.endsWith("**")) {
          return (
            <strong
              key={index}
              className={`font-semibold ${
                isPurple
                  ? "text-purple-950 dark:text-purple-200"
                  : "text-rose-950 dark:text-rose-200"
              }`}
            >
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

    return paragraphs.map((para, pIdx) => {
      const trimmed = para.trim();
      if (!trimmed) return null;

      // Se for uma mensagem sugerida começando com ">" (blockquote), mostra num card elegante
      if (trimmed.startsWith(">")) {
        const cleanQuote = trimmed.replace(/^>\s*/gm, "");
        return (
          <div
            key={pIdx}
            className={`my-2 p-4 rounded-2xl border-l-4 ${
              isPurple
                ? "bg-purple-500/10 border-l-purple-400 text-purple-950 dark:text-purple-100"
                : "bg-rose-500/10 border-l-rose-400 text-rose-950 dark:text-rose-100"
            } font-medium text-sm sm:text-[15px] leading-relaxed shadow-sm`}
          >
            {parseInline(cleanQuote)}
          </div>
        );
      }

      const isSectionHeader = /^\*\*([123]\.|LEITURA|A VIRADA|O PRÓXIMO|SINASTRIA|TENDÊNCIA|O PONTO|O CRONOGRAMA|O PLANO)/i.test(
        trimmed
      );

      const isVipCallout =
        /Desbloqueie o (meu Plano|Protocolo|Acesso) Premium/i.test(trimmed) ||
        /roteiro completo/i.test(trimmed);

      if (isVipCallout) {
        return (
          <div
            key={pIdx}
            className={`mt-4 p-4 rounded-2xl border ${
              isPurple
                ? "bg-purple-500/10 border-purple-400/30 text-purple-950 dark:text-purple-100"
                : "bg-rose-500/10 border-rose-400/30 text-rose-950 dark:text-rose-100"
            } text-sm sm:text-[15px] leading-relaxed shadow-sm`}
          >
            {parseInline(trimmed)}
          </div>
        );
      }

      if (isSectionHeader) {
        return (
          <div
            key={pIdx}
            className={`pt-2 first:pt-0 border-l-2 pl-3.5 ${
              isPurple ? "border-purple-500/50" : "border-rose-500/50"
            }`}
          >
            <p className="whitespace-pre-wrap leading-relaxed">{parseInline(trimmed)}</p>
          </div>
        );
      }

      return (
        <p key={pIdx} className="whitespace-pre-wrap leading-relaxed">
          {parseInline(trimmed)}
        </p>
      );
    });
  };

  const allAttachments =
    Array.isArray(attachments) && attachments.length > 0
      ? attachments
      : attachment
      ? [attachment]
      : [];

  return (
    <div className="w-full flex items-start gap-3 sm:gap-4 py-2">
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm border ${
          isPurple
            ? "bg-gradient-to-tr from-[#321942] to-[#4c1d6e] border-purple-400/30 text-purple-200"
            : "bg-gradient-to-tr from-[#381826] to-[#6b1630] border-rose-400/30 text-rose-200"
        }`}
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
          />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span
            className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${
              isPurple ? "text-purple-700 dark:text-purple-400" : "text-rose-700 dark:text-rose-400"
            }`}
          >
            <span>✦</span> {agentBadge}
          </span>

          {isTyping && (
            <button
              type="button"
              onClick={() => {
                setDisplayedText(content);
                setIsTyping(false);
              }}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-white/10 text-stone-600 dark:text-stone-300 hover:opacity-80 transition-opacity"
            >
              Mostrar tudo
            </button>
          )}
        </div>

        {allAttachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {allAttachments.map((att, idx) => (
              <div key={idx} className="rounded-xl overflow-hidden bg-black/10 p-1 max-w-xs">
                {att.mimeType.startsWith("image/") && (
                  <img src={att.previewUrl} alt="Anexo" className="max-h-60 rounded-lg object-contain" />
                )}
                {att.mimeType.startsWith("audio/") && (
                  <audio controls src={att.previewUrl} className="w-full" />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3.5 text-stone-800 dark:text-stone-100 text-sm sm:text-[15.5px] leading-relaxed">
          {renderFormattedContent(displayedText)}
          {isTyping && (
            <span
              className={`inline-block w-2 h-4 ml-1 align-middle animate-pulse ${
                isPurple ? "bg-purple-400" : "bg-rose-400"
              }`}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 pt-2 border-t border-stone-200/50 dark:border-white/[0.06] text-[11px] text-stone-400 dark:text-stone-500">
          <button
            type="button"
            onClick={() => onCopy(messageId, content)}
            className="px-2 py-1 rounded-lg hover:bg-stone-200/50 dark:hover:bg-white/5 hover:text-stone-700 dark:hover:text-stone-200 transition-colors flex items-center gap-1.5"
            title="Copiar resposta"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span>{copiedId === messageId ? "Copiado" : "Copiar"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleFeedback("up")}
            className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
              feedback === "up"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold"
                : "hover:bg-stone-200/50 dark:hover:bg-white/5 hover:text-stone-700 dark:hover:text-stone-200"
            }`}
            title="Resposta útil e certeira"
          >
            <svg className="w-3.5 h-3.5" fill={feedback === "up" ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => handleFeedback("down")}
            className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
              feedback === "down"
                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold"
                : "hover:bg-stone-200/50 dark:hover:bg-white/5 hover:text-stone-700 dark:hover:text-stone-200"
            }`}
            title="Resposta genérica ou pouco útil"
          >
            <svg className="w-3.5 h-3.5" fill={feedback === "down" ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
              />
            </svg>
          </button>

          {feedbackSentMsg && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">
              {feedbackSentMsg}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}