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

function parsePlansFromRow(rawLink?: string | null): PlanItem[] {
  if (!rawLink || rawLink === 'SYSTEM_CONFIG') return DEFAULT_PLANS;
  try {
    const parsed = JSON.parse(rawLink);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (_) {}
  return DEFAULT_PLANS;
}

export async function GET() {
  try {
    const configRow = await findAffiliateByClerkId(CONFIG_KEY);
    const isOpen = configRow ? Boolean(configRow.is_active) : true;
    const plans = parsePlansFromRow(configRow?.cakto_affiliate_link);

    return NextResponse.json({ isOpen, plans });
  } catch (e) {
    return NextResponse.json({ isOpen: true, plans: DEFAULT_PLANS });
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

    const nextIsOpen =
      typeof body.isOpen === 'boolean'
        ? body.isOpen
        : existing
        ? Boolean(existing.is_active)
        : true;

    const currentPlans = parsePlansFromRow(existing?.cakto_affiliate_link);
    const nextPlans: PlanItem[] = Array.isArray(body.plans) ? body.plans : currentPlans;
    const serializedPlans = JSON.stringify(nextPlans);

    if (existing?.id) {
      await updateAffiliate(existing.id, {
        is_active: nextIsOpen,
        cakto_affiliate_link: serializedPlans,
      });
    } else {
      await createAffiliate({
        clerk_user_id: CONFIG_KEY,
        email: 'config@sistema.interno',
        cakto_affiliate_link: serializedPlans,
        is_active: nextIsOpen,
        total_referrals: 0,
      });
    }

    return NextResponse.json({ ok: true, isOpen: nextIsOpen, plans: nextPlans });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Erro ao salvar configuração' },
      { status: 500 }
    );
  }
}