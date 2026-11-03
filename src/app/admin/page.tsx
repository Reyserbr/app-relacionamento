/**
 * Painel administrativo da LilithLove.
 * Protegido: apenas e-mails listados em ADMIN_EMAILS (ou o padrão) têm acesso.
 */
export const dynamic = 'force-dynamic';

import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { isCurrentUserAdmin } from '@/lib/admin';
import AdminAffiliates from './AdminAffiliates';

export default async function AdminPage() {
  const { userId } = await auth();
  const isAdmin = userId ? await isCurrentUserAdmin() : false;

  return (
    <main className="flex min-h-screen flex-col bg-stone-50 text-stone-800 dark:bg-[#140a0f] dark:text-stone-200 font-sans">
      <Navbar />
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {!isAdmin ? (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="text-5xl mb-4">🔒</div>
            <h1 className="text-2xl font-serif font-bold text-stone-800 dark:text-stone-50 mb-3">
              Acesso restrito
            </h1>
            <p className="text-stone-500 dark:text-stone-300 mb-6">
              Esta área é exclusiva para administradores da LilithLove.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg transition-colors text-sm font-semibold"
            >
              Voltar para o início
            </Link>
          </div>
        ) : (
          <AdminAffiliates />
        )}
      </div>
    </main>
  );
}
