export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import {
  findAffiliateByClerkId,
  createAffiliate,
  updateAffiliate,
  findUserByClerkId,
} from '@/lib/baserow';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const newLink = String(body?.cakto_affiliate_link ?? '').trim();

    if (!newLink || !newLink.startsWith('http')) {
      return NextResponse.json(
        { error: 'Insira um link válido começando com https://' },
        { status: 400 }
      );
    }

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? '';

    // Verifica se é assinante premium (por ID ou Email)
    let userPremium = await findUserByClerkId(userId);
    if (!userPremium && email) {
      userPremium = await findUserByClerkId(email);
    }

    if (!userPremium?.is_premium) {
      return NextResponse.json(
        { error: 'Apenas assinantes Premium podem cadastrar link de afiliado.' },
        { status: 403 }
      );
    }

    const existing = await findAffiliateByClerkId(userId);

    if (existing?.id) {
      const rawCurrent = String(existing.cakto_affiliate_link ?? '').trim();
      let currentApproved = '';

      if (rawCurrent.includes('||PENDING::')) {
        currentApproved = rawCurrent.split('||PENDING::')[0].trim();
      } else if (!rawCurrent.startsWith('PENDING::') && rawCurrent.startsWith('http')) {
        currentApproved = rawCurrent;
      }

      // Se ele já tinha um link aprovado ativo, mantém o antigo valendo e coloca o novo como pendente!
      if (currentApproved && existing.is_active) {
        if (currentApproved === newLink) {
          return NextResponse.json({
            ok: true,
            status: 'approved',
            message: 'Este link já é o seu link aprovado e ativo!',
          });
        }
        await updateAffiliate(existing.id, {
          cakto_affiliate_link: `${currentApproved}||PENDING::${newLink}`,
          email: email || existing.email,
        });
        return NextResponse.json({
          ok: true,
          status: 'pending_replacement',
          message:
            'Novo link enviado para análise! Seu link antigo aprovado continuará funcionando normalmente até que o administrador aprove a substituição.',
        });
      } else {
        // Primeiro envio ou estava desativado: fica aguardando aprovação
        await updateAffiliate(existing.id, {
          cakto_affiliate_link: `PENDING::${newLink}`,
          is_active: false,
          email: email || existing.email,
        });
        return NextResponse.json({
          ok: true,
          status: 'pending_first',
          message: 'Link enviado para análise! Assim que o administrador verificar e aprovar, seu status mudará para Ativo.',
        });
      }
    } else {
      await createAffiliate({
        clerk_user_id: userId,
        email,
        cakto_affiliate_link: `PENDING::${newLink}`,
        is_active: false,
        total_referrals: 0,
      });
      return NextResponse.json({
        ok: true,
        status: 'pending_first',
        message: 'Link enviado para análise! Assim que o administrador verificar e aprovar, seu status mudará para Ativo.',
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? 'Erro ao salvar link de afiliado' },
      { status: 500 }
    );
  }
}