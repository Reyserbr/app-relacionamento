import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

// Busca o histórico salvo na nuvem da conta do usuário
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ sessions: null });

    const key = req.nextUrl.searchParams.get("key") || "lilith";
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const allHistory = (user.unsafeMetadata?.chatHistory as Record<string, any>) || {};

    return NextResponse.json({ sessions: allHistory[key] || null });
  } catch (e) {
    return NextResponse.json({ sessions: null });
  }
}

// Salva o histórico na nuvem da conta (sincroniza PC e Celular)
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false });

    const { key, sessions } = await req.json();
    if (!key || !Array.isArray(sessions)) return NextResponse.json({ ok: false });

    // Limita às últimas 10 sessões e últimas 25 mensagens por sessão para ficar leve e rápido
    const compactSessions = sessions.slice(0, 10).map((s: any) => ({
      id: s.id,
      title: s.title,
      updatedAt: s.updatedAt,
      bonusLimit: s.bonusLimit || 0,
      messages: (s.messages || []).slice(-25).map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
      })),
    }));

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const currentHistory = (user.unsafeMetadata?.chatHistory as Record<string, any>) || {};

    await client.users.updateUserMetadata(userId, {
      unsafeMetadata: {
        ...user.unsafeMetadata,
        chatHistory: {
          ...currentHistory,
          [key]: compactSessions,
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false });
  }
}