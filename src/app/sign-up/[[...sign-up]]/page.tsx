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
      {/* LADO ESQUERDO: Apresentação Dinâmica e Persuasiva */}
      <div className="lg:w-1/2 bg-gradient-to-br from-[#260710] via-[#1a050c] to-[#110308] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-rose-900/30">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-10 group">
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

          <span className="inline-block px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-amber-300 text-xs font-semibold uppercase tracking-widest mb-4">
            ✦ Inteligência Comportamental & Reconquista
          </span>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold leading-tight mb-6 text-white">
            Crie seu acesso gratuito e assuma o controle do jogo.
          </h1>

          <p className="text-rose-100/90 text-base sm:text-lg leading-relaxed mb-10 max-w-xl">
            Em menos de 10 segundos você libera suas 5 análises gratuitas com a Lilith para decifrar prints, áudios e conversas sem nenhum julgamento.
          </p>

          <div className="space-y-4 max-w-lg">
            <div className="flex items-start gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <span className="text-2xl">✨</span>
              <div>
                <h3 className="font-semibold text-white text-sm sm:text-base">
                  5 Diagnósticos Gratuitos Imediatos
                </h3>
                <p className="text-xs sm:text-sm text-rose-100/75 mt-0.5">
                  Teste o poder de leitura comportamental da Lilith no seu próprio caso agora mesmo.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <span className="text-2xl">🔒</span>
              <div>
                <h3 className="font-semibold text-white text-sm sm:text-base">
                  100% Confidencial e Seguro
                </h3>
                <p className="text-xs sm:text-sm text-rose-100/75 mt-0.5">
                  Seus casos ficam salvos apenas na sua conta privada para quando quiser consultar.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-rose-200/70">
          <span>✨ Cadastro rápido e seguro</span>
          <span>Acesso imediato ao chat</span>
        </div>
      </div>

      {/* LADO DIREITO: Caixa de Cadastro Estilizada */}
      <div className="lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 bg-[#140a0f]">
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-50">
              Comece Agora Gratuitamente
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
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
                  "bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition-all shadow-md",
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