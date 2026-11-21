import "./globals.css";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";
import { RefTracker } from "@/components/ref-tracker";
import AdBanner from "@/components/AdBanner";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata = {
  title: "LilithLove",
  description: "Sua conselheira amorosa e guia de inteligência emocional.",
};

const forceDarkScript = `(function(){try{document.documentElement.classList.add('dark');localStorage.setItem('theme','dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="pt-BR"
        className={`dark ${jakarta.variable} ${fraunces.variable}`}
        suppressHydrationWarning
      >
        <head>
          <script dangerouslySetInnerHTML={{ __html: forceDarkScript }} />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#140a0f" />
          <link rel="apple-touch-icon" href="/logo.png" />
          {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
              crossOrigin="anonymous"
            />
          )}
        </head>
        <body className="font-sans antialiased bg-[#140a0f] text-stone-200">
          <Suspense fallback={null}>
            <RefTracker />
          </Suspense>
          {children}
          <AdBanner format="horizontal" slotId="GLOBAL_BOTTOM_SLOT" />
        </body>
      </html>
    </ClerkProvider>
  );
}