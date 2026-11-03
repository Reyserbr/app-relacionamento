/**
 * Rotas administrativas para gerenciar afiliados.
 * Apenas administradores (ver src/lib/admin.ts) podem acessar.
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isCurrentUserAdmin } from '@/lib/admin';
import {
  listAllAffiliates,
  listAllUsers,
  setAffiliateActive,
} from '@/lib/baserow';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    if (!(await isCurrentUserAdmin())) {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
    }

    const affiliates = await listAllAffiliates();
    const users = await listAllUsers();
    const totalPremium = users.filter((u) => u?.is_premium).length;
    const activeAffiliates = affiliates.filter((a) => a?.is_active).length;
    const totalReferrals = affiliates.reduce((sum, a) => sum + (a?.total_referrals ?? 0), 0);

    return NextResponse.json({
      affiliates,
      stats: {
        totalAffiliates: affiliates.length,
        activeAffiliates,
        totalPremium,
        totalUsers: users.length,
        totalReferrals,
      },
    });
  } catch (error: any) {
    console.error('Erro no admin/affiliates GET:', error);
    return NextResponse.json({ error: 'Erro ao carregar dados' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    if (!(await isCurrentUserAdmin())) {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
    }

    const body = await request.json();
    const rowId = Number(body?.rowId);
    const isActive = Boolean(body?.is_active);

    if (!rowId) {
      return NextResponse.json({ error: 'rowId é obrigatório' }, { status: 400 });
    }

    await setAffiliateActive(rowId, isActive);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro no admin/affiliates POST:', error);
    return NextResponse.json({ error: 'Erro ao atualizar afiliado' }, { status: 500 });
  }
}
