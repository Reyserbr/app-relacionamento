import { NextRequest, NextResponse } from 'next/server';
import {
  findAffiliateByClerkId,
  createAffiliate,
  updateAffiliate,
} from '@/lib/baserow';
import { isCurrentUserAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

const CONFIG_KEY = '__SYSTEM_CONFIG__';

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

interface SystemSettings {
  plans: PlanItem[];
  communityOpen: boolean;
  salesPopupOpen: boolean;
  lessonVideos: Record<string, string>;
  // Novas configurações de Monetização / Anúncios controladas pelo Admin
  adsEnabled: boolean;
  adsProvider: 'adsense' | 'custom';
  adsenseClientId: string;
  adsenseBannerSlot: string;
  adsenseModalSlot: string;
  customBannerHtml: string;
  customModalHtml: string;
}

const DEFAULT_PLANS: PlanItem[] = [
  {
    id: 'default',
    name: 'Premium',
    badge: 'MAIS POPULAR',
    price: 'R$ 69,90',
    period: '/mês',
    checkoutUrl: process.env.CAKTO_CHECKOUT_URL ?? 'https://pay.cakto.com.br/6nbag79',
    benefits: [
      'Conversas ilimitadas com a Lilith',
      'Análise de conversas e detecção de red flags',
      'Módulo de Reconquista e reversão de crise',
      'Estratégias guiadas por IA, passo a passo',
      'Acesso a todas as ferramentas e trilhas',
      'Suporte prioritário',
    ],
    buttonText: 'Desbloquear Acesso Premium Ilimitado',
  },
];

function parseConfigFromRow(rawLink?: string | null): SystemSettings {
  const defaults: SystemSettings = {
    plans: DEFAULT_PLANS,
    communityOpen: false,
    salesPopupOpen: true,
    lessonVideos: {},
    adsEnabled: true,
    adsProvider: 'adsense',
    adsenseClientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? '',
    adsenseBannerSlot: '',
    adsenseModalSlot: '',
    customBannerHtml: '',
    customModalHtml: '',
  };

  if (!rawLink || rawLink === 'SYSTEM_CONFIG') return defaults;

  try {
    const parsed = JSON.parse(rawLink);
    if (Array.isArray(parsed)) {
      return { ...defaults, plans: parsed.length > 0 ? parsed : DEFAULT_PLANS };
    }
    if (parsed && typeof parsed === 'object') {
      return {
        plans: Array.isArray(parsed.plans) && parsed.plans.length > 0 ? parsed.plans : DEFAULT_PLANS,
        communityOpen: typeof parsed.communityOpen === 'boolean' ? parsed.communityOpen : false,
        salesPopupOpen: typeof parsed.salesPopupOpen === 'boolean' ? parsed.salesPopupOpen : true,
        lessonVideos: parsed.lessonVideos && typeof parsed.lessonVideos === 'object' ? parsed.lessonVideos : {},
        adsEnabled: typeof parsed.adsEnabled === 'boolean' ? parsed.adsEnabled : true,
        adsProvider: parsed.adsProvider === 'custom' ? 'custom' : 'adsense',
        adsenseClientId: typeof parsed.adsenseClientId === 'string' ? parsed.adsenseClientId : defaults.adsenseClientId,
        adsenseBannerSlot: typeof parsed.adsenseBannerSlot === 'string' ? parsed.adsenseBannerSlot : '',
        adsenseModalSlot: typeof parsed.adsenseModalSlot === 'string' ? parsed.adsenseModalSlot : '',
        customBannerHtml: typeof parsed.customBannerHtml === 'string' ? parsed.customBannerHtml : '',
        customModalHtml: typeof parsed.customModalHtml === 'string' ? parsed.customModalHtml : '',
      };
    }
  } catch (_) {}

  return defaults;
}

export async function GET() {
  try {
    const configRow = await findAffiliateByClerkId(CONFIG_KEY);
    const isOpen = configRow ? Boolean(configRow.is_active) : true;
    const settings = parseConfigFromRow(configRow?.cakto_affiliate_link);

    return NextResponse.json({
      isOpen,
      ...settings,
    });
  } catch (e) {
    return NextResponse.json({
      isOpen: true,
      ...parseConfigFromRow(null),
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const existing = await findAffiliateByClerkId(CONFIG_KEY);
    const currentSettings = parseConfigFromRow(existing?.cakto_affiliate_link);

    const nextIsOpen =
      typeof body.isOpen === 'boolean'
        ? body.isOpen
        : existing
        ? Boolean(existing.is_active)
        : true;

    const nextSettings: SystemSettings = {
      plans: Array.isArray(body.plans) && body.plans.length > 0 ? body.plans : currentSettings.plans,
      communityOpen:
        typeof body.communityOpen === 'boolean' ? body.communityOpen : currentSettings.communityOpen,
      salesPopupOpen:
        typeof body.salesPopupOpen === 'boolean' ? body.salesPopupOpen : currentSettings.salesPopupOpen,
      lessonVideos:
        body.lessonVideos && typeof body.lessonVideos === 'object'
          ? body.lessonVideos
          : currentSettings.lessonVideos,
      adsEnabled: typeof body.adsEnabled === 'boolean' ? body.adsEnabled : currentSettings.adsEnabled,
      adsProvider: body.adsProvider === 'custom' || body.adsProvider === 'adsense' ? body.adsProvider : currentSettings.adsProvider,
      adsenseClientId: typeof body.adsenseClientId === 'string' ? body.adsenseClientId.trim() : currentSettings.adsenseClientId,
      adsenseBannerSlot: typeof body.adsenseBannerSlot === 'string' ? body.adsenseBannerSlot.trim() : currentSettings.adsenseBannerSlot,
      adsenseModalSlot: typeof body.adsenseModalSlot === 'string' ? body.adsenseModalSlot.trim() : currentSettings.adsenseModalSlot,
      customBannerHtml: typeof body.customBannerHtml === 'string' ? body.customBannerHtml : currentSettings.customBannerHtml,
      customModalHtml: typeof body.customModalHtml === 'string' ? body.customModalHtml : currentSettings.customModalHtml,
    };

    const serialized = JSON.stringify(nextSettings);

    if (existing?.id) {
      await updateAffiliate(existing.id, {
        is_active: nextIsOpen,
        cakto_affiliate_link: serialized,
      });
    } else {
      await createAffiliate({
        clerk_user_id: CONFIG_KEY,
        email: 'config@sistema.interno',
        cakto_affiliate_link: serialized,
        is_active: nextIsOpen,
        total_referrals: 0,
      });
    }

    return NextResponse.json({
      ok: true,
      isOpen: nextIsOpen,
      ...nextSettings,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Erro ao salvar configuração' },
      { status: 500 }
    );
  }
}