import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Libera a Home (vitrine) e as páginas de login próprias para qualquer visitante ver sem bloqueio
  publicRoutes: ["/", "/sign-in(.*)", "/sign-up(.*)"],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};