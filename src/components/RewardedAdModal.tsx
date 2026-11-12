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

interface PlanItem {
  id: string;
  name: string;
  badge: string;
  price: string;
  period: string;
  checkoutUrl: string;
  benefits: string[];
  buttonText: string;
}

const ADMIN_LESSONS_LIST = [
  { id: 'cz_1', track: '🛑 Contato Zero', title: 'Aula 01 (Grátis): A Neurociência da Ausência' },
  { id: 'cz_2', track: '🛑 Contato Zero', title: 'Aula 02 (VIP): Guerra Silenciosa nos Stories' },
  { id: 'cz_3', track: '🛑 Contato Zero', title: 'Aula 03 (VIP): Testes de Migalha (Breadcrumbing)' },
  { id: 'ap_1', track: '✨ Amor Próprio', title: 'Aula 01 (Grátis): Desintoxicação de Dopamina' },
  { id: 'ap_2', track: '✨ Amor Próprio', title: 'Aula 02 (VIP): A Síndrome do Salvador e o Fim da Carência' },
  { id: 'cf_1', track: '🔥 Confiança', title: 'Aula 01 (Grátis): A Lei do Menor Esforço' },
  { id: 'cf_2', track: '🔥 Confiança', title: 'Aula 02 (VIP): Domínio de Presença no Encontro' },
];

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

function parseAffiliateLinks(rawLink: string) {
  const raw = String(rawLink ?? '').trim();
  if (raw.includes('||PENDING::')) {
    const [approved, pending] = raw.split('||PENDING::');
    return { approved: approved.trim(), pending: pending.trim() };
  }
  if (raw.startsWith('PENDING::')) {
    return { approved: '', pending: raw.replace('PENDING::', '').trim() };
  }
  return { approved: raw, pending: '' };
}

