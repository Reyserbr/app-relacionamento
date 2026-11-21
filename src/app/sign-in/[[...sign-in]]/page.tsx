"use client";

import { useEffect, useState } from "react";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { isNativeApp } from "@/lib/admob";

export default function SignInPage() {
  const [nativeMode, setNativeMode] = useState(false);

  useEffect(() => {
    setNativeMode(isNativeApp());
  }, []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#140a0f] text-stone-100 font-sans">
      {/* LADO ESQUERDO — APRESENTAÇÃO */}
      <div className="lg:w-1/2 bg-gradient-to-br from-[#260710] via-[#1a050c] to-[#110308] text-white p-7 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-rose-900/30">
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-7 group">
            <img
              src="/logo.png"
              alt="LilithLove"
              className="w-10 h-10 object-contain rounded-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="text-2xl font-serif font-bold tracking-tight text-white">
              LilithLove
            </span>
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-rose-300/30 bg-white/10 px-3.5 py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-rose-100 mb-5">
            <span>✦</span> INTELIGÊNCIA COMPORTAMENTAL & RECONQUISTA
          </div>

          <h1 className="text-2xl sm:text-5xl font-serif font-bold leading-tight mb-4 text-white">
            Descubra o que realmente passa na cabeça dessa pessoa.
          </h1>

          <p className="text-rose-100/85 text-sm sm:text-lg leading-relaxed mb-6 max-w-xl">
            Pare de agir no impulso ou entregar seu controle emocional de bandeja. A Lilith lê as entrelinhas de qualquer conversa e desenha a estratégia exata para virar o jogo.
          </p>
        </div>

        <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 max-w-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">
                Envie Prints, Áudios ou Textos do WhatsApp
              </h3>
              <p className="text-xs text-rose-100/75 leading-relaxed mt-0.5">
                Nossa IA analisa o subtexto oculto, testes de resistência e sinais de interesse.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* LADO DIREITO — FORMULÁRIO DE LOGIN */}
      <div className="lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 bg-[#140a0f]">
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-50 mb-2">
              Acesse sua Consultoria
            </h2>
            <p className="text-xs sm:text-sm text-stone-300">
              {nativeMode
                ? "Entre com seu e-mail e senha ou código de verificação"
                : "Entre com sua conta Google ou e-mail para escolher sua ferramenta"}
            </p>
          </div>

          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            redirectUrl="/"
            afterSignInUrl="/"
            afterSignUpUrl="/"
            appearance={{
              variables: {
                colorPrimary: "#e11d48",
                colorBackground: "#1e1017",
                colorText: "#fafaf9",
                colorTextSecondary: "#d6d3d1",
                colorInputBackground: "#2a1620",
                colorInputText: "#ffffff",
                borderRadius: "1rem",
              },
              elements: {
                rootBox: "w-full flex justify-center",
                card: "bg-[#1e1017] border border-rose-400/25 shadow-2xl rounded-3xl text-stone-100",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                identityPreviewText: "text-stone-100 font-medium",
                identityPreviewEditButton: "text-rose-400 hover:text-rose-300",
                formHeaderTitle: "text-white font-bold",
                formHeaderSubtitle: "text-stone-300",
                otpCodeFieldInput:
                  "bg-[#2a1620] border border-rose-400/40 text-white font-bold text-lg rounded-xl",
                formResendCodeLink: "text-rose-400 hover:text-rose-300 font-semibold",
                alternativeMethodsBlockButton:
                  "bg-white/10 border border-white/15 text-stone-100 hover:bg-white/15",
                socialButtonsBlockButton: nativeMode
                  ? "hidden"
                  : "bg-white/10 border border-white/15 text-stone-100 hover:bg-white/20",
                socialButtonsBlockButtonText: "text-stone-100 font-semibold",
                dividerRow: nativeMode ? "hidden" : "",
                dividerLine: "bg-white/15",
                dividerText: "text-stone-400",
                formFieldLabel: "text-stone-200 font-medium",
                formFieldInput:
                  "bg-[#2a1620] border-white/20 text-white placeholder:text-stone-400",
                formButtonPrimary:
                  "bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg",
                footerActionText: "text-stone-300",
                footerActionLink: "text-rose-400 hover:text-rose-300 font-bold underline",
              },
            }}
          />

          <Link
            href="/"
            className="mt-6 text-xs font-medium text-stone-300 hover:text-rose-300 transition-colors"
          >
            ← Voltar para a Página Inicial
          </Link>
        </div>
      </div>
    </div>
  );
}