"use client";

import { useEffect, useState } from "react";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { isNativeApp } from "@/lib/admob";

export default function SignUpPage() {
  const [nativeMode, setNativeMode] = useState(false);

  useEffect(() => {
    setNativeMode(isNativeApp());
  }, []);

  return (
    <div className="min-h-screen bg-[#140a0f] flex flex-col lg:flex-row font-sans text-stone-100">
      {/* LADO ESQUERDO */}
      <div className="lg:w-1/2 bg-gradient-to-br from-[#260710] via-[#1a050c] to-[#110308] text-white p-7 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-rose-900/30">
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-7 group">
            <img
              src="/logo.png"
              alt="LilithLove"
              className="w-10 h-10 object-contain rounded-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="font-serif font-bold text-2xl tracking-tight text-white">
              LilithLove
            </span>
          </Link>

          <span className="inline-block px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-amber-300 text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-4">
            ✦ Inteligência Comportamental & Reconquista
          </span>

          <h1 className="text-2xl sm:text-5xl font-serif font-bold leading-tight mb-4 text-white">
            Crie seu acesso gratuito e assuma o controle do jogo.
          </h1>

          <p className="text-rose-100/85 text-sm sm:text-lg leading-relaxed mb-6 max-w-xl">
            Em menos de 10 segundos você libera suas 5 análises gratuitas com a Lilith para decifrar prints, áudios e conversas.
          </p>
        </div>

        <div className="relative z-10 bg-white/5 border border-white/15 p-4 rounded-2xl backdrop-blur-sm max-w-lg">
          <div className="flex items-center gap-3.5">
            <span className="text-xl">✨</span>
            <div>
              <h3 className="font-semibold text-white text-sm">
                5 Diagnósticos Gratuitos Imediatos
              </h3>
              <p className="text-xs text-rose-100/75 mt-0.5">
                100% confidencial e sincronizado na sua conta privada.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: Caixa de Cadastro */}
      <div className="lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 bg-[#140a0f]">
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-50">
              Comece Agora Gratuitamente
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1">
              {nativeMode
                ? "Preencha seu e-mail e crie uma senha para liberar o chat da Lilith"
                : "Crie sua conta em 1 clique para liberar o chat da Lilith"}
            </p>
          </div>

          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
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
                  "bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg",
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