import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { findUserByClerkId } from '@/lib/baserow';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ isPremium: false, reason: 'not_logged_in' });

    let user = await findUserByClerkId(userId);

    // Se não achou pelo ID, tenta buscar pelo e-mail da conta logada
    if (!user) {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
      if (email) {
        user = await findUserByClerkId(email);
      }
    }

    if (!user || !user.is_premium) {
      return NextResponse.json({ isPremium: false, reason: 'not_premium_in_baserow' });
    }

    // VERIFICAÇÃO DE PRAZO DE 30 DIAS (Baseado na coluna premium_since)
    if (user.premium_since) {
      let startDate: Date;
      const rawDate = String(user.premium_since).trim();

      // Suporta formato brasileiro (28/10/2026) ou ISO (2026-10-28)
      if (rawDate.includes('/')) {
        const [day, month, year] = rawDate.split(' ')[0].split('/');
        startDate = new Date(Number(year), Number(month) - 1, Number(day));
      } else {
        startDate = new Date(rawDate);
      }

      if (!isNaN(startDate.getTime())) {
        const diffMs = Date.now() - startDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        // Se passou de 30 dias, corta o acesso!
        if (diffDays > 30) {
          return NextResponse.json({
            isPremium: false,
            expired: true,
            daysActive: Math.floor(diffDays),
          });
        }
      }
    }

    return NextResponse.json({ isPremium: true });
  } catch (e: any) {
    return NextResponse.json({ isPremium: false, error: e?.message });
  }
}