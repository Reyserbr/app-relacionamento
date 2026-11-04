export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { findUserByClerkId, markUserPremium, createUser } from '@/lib/baserow';

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.CAKTO_WEBHOOK_SECRET;
    const receivedSecret =
      request.headers.get('x-webhook-secret') ??
      request.nextUrl.searchParams.get('secret');

    if (webhookSecret && receivedSecret !== webhookSecret) {
      return NextResponse.json({ error: 'Secret inválido' }, { status: 403 });
    }

    const body = await request.json();
    const payload = body?.data ?? body;

    const email =
      payload?.customer?.email ??
      payload?.buyer?.email ??
      payload?.email ??
      body?.customer?.email ??
      '';

    const status = String(
      payload?.status ?? payload?.payment_status ?? body?.status ?? ''
    ).toLowerCase();

    const clerkUserId =
      payload?.src ??
      payload?.sck ??
      payload?.reference ??
      payload?.tracking?.src ??
      payload?.metadata?.src ??
      payload?.metadata?.clerk_user_id ??
      body?.src ??
      '';

    const orderId =
      payload?.order_id ??
      payload?.transaction_id ??
      payload?.id ??
      body?.id ??
      '';

    // SOMENTE PAGAMENTOS CONFIRMADOS
    const statusAprovado = ['approved', 'paid', 'completed', 'active', 'aprovado', 'pago'].includes(status);

    if (!statusAprovado) {
      return NextResponse.json({ received: true, action: 'ignored', status });
    }

    const userIdentifier = clerkUserId || email;

    if (!userIdentifier) {
      return NextResponse.json({ received: true, warning: 'dados ausentes' }, { status: 200 });
    }

    let user = clerkUserId ? await findUserByClerkId(clerkUserId) : null;
    if (!user && email) {
      user = await findUserByClerkId(email);
    }

    if (user?.id) {
      await markUserPremium(user.id, String(orderId));
    } else {
      await createUser({
        clerk_user_id: clerkUserId || email,
        email: email,
        is_premium: true,
        premium_since: new Date().toISOString().split('T')[0],
        referred_by: null,
        cakto_order_id: String(orderId),
      });
    }

    return NextResponse.json({ received: true, action: 'premium_activated', user: userIdentifier });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro interno no webhook' }, { status: 500 });
  }
}