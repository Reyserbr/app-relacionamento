import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { findUserByClerkId } from '@/lib/baserow';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ isPremium: false });

    const user = await findUserByClerkId(userId);
    return NextResponse.json({ isPremium: Boolean(user?.is_premium) });
  } catch (e) {
    return NextResponse.json({ isPremium: false });
  }
}