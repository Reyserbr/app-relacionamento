export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { isCurrentUserAdmin } from '@/lib/admin';
import {
  listAllAffiliates,
  listAllUsers,
  updateAffiliate,
  setAffiliateActive,
} from '@/lib/baserow';

export async function GET() {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const [allAffiliates, allUsers] = await Promise.all([
      listAllAffiliates(),
      listAllUsers(),
    ]);

    const affiliates = allAffiliates.filter(
      (a) => a.clerk_user_id !== '__SYSTEM_CONFIG__'
    );

    const totalPremium = allUsers.filter((u) => u.is_premium).length;
    const activeAffiliates = affiliates.filter((a) => a.is_active).length;
    const totalReferrals = affiliates.reduce(
      (acc, a) => acc + (Number(a.total_referrals) || 0),
      0
    );

    return NextResponse.json({
      affiliates,
      stats: {
        totalAffiliates: affiliates.length,
        activeAffiliates,
        totalPremium,
        totalUsers: allUsers.length,
        totalReferrals,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? 'Erro ao listar afiliados' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { rowId, action, rawLink, is_active } = body;

    if (!rowId) {
      return NextResponse.json({ error: 'rowId obrigatório' }, { status: 400 });
    }

    const currentRaw = String(rawLink ?? '').trim();

    // Aprovar um link que estava pendente (seja o 1º link ou uma substituição)
    if (action === 'approve_pending') {
      let newApproved = currentRaw;
      if (currentRaw.includes('||PENDING::')) {
        newApproved = currentRaw.split('||PENDING::')[1].trim();
      } else if (currentRaw.startsWith('PENDING::')) {
        newApproved = currentRaw.replace('PENDING::', '').trim();
      }
      await updateAffiliate(Number(rowId), {
        cakto_affiliate_link: newApproved,
        is_active: true,
      });
      return NextResponse.json({ ok: true, cakto_affiliate_link: newApproved, is_active: true });
    }

    // Recusar o novo link pendente (mantém o link antigo aprovado valendo!)
    if (action === 'reject_pending') {
      if (currentRaw.includes('||PENDING::')) {
        const oldApproved = currentRaw.split('||PENDING::')[0].trim();
        await updateAffiliate(Number(rowId), {
          cakto_affiliate_link: oldApproved,
          is_active: true,
        });
        return NextResponse.json({ ok: true, cakto_affiliate_link: oldApproved, is_active: true });
      } else {
        await updateAffiliate(Number(rowId), {
          cakto_affiliate_link: '',
          is_active: false,
        });
        return NextResponse.json({ ok: true, cakto_affiliate_link: '', is_active: false });
      }
    }

    // Pausar ou Ativar comum
    await setAffiliateActive(Number(rowId), Boolean(is_active));
    return NextResponse.json({ ok: true, is_active: Boolean(is_active) });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? 'Erro ao atualizar afiliado' },
      { status: 500 }
    );
  }
}