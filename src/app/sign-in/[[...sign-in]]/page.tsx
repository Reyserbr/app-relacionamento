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
      <div className="lg:w-1/2 bg-gradient-to-br from-[#260710] via-[#1a050c] to-[#110308] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-rose-900/30">
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-10 group">
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

          <div className="inline-flex items-center gap-2 rounded-full border border-rose-300/30 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-rose-100 mb-6">
            <span>✦</span> INTELIGÊNCIA COMPORTAMENTAL & RECONQUISTA
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold leading-tight mb-6 text-white">
            Descubra o que realmente passa na cabeça dessa pessoa.
          </h1>

          <p className="text-rose-100/90 text-base sm:text-lg leading-relaxed mb-10 max-w-xl">
            Pare de agir no impulso ou entregar seu controle emocional de bandeja. A Lilith lê as entrelinhas de qualquer conversa e desenha a estratégia exata para virar o jogo a seu favor.
          </p>
        </div>

        <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/15 rounded-2xl p-5 max-w-xl">
          <div className="flex items-start gap-3.5">
            <span className="text-2xl mt-0.5">🔍</span>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base mb-1">
                Envie Prints, Áudios ou Textos do WhatsApp
              </h3>
              <p className="text-xs sm:text-sm text-rose-100/80 leading-relaxed">
                Nossa IA analisa o subtexto oculto, testes de resistência e sinais de interesse ou afastamento.
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
            <p className="text-xs sm:text-sm text-stone-400">
              {nativeMode
                ? "Entre com seu e-mail e senha cadastrados abaixo"
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
              elements: {
                rootBox: "w-full flex justify-center",
                card: "bg-[#1c1016] border border-rose-400/20 shadow-xl rounded-3xl text-stone-100",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: nativeMode
                  ? "hidden"
                  : "bg-white/10 border border-white/15 text-stone-100 hover:bg-white/20",
                socialButtonsBlockButtonText: "text-stone-100 font-semibold",
                dividerRow: nativeMode ? "hidden" : "",
                dividerLine: "bg-white/15",
                dividerText: "text-stone-400",
                formFieldLabel: "text-stone-200",
                formFieldInput:
                  "bg-white/5 border-white/15 text-white placeholder:text-stone-500",
                formButtonPrimary:
                  "bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl",
                footerActionText: "text-stone-400",
                footerActionLink: "text-rose-400 hover:text-rose-300 font-bold underline",
              },
            }}
          />

          <Link
            href="/"
            className="mt-6 text-xs font-medium text-stone-400 hover:text-rose-300 transition-colors"
          >
            ← Voltar para a Página Inicial
          </Link>
        </div>
      </div>
    </div>
  );
}