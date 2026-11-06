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
    communityOpen: false, // Começa desativado até você ligar no Admin
    salesPopupOpen: true, // Notificações de vendas ativas para Free
    lessonVideos: {},
  };

  if (!rawLink || rawLink === 'SYSTEM_CONFIG') return defaults;

  try {
    const parsed = JSON.parse(rawLink);
    // Compatibilidade caso antes estivesse salvo apenas o array de planos
    if (Array.isArray(parsed)) {
      return { ...defaults, plans: parsed.length > 0 ? parsed : DEFAULT_PLANS };
    }
    if (parsed && typeof parsed === 'object') {
      return {
        plans: Array.isArray(parsed.plans) && parsed.plans.length > 0 ? parsed.plans : DEFAULT_PLANS,
        communityOpen: typeof parsed.communityOpen === 'boolean' ? parsed.communityOpen : false,
        salesPopupOpen: typeof parsed.salesPopupOpen === 'boolean' ? parsed.salesPopupOpen : true,
        lessonVideos: parsed.lessonVideos && typeof parsed.lessonVideos === 'object' ? parsed.lessonVideos : {},
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
      plans: settings.plans,
      communityOpen: settings.communityOpen,
      salesPopupOpen: settings.salesPopupOpen,
      lessonVideos: settings.lessonVideos,
    });
  } catch (e) {
    return NextResponse.json({
      isOpen: true,
      plans: DEFAULT_PLANS,
      communityOpen: false,
      salesPopupOpen: true,
      lessonVideos: {},
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