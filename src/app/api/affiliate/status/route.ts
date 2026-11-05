export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { findUserByClerkId, findAffiliateByClerkId } from '@/lib/baserow';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? '';

    let user = await findUserByClerkId(userId);
    if (!user && email) {
      user = await findUserByClerkId(email);
    }

    const affiliate = await findAffiliateByClerkId(userId);
    const rawLink = String(affiliate?.cakto_affiliate_link ?? '').trim();

    let approvedLink: string | null = null;
    let pendingLink: string | null = null;

    if (rawLink.includes('||PENDING::')) {
      const parts = rawLink.split('||PENDING::');
      approvedLink = parts[0] || null;
      pendingLink = parts[1] || null;
    } else if (rawLink.startsWith('PENDING::')) {
      pendingLink = rawLink.replace('PENDING::', '');
    } else if (rawLink.startsWith('http')) {
      approvedLink = rawLink;
    }

    const origin = request.nextUrl.origin;
    const referralLink = `${origin}/?ref=${userId}`;

    return NextResponse.json({
      clerk_user_id: userId,
      is_premium: Boolean(user?.is_premium),
      premium_since: user?.premium_since ?? null,
      is_affiliate: Boolean(affiliate?.is_active && approvedLink),
      cakto_affiliate_link: approvedLink,
      pending_link: pendingLink,
      total_referrals: affiliate?.total_referrals ?? 0,
      referral_link: referralLink,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? 'Erro ao buscar status' },
      { status: 500 }
    );
  }
}