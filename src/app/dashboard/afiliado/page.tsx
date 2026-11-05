'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AffiliateStatus {
  clerk_user_id: string;
  is_premium: boolean;
  premium_since: string | null;
  is_affiliate: boolean;
  cakto_affiliate_link: string | null;
  pending_link?: string | null;
  total_referrals: number;
  referral_link: string;
}

// Caso tenha o link direto de convite de afiliação do produto na Cakto, cole aqui:
const CAKTO_AFFILIATE_INVITE_URL = 'https://app.cakto.com.br';

function Icon({ path, className = 'w-5 h-5', fill = 'none' }: { path: string; className?: string; fill?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d={path} />
    </svg>
  );
}
const CopyIcon = (p: any) => <Icon {...p} path="M8 4h10a2 2 0 0 1 2 2v10M16 8H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2z" />;
const CheckIcon = (p: any) => <Icon {...p} path="M20 6L9 17l-5-5" />;
const UsersIcon = (p: any) => <Icon {...p} path="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />;
const LinkIcon = (p: any) => <Icon {...p} path="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />;
const CrownIcon = (p: any) => <Icon {...p} path="M2 7l5 5 5-7 5 7 5-5v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7z" />;
const ExternalIcon = (p: any) => <Icon {...p} path="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />;
const AlertIcon = (p: any) => <Icon {...p} path="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />;
const MoneyIcon = (p: any) => <Icon {...p} path="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />;
const RepeatIcon = (p: any) => <Icon {...p} path="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />;
const HeartIcon = (p: any) => <Icon {...p} path="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />;
function Spinner({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export default function AfiliadoPage() {
  const [status, setStatus] = useState<AffiliateStatus | null>(null);
  const [programOpen, setProgramOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      const [resStatus, resConfig] = await Promise.all([
        fetch('/api/affiliate/status'),
        fetch('/api/affiliate/config').catch(() => null),
      ]);
      if (!resStatus.ok) throw new Error('Erro ao buscar status');
      const data = await resStatus.json();
      setStatus(data);
      if (data?.pending_link) {
        setAffiliateLink(data.pending_link);
      } else if (data?.cakto_affiliate_link) {
        setAffiliateLink(data.cakto_affiliate_link);
      }
      if (resConfig && resConfig.ok) {
        const cfg = await resConfig.json();
        if (typeof cfg.isOpen === 'boolean') setProgramOpen(cfg.isOpen);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveLink() {
    if (!affiliateLink?.trim()) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/affiliate/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cakto_affiliate_link: affiliateLink.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveMsg(data?.error ?? 'Erro ao salvar');
        return;
      }
      setSaveMsg(data?.message ?? 'Link enviado para análise com sucesso!');
      fetchStatus();
    } catch (err: any) {
      setSaveMsg(err?.message ?? 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator?.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-rose-600 dark:text-rose-300">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="text-red-500"><AlertIcon className="w-12 h-12" /></span>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  const isExistingAffiliate = Boolean(status?.is_affiliate || status?.cakto_affiliate_link || status?.pending_link);
  if (!programOpen && !isExistingAffiliate) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 flex items-center justify-center mx-auto mb-5 text-3xl">
          🔒
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-800 dark:text-stone-50 mb-3">
          Vagas para Afiliados Temporariamente Encerradas
        </h1>
        <p className="text-stone-500 dark:text-stone-300 leading-relaxed mb-8 text-sm sm:text-base">
          Atingimos o limite atual de parceiros oficiais da LilithLove. Novas vagas serão reabertas em breve.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-rose-900 hover:bg-rose-800 text-white px-6 py-3 rounded-full transition-colors text-sm font-semibold shadow"
        >
          ← Voltar para a Página Inicial
        </Link>
      </div>
    );
  }

  // Define o rótulo claro do status do afiliado
  let statusBadgeText = 'Inativo';
  let statusBadgeColor = 'text-stone-500 dark:text-stone-400';
  if (status?.is_affiliate && status?.cakto_affiliate_link) {
    statusBadgeText = 'Ativo & Aprovado';
    statusBadgeColor = 'text-emerald-600 dark:text-emerald-400';
  } else if (status?.pending_link) {
    statusBadgeText = 'Em Análise';
    statusBadgeColor = 'text-amber-600 dark:text-amber-300';
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link href="/" className="text-xs sm:text-sm font-medium text-stone-500 hover:text-rose-600">
          ← Voltar ao Início
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-50 mb-2 flex items-center gap-3">
        <span className="text-amber-500 dark:text-amber-400"><CrownIcon className="w-8 h-8" /></span>
        Painel de Afiliado
      </h1>
      <p className="text-stone-500 dark:text-stone-300 mb-8">
        Indique a LilithLove, divulgue para a sua audiência e ganhe comissão automática todos os meses.
      </p>

      {/* Bloco de destaque: 30% de comissão recorrente */}
      <div className="rounded-3xl p-7 mb-6 bg-gradient-to-br from-rose-600 to-rose-800 dark:from-rose-700 dark:to-rose-950 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-6 -top-6 opacity-20"><HeartIcon className="w-32 h-32" /></div>
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest mb-4">
            <MoneyIcon className="w-4 h-4" /> Programa de Afiliados Oficial
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-3 leading-tight">
            Ganhe <span className="text-amber-300">30% de comissão recorrente</span> indicando a LilithLove
          </h2>
          <p className="text-white/90 leading-relaxed mb-5 text-sm sm:text-base">
            A cada pessoa que entra pelo seu link de divulgação e assina o plano Premium, a plataforma de pagamentos <strong>Cakto divide o valor automaticamente</strong> e envia <strong>30% direto para a sua conta</strong> todos os meses enquanto a assinatura estiver ativa.
          </p>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-amber-300"><RepeatIcon className="w-5 h-5" /></span>
              <span className="text-white/90"><strong>Renda Recorrente:</strong> Você ganha na primeira assinatura e em todas as renovações mensais.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-amber-300"><MoneyIcon className="w-5 h-5" /></span>
              <span className="text-white/90"><strong>Saque direto via Pix:</strong> A comissão cai direto na sua carteira da Cakto sem intermediários.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* GUIA PASSO A PASSO: REQUISITOS, COMO CRIAR CONTA NA CAKTO E ONDE PEGAR O LINK */}
      <div className="bg-white dark:bg-white/[0.05] rounded-2xl shadow-md border border-stone-100 dark:border-white/10 p-6 mb-6">
        <h2 className="text-lg font-serif font-bold text-stone-800 dark:text-stone-100 mb-2 flex items-center gap-2">
          <span>📋</span> Como Funciona e Requisitos para se Afiliar
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-300 mb-5 leading-relaxed">
          Para garantir que suas comissões caiam automaticamente no seu Pix ou conta bancária a cada venda, siga estes <strong>4 passos simples</strong>:
        </p>

        <div className="space-y-4 text-xs sm:text-sm">
          {/* Passo 1 */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/70 dark:border-white/10">
            <p className="font-bold text-rose-800 dark:text-rose-300 mb-1">
              1º Passo: Requisito Obrigatório — Ser Assinante Premium
            </p>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              O programa de parceiros é exclusivo para membros com assinatura <strong>Premium ativa</strong> na LilithLove. Assim você conhece a ferramenta por dentro e divulga com autoridade.
            </p>
          </div>

          {/* Passo 2 */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/70 dark:border-white/10">
            <p className="font-bold text-rose-800 dark:text-rose-300 mb-1">
              2º Passo: Criar sua Conta Gratuita na Cakto (O que você precisa)
            </p>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-2">
              A <strong>Cakto</strong> é a processadora oficial de pagamentos da LilithLove. Para criar sua conta gratuita lá, você só precisa de:
            </p>
            <ul className="list-disc list-inside text-stone-600 dark:text-stone-300 space-y-1 ml-1">
              <li>Seu <strong>Nome completo</strong>, <strong>E-mail</strong> e <strong>Celular (WhatsApp)</strong>;</li>
              <li>Seu <strong>CPF</strong> (Pessoa Física) ou <strong>CNPJ</strong>;</li>
              <li>Uma <strong>Chave Pix ou Conta Bancária</strong> da mesma titularidade para receber seus saques.</li>
            </ul>
          </div>

          {/* Passo 3 */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/70 dark:border-white/10">
            <p className="font-bold text-rose-800 dark:text-rose-300 mb-1">
              3º Passo: Solicitar Afiliação e Encontrar seu Link Correto na Cakto
            </p>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-3">
              Com a conta criada na Cakto, clique no botão abaixo para acessar a plataforma/vitrine, solicite a afiliação ao produto <strong>LilithLove</strong> e depois siga este caminho no menu lateral da Cakto:
            </p>
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-400/30 rounded-lg p-3 text-amber-950 dark:text-amber-200 text-xs mb-3 leading-relaxed">
              📍 <strong>Onde encontrar o link correto na Cakto:</strong><br />
              No painel da Cakto, vá no menu esquerdo em <strong>Produtos</strong> &rarr; clique na aba <strong>Minhas Afiliações</strong> &rarr; clique em <strong>LilithLove</strong> &rarr; vá em <strong>Links de Divulgação (Checkout)</strong> e copie o seu link que começa com <code className="font-mono font-bold">https://pay.cakto.com.br/...</code>
            </div>
            <a
              href={CAKTO_AFFILIATE_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-rose-900 hover:bg-rose-800 dark:bg-rose-600 dark:hover:bg-rose-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow transition-colors"
            >
              <ExternalIcon className="w-4 h-4" /> Criar Conta / Solicitar Afiliação na Cakto
            </a>
          </div>

          {/* Passo 4 */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/70 dark:border-white/10">
            <p className="font-bold text-rose-800 dark:text-rose-300 mb-1">
              4º Passo: Colar o Link da Cakto abaixo e Divulgar seu Link de Indicação!
            </p>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              Cole o seu link <code className="font-mono">https://pay.cakto.com.br/...</code> no campo de validação lá embaixo para nossa equipe aprovar. Depois de aprovado, <strong>divulgue nas suas redes sociais o seu Link de Indicação da LilithLove</strong> (exibido logo abaixo). Assim a pessoa usa o chat gratuitamente e, quando clicar em assinar, o sistema abre automaticamente o seu checkout da Cakto!
            </p>
          </div>
        </div>
      </div>

      {/* Status Premium */}
      <div className="bg-white dark:bg-white/[0.05] rounded-2xl shadow-md dark:border dark:border-white/10 p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-3 h-3 rounded-full ${status?.is_premium ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-600'}`} />
          <span className="font-semibold text-stone-700 dark:text-stone-100">
            {status?.is_premium ? 'Assinante Premium Ativo' : 'Plano Gratuito'}
          </span>
        </div>
        {!status?.is_premium && (
          <div className="mt-3">
            <p className="text-sm text-stone-500 dark:text-stone-300 mb-4">
              Para liberar o envio do seu link de afiliado da Cakto e começar a receber comissões, ative sua assinatura Premium:
            </p>
            <Link
              href="/planos"
              className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg transition-colors text-sm font-semibold"
            >
              <CrownIcon className="w-4 h-4" /> Quero ser Premium e liberar minha Afiliação
            </Link>
          </div>
        )}
      </div>

      {/* Estatísticas */}
      <div className="bg-white dark:bg-white/[0.05] rounded-2xl shadow-md dark:border dark:border-white/10 p-6 mb-6">
        <h2 className="font-semibold text-stone-700 dark:text-stone-100 mb-4">Suas Indicações e Status</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-rose-50 dark:bg-rose-950/50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-rose-600 dark:text-rose-300">{status?.total_referrals ?? 0}</p>
            <p className="text-sm text-stone-500 dark:text-stone-300 mt-1">Pessoas indicadas</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/50 rounded-xl p-4 text-center flex flex-col justify-center">
            <p className={`text-xl sm:text-2xl font-bold ${statusBadgeColor}`}>{statusBadgeText}</p>
            <p className="text-sm text-stone-500 dark:text-stone-300 mt-1">Status do link</p>
          </div>
        </div>
      </div>

      {/* Cadastrar Link de Afiliado Cakto (Com fila de aprovação!) */}
      {status?.is_premium && (
        <div className="bg-white dark:bg-white/[0.05] rounded-2xl shadow-md dark:border dark:border-white/10 p-6 mb-6">
          <h2 className="font-semibold text-stone-700 dark:text-stone-100 mb-2 flex items-center gap-2">
            <span className="text-rose-500 dark:text-rose-300"><LinkIcon /></span>
            Seu Link de Checkout de Afiliado Cakto
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-300 mb-4">
            Cole abaixo o link de afiliado gerado pela Cakto (<code className="font-mono text-xs">https://pay.cakto.com.br/...</code>). Por segurança, todo link passa por uma rápida validação do administrador antes de entrar no ar.
          </p>

          {/* Mostra o Link Aprovado Atual (que está valendo no sistema) */}
          {status?.cakto_affiliate_link && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                <span>✅</span>
                <span>Link Aprovado e Ativo no Checkout:</span>
              </div>
              <p className="font-mono text-emerald-700 dark:text-emerald-200 break-all">
                {status.cakto_affiliate_link}
              </p>
            </div>
          )}

          {/* Mostra o Link em Análise (se houver) */}
          {status?.pending_link && (
            <div className="mb-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300 mb-1">
                <span>⏳</span>
                <span>
                  {status?.cakto_affiliate_link
                    ? 'Novo Link em Análise (Seu link aprovado acima continua valendo até a aprovação deste):'
                    : 'Link em Análise pelo Administrador:'}
                </span>
              </div>
              <p className="font-mono text-amber-700 dark:text-amber-200 break-all">
                {status.pending_link}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="url"
              placeholder="https://pay.cakto.com.br/seu-codigo"
              value={affiliateLink}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAffiliateLink(e.target.value)}
              className="flex-1 bg-white dark:bg-white/5 border border-stone-200 dark:border-white/15 rounded-lg px-4 py-2.5 text-sm text-stone-700 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-500"
            />
            <button
              onClick={handleSaveLink}
              disabled={saving || !affiliateLink?.trim()}
              className="flex items-center justify-center gap-1 bg-stone-800 hover:bg-stone-900 dark:bg-rose-600 dark:hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 shrink-0"
            >
              {saving ? <Spinner className="w-4 h-4" /> : <ExternalIcon className="w-4 h-4" />}
              {status?.cakto_affiliate_link ? 'Solicitar Troca de Link' : 'Enviar para Análise'}
            </button>
          </div>

          {saveMsg && (
            <p className={`text-xs sm:text-sm mt-3 font-medium ${saveMsg.includes('Erro') || saveMsg.includes('insira') ? 'text-red-500 dark:text-red-400' : 'text-amber-600 dark:text-amber-300'}`}>
              {saveMsg}
            </p>
          )}
        </div>
      )}

      {/* Link de referência pessoal */}
      <div className="bg-white dark:bg-white/[0.05] rounded-2xl shadow-md dark:border dark:border-white/10 p-6">
        <h2 className="font-semibold text-stone-700 dark:text-stone-100 mb-2 flex items-center gap-2">
          <span className="text-rose-500 dark:text-rose-300"><UsersIcon /></span>
          Seu Link de Divulgação da LilithLove
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-300 mb-3">
          Assim que seu link da Cakto acima estiver <strong>Aprovado</strong>, divulgue este link abaixo na sua bio, stories e vídeos. Quem entrar por ele será vinculado a você:
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            readOnly
            value={status?.referral_link ?? ''}
            className="flex-1 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/15 rounded-lg px-4 py-2.5 text-sm text-stone-700 dark:text-stone-100 font-mono"
          />
          <button
            onClick={() => copyToClipboard(status?.referral_link ?? '')}
            className="flex items-center justify-center gap-1 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-lg transition-colors text-sm font-medium"
          >
            {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>
    </div>
  );
}