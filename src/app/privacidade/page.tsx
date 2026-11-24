"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PrivacidadePage() {
  const [supportEmail, setSupportEmail] = useState("suporte@lilithlove.site");

  useEffect(() => {
    fetch("/api/affiliate/config")
      .then((r) => r.json())
      .then((cfg) => {
        if (typeof cfg?.supportEmail === "string" && cfg.supportEmail.trim()) {
          setSupportEmail(cfg.supportEmail.trim());
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#140a0f] text-stone-200 px-4 py-10 sm:py-14 font-sans">
      <div className="max-w-3xl mx-auto bg-[#1d0e16] border border-rose-300/15 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-rose-300/10 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-rose-400">
              Documento Legal • LilithLove
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              Política de Privacidade
            </h1>
            <p className="text-xs text-stone-400 mt-1">Última atualização: Novembro de 2026</p>
          </div>
          <Link
            href="/"
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-rose-500/15 text-xs font-semibold text-stone-200 border border-white/10 transition-colors shrink-0"
          >
            ← Voltar
          </Link>
        </div>

        <section className="space-y-2 text-sm leading-relaxed text-stone-300">
          <h2 className="text-base font-bold text-rose-200">1. Quem somos e escopo</h2>
          <p>
            Esta Política de Privacidade descreve como o <strong>LilithLove</strong> (site{" "}
            <strong>lilithlove.site</strong> e aplicativo Android <strong>com.lilithlove.app</strong>)
            coleta, utiliza, armazena e protege as informações dos usuários, em conformidade com a Lei
            Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018) e as políticas do Google Play.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-stone-300">
          <h2 className="text-base font-bold text-rose-200">2. Dados que coletamos</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Dados de conta e autenticação:</strong> Nome, endereço de e-mail e identificador
              único de usuário gerenciados pelo serviço de autenticação <strong>Clerk</strong>.
            </li>
            <li>
              <strong>Conteúdo enviado pelo usuário:</strong> Mensagens de texto, capturas de tela
              (imagens) e gravações de áudio enviadas voluntariamente nas conversas para análise pela
              inteligência artificial.
            </li>
            <li>
              <strong>Histórico de consultas:</strong> Registros textuais das conversas salvos para
              permitir que você retome suas análises entre dispositivos. Imagens e áudios anexados não
              são mantidos permanentemente no histórico em nuvem.
            </li>
            <li>
              <strong>Dados de publicidade e dispositivo:</strong> No plano gratuito do aplicativo
              Android, o SDK do <strong>Google AdMob</strong> coleta identificadores de publicidade
              (Advertising ID), endereço IP aproximado e interações com anúncios para exibição e
              medição de publicidade.
            </li>
          </ul>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-stone-300">
          <h2 className="text-base font-bold text-rose-200">3. Como utilizamos seus dados</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Autenticar sua conta e manter o histórico das suas consultas sincronizado.</li>
            <li>Processar textos, imagens e áudios por meio de modelos de Inteligência Artificial para gerar as análises solicitadas.</li>
            <li>Controlar limites de uso gratuito e status de assinatura.</li>
            <li>Exibir anúncios relevantes no plano gratuito (Google AdMob) e prevenir fraudes ou abusos.</li>
          </ul>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-stone-300">
          <h2 className="text-base font-bold text-rose-200">4. Compartilhamento com terceiros</h2>
          <p>
            Não vendemos seus dados pessoais. Compartilhamos apenas o estritamente necessário com
            provedores essenciais de infraestrutura sob criptografia HTTPS/TLS:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Clerk:</strong> Autenticação e gerenciamento seguro de login.</li>
            <li><strong>Google Generative AI / Provedores de IA:</strong> Processamento pontual das mensagens e mídias enviadas para gerar respostas.</li>
            <li><strong>Google AdMob:</strong> Exibição de anúncios no aplicativo Android para usuários do plano gratuito.</li>
            <li><strong>Infraestrutura de hospedagem e banco de dados (Vercel / Baserow):</strong> Armazenamento técnico seguro.</li>
          </ul>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-stone-300">
          <h2 className="text-base font-bold text-rose-200">5. Natureza do serviço e conteúdo gerado por IA</h2>
          <p>
            As respostas do LilithLove são geradas automaticamente por Inteligência Artificial com fins
            de <strong>entretenimento, reflexão pessoal e apoio comunicacional</strong>. O aplicativo{" "}
            <strong>não substitui acompanhamento psicológico, psiquiátrico, médico ou jurídico</strong>.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-stone-300">
          <h2 className="text-base font-bold text-rose-200">6. Público-alvo (maiores de 18 anos)</h2>
          <p>
            O LilithLove é destinado exclusivamente a pessoas com <strong>18 anos ou mais</strong>. Não
            coletamos intencionalmente dados de crianças ou adolescentes.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-stone-300">
          <h2 className="text-base font-bold text-rose-200">7. Seus direitos e exclusão de conta</h2>
          <p>
            Você pode solicitar o acesso, correção ou exclusão definitiva da sua conta e do seu
            histórico de conversas a qualquer momento acessando nossa página dedicada:{" "}
            <Link href="/excluir-conta" className="text-rose-400 underline font-semibold">
              lilithlove.site/excluir-conta
            </Link>
            .
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-stone-300 border-t border-rose-300/10 pt-4">
          <h2 className="text-base font-bold text-rose-200">8. Contato</h2>
          <p>
            Em caso de dúvidas sobre privacidade ou proteção de dados, entre em contato pelo e-mail:{" "}
            <a href={`mailto:${supportEmail}`} className="text-rose-400 underline">
              {supportEmail}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}