'use client';

import { useState, useEffect } from 'react';

interface Affiliate {
  id?: number;
  clerk_user_id: string;
  email: string;
  cakto_affiliate_link: string;
  is_active: boolean;
  total_referrals: number;
}

interface Stats {
  totalAffiliates: number;
  activeAffiliates: number;
  totalPremium: number;
  totalUsers: number;
  totalReferrals: number;
}

function Spinner({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function StatCard({ label, value, tint }: { label: string; value: number | string; tint: string }) {
  return (
    <div className={`rounded-2xl p-5 text-center shadow-sm ${tint}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm mt-1 opacity-80">{label}</p>
    </div>
  );
}

export default function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/affiliates');
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? 'Erro ao carregar');
        return;
      }
      setAffiliates(data?.affiliates ?? []);
      setStats(data?.stats ?? null);
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(aff: Affiliate) {
    if (!aff?.id) return;
    setUpdatingId(aff.id);
    try {
      const res = await fetch('/api/admin/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowId: aff.id, is_active: !aff.is_active }),
      });
      if (res.ok) {
        setAffiliates((prev) =>
          prev.map((a) => (a.id === aff.id ? { ...a, is_active: !a.is_active } : a))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-rose-600 dark:text-rose-300">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-stone-800 dark:text-stone-50 mb-2 flex items-center gap-3">
        <span>🛡️</span> Painel do Administrador
      </h1>
      <p className="text-stone-500 dark:text-stone-300 mb-8">
        Acompanhe assinantes, afiliados e aprove ou pause os links de afiliado.
      </p>

      {/* Estatísticas gerais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Assinantes Premium" value={stats?.totalPremium ?? 0} tint="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" />
        <StatCard label="Afiliados ativos" value={stats?.activeAffiliates ?? 0} tint="bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" />
        <StatCard label="Total de afiliados" value={stats?.totalAffiliates ?? 0} tint="bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" />
        <StatCard label="Indicações somadas" value={stats?.totalReferrals ?? 0} tint="bg-stone-100 text-stone-700 dark:bg-white/10 dark:text-stone-200" />
      </div>

      {/* Lista de afiliados */}
      <div className="bg-white dark:bg-white/[0.05] rounded-2xl shadow-md dark:border dark:border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 dark:border-white/10">
          <h2 className="font-semibold text-stone-700 dark:text-stone-100">
            Afiliados cadastrados ({affiliates.length})
          </h2>
          <p className="text-xs text-stone-400 dark:text-stone-400 mt-1">
            Pause um afiliado se o link parecer fraudulento. Links pausados não recebem novas indicações.
          </p>
        </div>

        {affiliates.length === 0 ? (
          <div className="px-6 py-12 text-center text-stone-400 dark:text-stone-400">
            Nenhum afiliado cadastrado ainda.
          </div>
        ) : (
          <ul className="divide-y divide-stone-100 dark:divide-white/10">
            {affiliates.map((aff) => (
              <li key={aff.id ?? aff.clerk_user_id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-800 dark:text-stone-100 truncate">
                    {aff.email || '(sem e-mail)'}
                  </p>
                  <a
                    href={aff.cakto_affiliate_link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-rose-600 dark:text-rose-300 hover:underline break-all font-mono"
                  >
                    {aff.cakto_affiliate_link || '(sem link)'}
                  </a>
                  <p className="text-xs text-stone-400 dark:text-stone-400 mt-1">
                    {aff.total_referrals ?? 0} indicações
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      aff.is_active
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-stone-100 text-stone-500 dark:bg-white/10 dark:text-stone-400'
                    }`}
                  >
                    {aff.is_active ? 'Ativo' : 'Pausado'}
                  </span>
                  <button
                    onClick={() => toggleActive(aff)}
                    disabled={updatingId === aff.id}
                    className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                      aff.is_active
                        ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-stone-100'
                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                    }`}
                  >
                    {updatingId === aff.id ? <Spinner className="w-4 h-4" /> : aff.is_active ? 'Pausar' : 'Ativar'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
