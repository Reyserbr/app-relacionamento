import { NextRequest, NextResponse } from 'next/server';
import { findAffiliateByClerkId, createAffiliate, setAffiliateActive } from '@/lib/baserow';
import { isCurrentUserAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

const CONFIG_KEY = '__SYSTEM_CONFIG__';

// Consulta pública para saber se o programa de afiliados está aberto ou fechado
export async function GET() {
  try {
    const configRow = await findAffiliateByClerkId(CONFIG_KEY);
    // Se ainda não foi configurado, por padrão começa aberto (true)
    const isOpen = configRow ? Boolean(configRow.is_active) : true;
    return NextResponse.json({ isOpen });
  } catch (e) {
    return NextResponse.json({ isOpen: true });
  }
}

// Alavanca exclusiva do Admin para Abrir ou Fechar o programa de afiliados
export async function POST(req: NextRequest) {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { isOpen } = await req.json();
    const existing = await findAffiliateByClerkId(CONFIG_KEY);

    if (existing?.id) {
      await setAffiliateActive(existing.id, Boolean(isOpen));
    } else {
      await createAffiliate({
        clerk_user_id: CONFIG_KEY,
        email: 'config@sistema.interno',
        cakto_affiliate_link: 'SYSTEM_CONFIG',
        is_active: Boolean(isOpen),
        total_referrals: 0,
      });
    }

    return NextResponse.json({ ok: true, isOpen: Boolean(isOpen) });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro ao salvar configuração' }, { status: 500 });
  }
}