export default function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Alavancas Globais
  const [programOpen, setProgramOpen] = useState(true);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [salesPopupOpen, setSalesPopupOpen] = useState(true);
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  // Configurações de Rede de Anúncios (AdSense / Monetag / Adsterra)
  const [adsProvider, setAdsProvider] = useState<'adsense' | 'custom'>('adsense');
  const [adsenseClientId, setAdsenseClientId] = useState('');
  const [adsenseBannerSlot, setAdsenseBannerSlot] = useState('');
  const [adsenseModalSlot, setAdsenseModalSlot] = useState('');
  const [customBannerHtml, setCustomBannerHtml] = useState('');
  const [customModalHtml, setCustomModalHtml] = useState('');
  const [savingAds, setSavingAds] = useState(false);
  const [adsSavedMsg, setAdsSavedMsg] = useState('');

  // Planos e Vídeos das Aulas
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [lessonVideos, setLessonVideos] = useState<Record<string, string>>({});
  const [savingPlans, setSavingPlans] = useState(false);
  const [plansSavedMsg, setPlansSavedMsg] = useState('');
  const [savingVideos, setSavingVideos] = useState(false);
  const [videosSavedMsg, setVideosSavedMsg] = useState('');

  useEffect(() => {
    load();
    fetch('/api/affiliate/config')
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.isOpen === 'boolean') setProgramOpen(d.isOpen);
        if (typeof d.communityOpen === 'boolean') setCommunityOpen(d.communityOpen);
        if (typeof d.salesPopupOpen === 'boolean') setSalesPopupOpen(d.salesPopupOpen);
        if (typeof d.adsEnabled === 'boolean') setAdsEnabled(d.adsEnabled);
        if (d.adsProvider === 'custom' || d.adsProvider === 'adsense') setAdsProvider(d.adsProvider);
        if (typeof d.adsenseClientId === 'string') setAdsenseClientId(d.adsenseClientId);
        if (typeof d.adsenseBannerSlot === 'string') setAdsenseBannerSlot(d.adsenseBannerSlot);
        if (typeof d.adsenseModalSlot === 'string') setAdsenseModalSlot(d.adsenseModalSlot);
        if (typeof d.customBannerHtml === 'string') setCustomBannerHtml(d.customBannerHtml);
        if (typeof d.customModalHtml === 'string') setCustomModalHtml(d.customModalHtml);
        if (Array.isArray(d.plans) && d.plans.length > 0) setPlans(d.plans);
        if (d.lessonVideos && typeof d.lessonVideos === 'object') setLessonVideos(d.lessonVideos);
      })
      .catch(() => {});
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
      const realAffiliates = (data?.affiliates ?? []).filter(
        (a: Affiliate) => a.clerk_user_id !== '__SYSTEM_CONFIG__'
      );
      setAffiliates(realAffiliates);
      setStats(data?.stats ?? null);
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }

  async function saveGlobalConfig(overrides: {
    isOpen?: boolean;
    communityOpen?: boolean;
    salesPopupOpen?: boolean;
    adsEnabled?: boolean;
    adsProvider?: 'adsense' | 'custom';
    adsenseClientId?: string;
    adsenseBannerSlot?: string;
    adsenseModalSlot?: string;
    customBannerHtml?: string;
    customModalHtml?: string;
    plans?: PlanItem[];
    lessonVideos?: Record<string, string>;
  }) {
    const payload = {
      isOpen: overrides.isOpen ?? programOpen,
      communityOpen: overrides.communityOpen ?? communityOpen,
      salesPopupOpen: overrides.salesPopupOpen ?? salesPopupOpen,
      adsEnabled: overrides.adsEnabled ?? adsEnabled,
      adsProvider: overrides.adsProvider ?? adsProvider,
      adsenseClientId: overrides.adsenseClientId ?? adsenseClientId,
      adsenseBannerSlot: overrides.adsenseBannerSlot ?? adsenseBannerSlot,
      adsenseModalSlot: overrides.adsenseModalSlot ?? adsenseModalSlot,
      customBannerHtml: overrides.customBannerHtml ?? customBannerHtml,
      customModalHtml: overrides.customModalHtml ?? customModalHtml,
      plans: overrides.plans ?? plans,
      lessonVideos: overrides.lessonVideos ?? lessonVideos,
    };
    const res = await fetch('/api/affiliate/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  }

  async function handleToggleSwitch(type: 'affiliates' | 'community' | 'salesPopup' | 'ads') {
    setTogglingKey(type);
    try {
      if (type === 'affiliates') {
        const next = !programOpen;
        if (await saveGlobalConfig({ isOpen: next })) setProgramOpen(next);
      } else if (type === 'community') {
        const next = !communityOpen;
        if (await saveGlobalConfig({ communityOpen: next })) setCommunityOpen(next);
      } else if (type === 'salesPopup') {
        const next = !salesPopupOpen;
        if (await saveGlobalConfig({ salesPopupOpen: next })) setSalesPopupOpen(next);
      } else if (type === 'ads') {
        const next = !adsEnabled;
        if (await saveGlobalConfig({ adsEnabled: next })) setAdsEnabled(next);
      }
    } finally {
      setTogglingKey(null);
    }
  }

  async function handleSaveAdsConfig() {
    setSavingAds(true);
    setAdsSavedMsg('');
    try {
      if (
        await saveGlobalConfig({
          adsProvider,
          adsenseClientId,
          adsenseBannerSlot,
          adsenseModalSlot,
          customBannerHtml,
          customModalHtml,
        })
      ) {
        setAdsSavedMsg('✅ Configurações de Monetização e Anúncios salvas no site!');
        setTimeout(() => setAdsSavedMsg(''), 4000);
      } else {
        setAdsSavedMsg('❌ Erro ao salvar configurações de anúncios.');
      }
    } finally {
      setSavingAds(false);
    }
  }

  function handlePlanFieldChange(index: number, field: keyof PlanItem, value: any) {
    setPlans((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function handleAddPlan() {
    const newPlan: PlanItem = {
      id: `plan_${Date.now()}`,
      name: 'Novo Plano VIP',
      badge: 'OFERTA ESPECIAL',
      price: 'R$ 97,90',
      period: '/trimestre',
      checkoutUrl: plans[0]?.checkoutUrl || 'https://pay.cakto.com.br/seu-link',
      benefits: [
        'Conversas ilimitadas com a Lilith',
        'Análise de conversas e detecção de red flags',
        'Módulo de Reconquista e reversão de crise',
        'Acesso a todas as ferramentas e trilhas',
      ],
      buttonText: 'Desbloquear Acesso Premium Ilimitado',
    };
    setPlans((prev) => [...prev, newPlan]);
  }

  function handleRemovePlan(index: number) {
    if (plans.length <= 1) {
      alert('Você precisa manter pelo menos 1 plano ativo.');
      return;
    }
    setPlans((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSavePlans() {
    setSavingPlans(true);
    setPlansSavedMsg('');
    try {
      if (await saveGlobalConfig({ plans })) {
        setPlansSavedMsg('✅ Planos e links da Cakto salvos no site!');
        setTimeout(() => setPlansSavedMsg(''), 4000);
      } else {
        setPlansSavedMsg('❌ Erro ao salvar alterações.');
      }
    } finally {
      setSavingPlans(false);
    }
  }

  async function handleSaveVideos() {
    setSavingVideos(true);
    setVideosSavedMsg('');
    try {
      if (await saveGlobalConfig({ lessonVideos })) {
        setVideosSavedMsg('✅ Links de vídeo das aulas atualizados com sucesso!');
        setTimeout(() => setVideosSavedMsg(''), 4000);
      } else {
        setVideosSavedMsg('❌ Erro ao salvar vídeos.');
      }
    } finally {
      setSavingVideos(false);
    }
  }

  async function handleAction(aff: Affiliate, action: 'approve_pending' | 'reject_pending' | 'toggle_active') {
    if (!aff?.id) return;
    setUpdatingId(aff.id);
    try {
      const payload =
        action === 'toggle_active'
          ? { rowId: aff.id, is_active: !aff.is_active }
          : { rowId: aff.id, action, rawLink: aff.cakto_affiliate_link };

      const res = await fetch('/api/admin/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setAffiliates((prev) =>
          prev.map((a) =>
            a.id === aff.id
              ? {
                  ...a,
                  is_active: typeof data.is_active === 'boolean' ? data.is_active : a.is_active,
                  cakto_affiliate_link:
                    typeof data.cakto_affiliate_link === 'string'
                      ? data.cakto_affiliate_link
                      : a.cakto_affiliate_link,
                }
              : a
          )
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
      <p className="text-stone-500 dark:text-stone-300 mb-6">
        Controle geral da plataforma: anúncios, módulos visíveis, vídeos das aulas, planos da Cakto e afiliados.
      </p>

      {/* CENTRAL DE 4 ALAVANCAS GLOBAIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Alavanca 1: Anúncios & Bônus Free */}
        <div className="bg-white dark:bg-white/[0.05] rounded-2xl shadow-sm border border-stone-200 dark:border-white/10 p-5 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${adsEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
              <h2 className="font-bold text-stone-800 dark:text-stone-100 text-sm">
                Anúncios Free: {adsEnabled ? 'ATIVO' : 'DESATIVADO'}
              </h2>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Liga/desliga banners nas páginas e o botão de ver anúncio (10s) para liberar +3 mensagens nos chats.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleToggleSwitch('ads')}
            disabled={togglingKey === 'ads'}
            className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              adsEnabled ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-stone-700 hover:bg-stone-600 text-white'
            }`}
          >
            {togglingKey === 'ads' ? 'Salvando...' : adsEnabled ? '🟢 Desativar Anúncios' : '⚪ Ativar Anúncios'}
          </button>
        </div>

        {/* Alavanca 2: Afiliados */}
        <div className="bg-white dark:bg-white/[0.05] rounded-2xl shadow-sm border border-stone-200 dark:border-white/10 p-5 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${programOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <h2 className="font-bold text-stone-800 dark:text-stone-100 text-sm">
                Vagas Afiliados: {programOpen ? 'ABERTO' : 'FECHADO'}
              </h2>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Exibe ou oculta o menu &ldquo;Afiliados&rdquo; e controla a entrada de novos parceiros.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleToggleSwitch('affiliates')}
            disabled={togglingKey === 'affiliates'}
            className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              programOpen ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-stone-800 dark:bg-rose-700 text-white'
            }`}
          >
            {togglingKey === 'affiliates' ? 'Salvando...' : programOpen ? '🟢 Fechar Vagas' : '🔴 Reabrir Vagas'}
          </button>
        </div>

        {/* Alavanca 3: Comunidade Anônima */}
        <div className="bg-white dark:bg-white/[0.05] rounded-2xl shadow-sm border border-stone-200 dark:border-white/10 p-5 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${communityOpen ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
              <h2 className="font-bold text-stone-800 dark:text-stone-100 text-sm">
                Comunidade: {communityOpen ? 'ATIVO' : 'OCULTO'}
              </h2>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Ative quando tiver volume de usuários para liberar a aba &ldquo;Comunidade&rdquo; no topo do site.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleToggleSwitch('community')}
            disabled={togglingKey === 'community'}
            className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              communityOpen ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-stone-700 hover:bg-stone-600 text-white'
            }`}
          >
            {togglingKey === 'community' ? 'Salvando...' : communityOpen ? '🟢 Ocultar Comunidade' : '⚪ Ativar Comunidade'}
          </button>
        </div>

        {/* Alavanca 4: Pop-up de Notificações de Compra */}
        <div className="bg-white dark:bg-white/[0.05] rounded-2xl shadow-sm border border-stone-200 dark:border-white/10 p-5 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${salesPopupOpen ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
              <h2 className="font-bold text-stone-800 dark:text-stone-100 text-sm">
                Pop-up Compras: {salesPopupOpen ? 'ATIVO' : 'OCULTO'}
              </h2>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Dica: Desative temporariamente durante a revisão inicial do AdSense e reative logo após aprovar!
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleToggleSwitch('salesPopup')}
            disabled={togglingKey === 'salesPopup'}
            className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              salesPopupOpen ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-stone-700 hover:bg-stone-600 text-white'
            }`}
          >
            {togglingKey === 'salesPopup' ? 'Salvando...' : salesPopupOpen ? '🟢 Ocultar Pop-ups' : '⚪ Ativar Pop-ups'}
          </button>
        </div>
      </div>

      {/* CENTRAL DE MONETIZAÇÃO & ANÚNCIOS (ADSENSE / MONETAG / ADSTERRA) */}
      <div className="bg-white dark:bg-white/[0.05] rounded-2xl shadow-md border border-stone-200 dark:border-white/10 p-6 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-stone-100 dark:border-white/10">
          <div>
            <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
              <span>📢</span> Central de Monetização & Códigos de Anúncios (Modo Free)
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Escolha entre <strong>Google AdSense</strong> ou <strong>Monetag / Adsterra / HTML Customizado</strong>. Assinantes VIP nunca veem anúncios, e os chats estão protegidos contra Auto Ads invasivos.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setAdsProvider('adsense')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                adsProvider === 'adsense'
                  ? 'bg-rose-700 text-white shadow'
                  : 'bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-300'
              }`}
            >
              Google AdSense
            </button>
            <button
              type="button"
              onClick={() => setAdsProvider('custom')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                adsProvider === 'custom'
                  ? 'bg-rose-700 text-white shadow'
                  : 'bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-300'
              }`}
            >
              Monetag / Adsterra / HTML
            </button>
          </div>
        </div>

        {adsProvider === 'adsense' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                ID do Cliente AdSense (ca-pub-...)
              </label>
              <input
                type="text"
                placeholder="ca-pub-1234567890123456"
                value={adsenseClientId}
                onChange={(e) => setAdsenseClientId(e.target.value)}
                className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-[#140a0f] border border-stone-200 dark:border-white/15 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                ID do Bloco (Slot) — Banner Horizontal
              </label>
              <input
                type="text"
                placeholder="Ex: 1122334455"
                value={adsenseBannerSlot}
                onChange={(e) => setAdsenseBannerSlot(e.target.value)}
                className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-[#140a0f] border border-stone-200 dark:border-white/15 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                ID do Bloco (Slot) — Modal 10s (+3 Msgs)
              </label>
              <input
                type="text"
                placeholder="Ex: 9988776655"
                value={adsenseModalSlot}
                onChange={(e) => setAdsenseModalSlot(e.target.value)}
                className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-[#140a0f] border border-stone-200 dark:border-white/15 font-mono text-xs"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Código HTML / Script — Banner Horizontal (Home & Trilhas)
              </label>
              <textarea
                rows={4}
                placeholder="Cole aqui o código <script> ou <iframe> do banner da Monetag / Adsterra..."
                value={customBannerHtml}
                onChange={(e) => setCustomBannerHtml(e.target.value)}
                className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-[#140a0f] border border-stone-200 dark:border-white/15 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Código HTML / Script — Modal 10 Segundos (+3 Mensagens no Chat)
              </label>
              <textarea
                rows={4}
                placeholder="Cole aqui o código <script>, <iframe> ou banner 300x250 que aparece durante os 10s no chat..."
                value={customModalHtml}
                onChange={(e) => setCustomModalHtml(e.target.value)}
                className="w-full rounded-xl px-3.5 py-2.5 bg-stone-50 dark:bg-[#140a0f] border border-stone-200 dark:border-white/15 font-mono text-xs"
              />
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSaveAdsConfig}
            disabled={savingAds}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-rose-700 dark:hover:bg-rose-600 text-white font-bold text-xs sm:text-sm shadow transition-all disabled:opacity-50"
          >
            {savingAds ? 'Salvando...' : '💾 Salvar Configuração de Anúncios'}
          </button>
          {adsSavedMsg && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {adsSavedMsg}
            </span>
          )}
        </div>
      </div>

      {/* GERENCIADOR DE VÍDEOS DAS AULAS (/TRILHAS) */}
      <div className="bg-white dark:bg-white/[0.05] rounded-2xl shadow-md border border-stone-200 dark:border-white/10 p-6 mb-10">
        <div className="pb-4 mb-5 border-b border-stone-100 dark:border-white/10">
          <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
            <span>🎬</span> Vídeos das Aulas (Academia & Trilhas)
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Cole o link direto <code className="font-mono">.mp4</code> ou embed do Vimeo. Se deixar em branco, a aula exibe o banner elegante + E-book interativo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ADMIN_LESSONS_LIST.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/80 dark:border-white/10"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                {item.track}
              </span>
              <label className="block text-xs font-semibold text-stone-800 dark:text-stone-100 mb-2">
                {item.title}
              </label>
              <input
                type="url"
                placeholder="https://.../aula01.mp4 ou https://player.vimeo.com/video/..."
                value={lessonVideos[item.id] || ''}
                onChange={(e) =>
                  setLessonVideos((prev) => ({ ...prev, [item.id]: e.target.value }))
                }
                className="w-full rounded-lg px-3 py-2 bg-white dark:bg-[#140a0f] border border-stone-200 dark:border-white/15 text-xs font-mono text-stone-800 dark:text-stone-100"
              />
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSaveVideos}
            disabled={savingVideos}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-rose-700 dark:hover:bg-rose-600 text-white font-bold text-xs sm:text-sm shadow transition-all disabled:opacity-50"
          >
            {savingVideos ? 'Salvando...' : '💾 Salvar Links dos Vídeos'}
          </button>
          {videosSavedMsg && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {videosSavedMsg}
            </span>
          )}
        </div>
      </div>

      {/* GERENCIADOR DE PLANOS, PREÇOS E LINK OFICIAL DA CAKTO */}
      <div className="bg-white dark:bg-white/[0.05] rounded-2xl shadow-md border border-stone-200 dark:border-white/10 p-6 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-stone-100 dark:border-white/10">
          <div>
            <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
              <span>💳</span> Planos, Preços e Seu Link Oficial da Cakto (Vendas Diretas)
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Configure o link da Cakto para clientes sem indicação, edite o valor, benefícios ou adicione novos planos.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddPlan}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/20 text-stone-800 dark:text-stone-100 text-xs font-bold shrink-0 transition-colors"
          >
            + Adicionar Novo Plano
          </button>
        </div>

        <div className="space-y-6">
          {plans.map((plan, idx) => (
            <div
              key={plan.id || idx}
              className="p-5 rounded-2xl bg-stone-50/80 dark:bg-[#140a0f]/60 border border-stone-200 dark:border-rose-400/20 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
                  Plano #{idx + 1} — {plan.name}
                </span>
                {plans.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePlan(idx)}
                    className="text-xs font-semibold text-red-500 hover:underline"
                  >
                    🗑️ Remover Plano
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Nome do Plano
                  </label>
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => handlePlanFieldChange(idx, 'name', e.target.value)}
                    className="w-full rounded-xl px-3 py-2 bg-white dark:bg-white/5 border border-stone-200 dark:border-white/15 text-stone-800 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Selo de Destaque
                  </label>
                  <input
                    type="text"
                    value={plan.badge}
                    onChange={(e) => handlePlanFieldChange(idx, 'badge', e.target.value)}
                    className="w-full rounded-xl px-3 py-2 bg-white dark:bg-white/5 border border-stone-200 dark:border-white/15 text-stone-800 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Valor Exibido
                  </label>
                  <input
                    type="text"
                    value={plan.price}
                    onChange={(e) => handlePlanFieldChange(idx, 'price', e.target.value)}
                    className="w-full rounded-xl px-3 py-2 bg-white dark:bg-white/5 border border-stone-200 dark:border-white/15 text-stone-800 dark:text-stone-100 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Período
                  </label>
                  <input
                    type="text"
                    value={plan.period}
                    onChange={(e) => handlePlanFieldChange(idx, 'period', e.target.value)}
                    className="w-full rounded-xl px-3 py-2 bg-white dark:bg-white/5 border border-stone-200 dark:border-white/15 text-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    🔗 Seu Link Oficial da Cakto (Para clientes sem indicação)
                  </label>
                  <input
                    type="url"
                    value={plan.checkoutUrl}
                    onChange={(e) => handlePlanFieldChange(idx, 'checkoutUrl', e.target.value)}
                    className="w-full rounded-xl px-3 py-2 bg-white dark:bg-white/5 border border-stone-200 dark:border-white/15 text-stone-800 dark:text-stone-100 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Texto do Botão de Compra
                  </label>
                  <input
                    type="text"
                    value={plan.buttonText}
                    onChange={(e) => handlePlanFieldChange(idx, 'buttonText', e.target.value)}
                    className="w-full rounded-xl px-3 py-2 bg-white dark:bg-white/5 border border-stone-200 dark:border-white/15 text-stone-800 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="text-xs sm:text-sm">
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Lista de Benefícios (1 por linha)
                </label>
                <textarea
                  rows={5}
                  value={(plan.benefits || []).join('\n')}
                  onChange={(e) =>
                    handlePlanFieldChange(
                      idx,
                      'benefits',
                      e.target.value.split('\n').filter((line) => line.trim() !== '')
                    )
                  }
                  className="w-full rounded-xl px-3.5 py-2.5 bg-white dark:bg-white/5 border border-stone-200 dark:border-white/15 text-stone-800 dark:text-stone-100 leading-relaxed"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSavePlans}
            disabled={savingPlans}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {savingPlans ? <Spinner className="w-4 h-4" /> : <span>💾</span>}
            <span>Salvar Planos e Link Oficial da Cakto</span>
          </button>

          {plansSavedMsg && (
            <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {plansSavedMsg}
            </span>
          )}
        </div>
      </div>

      {/* Estatísticas gerais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Assinantes Premium" value={stats?.totalPremium ?? 0} tint="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" />
        <StatCard label="Afiliados ativos" value={affiliates.filter((a) => a.is_active).length} tint="bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" />
        <StatCard label="Total de afiliados" value={affiliates.length} tint="bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" />
        <StatCard label="Indicações somadas" value={stats?.totalReferrals ?? 0} tint="bg-stone-100 text-stone-700 dark:bg-white/10 dark:text-stone-200" />
      </div>

      {/* Lista de afiliados */}
      <div className="bg-white dark:bg-white/[0.05] rounded-2xl shadow-md dark:border dark:border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 dark:border-white/10">
          <h2 className="font-semibold text-stone-700 dark:text-stone-100">
            Afiliados cadastrados ({affiliates.length})
          </h2>
          <p className="text-xs text-stone-400 dark:text-stone-400 mt-1">
            Links enviados ficam em análise até você aprovar. Se um afiliado trocar o link, o antigo continua ativo até você aprovar o novo.
          </p>
        </div>

        {affiliates.length === 0 ? (
          <div className="px-6 py-12 text-center text-stone-400 dark:text-stone-400">
            Nenhum afiliado cadastrado ainda.
          </div>
        ) : (
          <ul className="divide-y divide-stone-100 dark:divide-white/10">
            {affiliates.map((aff) => {
              const { approved, pending } = parseAffiliateLinks(aff.cakto_affiliate_link);
              return (
                <li key={aff.id ?? aff.clerk_user_id} className="px-6 py-5 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-stone-800 dark:text-stone-100 truncate">
                          {aff.email || '(sem e-mail)'}
                        </p>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            pending
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                              : aff.is_active && approved
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-stone-100 text-stone-500 dark:bg-white/10 dark:text-stone-400'
                          }`}
                        >
                          {pending ? '⏳ Aguardando Aprovação' : aff.is_active && approved ? 'Ativo' : 'Pausado'}
                        </span>
                      </div>

                      {approved ? (
                        <div className="text-xs mt-1">
                          <span className="text-stone-400 dark:text-stone-400 mr-1.5">Link Ativo no Ar:</span>
                          <a
                            href={approved}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 dark:text-emerald-400 hover:underline break-all font-mono font-medium"
                          >
                            {approved}
                          </a>
                        </div>
                      ) : (
                        !pending && <p className="text-xs text-stone-400 font-mono">(sem link aprovado)</p>
                      )}

                      <p className="text-xs text-stone-400 dark:text-stone-400 mt-1">
                        {aff.total_referrals ?? 0} indicações registradas
                      </p>
                    </div>

                    {approved && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleAction(aff, 'toggle_active')}
                          disabled={updatingId === aff.id}
                          className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                            aff.is_active
                              ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-stone-100'
                              : 'bg-rose-600 hover:bg-rose-700 text-white'
                          }`}
                        >
                          {updatingId === aff.id ? <Spinner className="w-4 h-4" /> : aff.is_active ? 'Pausar Link Atual' : 'Reativar Link'}
                        </button>
                      </div>
                    )}
                  </div>

                  {pending && (
                    <div className="mt-1 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-0.5">
                          {approved
                            ? '⚠️ Solicitação de Troca de Link (O link antigo acima segue valendo até você aprovar este):'
                            : '🆕 Novo Link Enviado para Aprovação:'}
                        </p>
                        <a
                          href={pending}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-amber-800 dark:text-amber-200 underline break-all"
                        >
                          {pending}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAction(aff, 'approve_pending')}
                          disabled={updatingId === aff.id}
                          className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                        >
                          ✓ Aprovar Link
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(aff, 'reject_pending')}
                          disabled={updatingId === aff.id}
                          className="px-3 py-2 rounded-lg bg-stone-200 hover:bg-stone-300 dark:bg-white/10 dark:hover:bg-white/20 text-stone-700 dark:text-stone-200 text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          ✕ Recusar
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}