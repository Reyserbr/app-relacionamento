/**
 * Helper para verificar se o usuário logado é administrador.
 * A lista de e-mails de admin pode ser configurada na env ADMIN_EMAILS
 * (separados por vírgula). Caso não esteja definida, usa o e-mail padrão.
 */
import { currentUser } from '@clerk/nextjs/server';

const DEFAULT_ADMIN = 'oitavo.reefrota@gmail.com';

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? DEFAULT_ADMIN;
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Retorna o e-mail do usuário logado, ou null. */
export async function getCurrentUserEmail(): Promise<string | null> {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
  return email ? email.toLowerCase() : null;
}

/** Retorna true se o usuário logado for administrador. */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const email = await getCurrentUserEmail();
  if (!email) return false;
  return getAdminEmails().includes(email);
}
