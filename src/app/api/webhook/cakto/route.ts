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
      console.error('Webhook Cakto: secret inválido');
      return NextResponse.json({ error: 'Secret inválido' }, { status: 403 });
    }

    const body = await request.json();
    console.log('Webhook Cakto recebido:', JSON.stringify(body));

    // A Cakto pode enviar os dados na raiz (body) ou dentro de body.data
    const payload = body?.data ?? body;
    const eventName = String(body?.event ?? payload?.event ?? '').toLowerCase();

    const email =
      payload?.customer?.email ??
      payload?.buyer?.email ??
      payload?.email ??
      body?.customer?.email ??
      '';

    const status = String(
      payload?.status ?? payload?.payment_status ?? body?.status ?? ''
    ).toLowerCase();

    // Captura o clerk_user_id de todas as variáveis possíveis de rastreio da Cakto
    const clerkUserId =
      payload?.src ??
      payload?.sck ??
      payload?.reference ??
      payload?.tracking?.src ??
      payload?.utm_source ??
      payload?.metadata?.src ??
      payload?.metadata?.clerk_user_id ??
      body?.src ??
      '';

    const orderId =
      payload?.order_id ??
      payload?.transaction_id ??
      payload?.id ??
      body?.id ??
      'teste_pix';

    // ⚠️ MODO DE TESTE ATIVO: Inclui 'waiting_payment', 'pending' e 'pix' para ativar só de gerar o QR Code!
    // (Depois do teste, removeremos os status de espera e deixaremos só os pagos)
    const statusPermitidos = [
      'approved',
      'paid',
      'completed',
      'active',
      'waiting_payment',
      'pending',
      'pix_generated',
      'gerado',
      'aguardando pagamento'
    ];

    const isEventoPixGerado =
      eventName.includes('pix') ||
      eventName.includes('created') ||
      eventName.includes('gerado') ||
      eventName.includes('waiting');

    if (!statusPermitidos.includes(status) && !isEventoPixGerado) {
      console.log(`Webhook Cakto: status "${status}" / evento "${eventName}" ignorado`);
      return NextResponse.json({ received: true, action: 'ignored', status, eventName });
    }

    // Identificador: prioriza o ID do Clerk, mas se não vier, usa o e-mail para não perder a venda!
    const userIdentifier = clerkUserId || email;

    if (!userIdentifier) {
      console.error('Webhook Cakto: nem clerk_user_id nem email encontrados');
      return NextResponse.json({ received: true, warning: 'dados ausentes' }, { status: 200 });
    }

    // Busca no Baserow pelo ID do Clerk (ou pelo e-mail, se não achou pelo ID)
    let user = clerkUserId ? await findUserByClerkId(clerkUserId) : null;
    if (!user && email) {
      user = await findUserByClerkId(email);
    }

    if (user?.id) {
      await markUserPremium(user.id, String(orderId));
      console.log(`Usuário ${userIdentifier} atualizado para premium!`);
    } else {
      await createUser({
        clerk_user_id: clerkUserId || email,
        email: email,
        is_premium: true,
        premium_since: new Date().toISOString().split('T')[0],
        referred_by: null,
        cakto_order_id: String(orderId),
      });
      console.log(`Novo usuário ${userIdentifier} criado como premium no Baserow!`);
    }

    return NextResponse.json({ received: true, action: 'premium_activated', user: userIdentifier });
  } catch (error: any) {
    console.error('Erro no webhook Cakto:', error);
    return NextResponse.json(
      { error: 'Erro interno no webhook', details: error?.message },
      { status: 500 }
    );
  }
}