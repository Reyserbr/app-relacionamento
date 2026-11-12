import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/sobre",
    "/planos",
    "/trilhas",
    "/comunidade",
    "/termos",
    "/privacidade",
    "/contato",
    "/sign-in(.*)",
    "/sign-up(.*)",
    // Rotas públicas de configuração, status e webhooks
    "/api/affiliate/config",
    "/api/status",
    "/api/webhook/cakto",
    "/api/webhook/clerk",
    "/manifest.json",
    "/sw.js",
    "/ads.txt",
  ],
  afterAuth(auth, req) {
    // Se o usuário não estiver logado e clicar em qualquer botão que leva ao chat ou painel restrito:
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};