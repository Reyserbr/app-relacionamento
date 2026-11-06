import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function PrivacidadePage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#faf7f5] text-stone-800 dark:bg-[#140a0f] dark:text-stone-200 font-sans">
      <Navbar />

      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-12 sm:py-16 space-y-8 leading-relaxed text-sm sm:text-base">
        <div className="border-b border-stone-200 dark:border-white/10 pb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 block mb-2">
            LGPD & Conformidade de Publicidade
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-white">
            Política de Privacidade e Cookies
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
            Última atualização: Novembro de 2026
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
            1. Compromisso com o Sigilo e a Privacidade
          </h2>
          <p className="text-stone-600 dark:text-stone-300">
            A <strong>LilithLove</strong> respeita profundamente a sua privacidade e a confidencialidade dos seus relatos amorosos, operando em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
            2. Dados Coletados e Finalidade
          </h2>
          <ul className="list-disc list-inside space-y-1.5 text-stone-600 dark:text-stone-300">
            <li>
              <strong>Dados de Autenticação:</strong> Coletamos seu nome e endereço de e-mail através do sistema seguro <em>Clerk</em> exclusivamente para criação de conta, login e sincronização do seu histórico de conversas entre dispositivos.
            </li>
            <li>
              <strong>Relatos, Imagens e Áudios no Chat:</strong> Os textos, prints e áudios enviados nos módulos de chat são processados de forma automatizada pela API de Inteligência Artificial exclusivamente para gerar a resposta solicitada por você. Não vendemos nem expomos suas conversas privadas a terceiros.
            </li>
            <li>
              <strong>Dados de Pagamento:</strong> Transações financeiras são processadas diretamente pelo gateway seguro <em>Cakto</em>. A LilithLove não armazena números de cartão de crédito em seus servidores.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
            3. Cookies e Publicidade de Terceiros (Google AdSense)
          </h2>
          <p className="text-stone-600 dark:text-stone-300">
            Utilizamos cookies para armazenar preferências de sessão (como tema claro/escuro e identificação de indicação). Além disso, exibimos anúncios fornecidos por redes de publicidade de terceiros, incluindo o <strong>Google AdSense</strong>:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-stone-600 dark:text-stone-300">
            <li>
              Terceiros, incluindo o Google, usam cookies para veicular anúncios com base em visitas anteriores do usuário ao nosso site ou a outros sites na internet.
            </li>
            <li>
              Com o uso de cookies de publicidade (como o cookie <em>DoubleClick DART</em>), o Google e seus parceiros podem veicular anúncios personalizados para os usuários com base nas visitas feitas aos nossos sites e/ou a outros sites na internet.
            </li>
            <li>
              Os usuários podem desativar a publicidade personalizada acessando as <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-rose-600 dark:text-rose-400 underline">Configurações de Anúncios do Google</a> ou visitando o site <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-rose-600 dark:text-rose-400 underline">www.aboutads.info</a>.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
            4. Seus Direitos (Exclusão de Dados)
          </h2>
          <p className="text-stone-600 dark:text-stone-300">
            Você pode excluir casos individuais diretamente na barra lateral do chat a qualquer momento ou solicitar a exclusão completa da sua conta e de todos os dados associados entrando em contato pelo nosso canal de suporte.
          </p>
        </section>

        <div className="pt-6 border-t border-stone-200 dark:border-white/10 flex flex-wrap gap-4 text-xs font-semibold text-rose-700 dark:text-rose-400">
          <Link href="/" className="hover:underline">← Voltar ao Início</Link>
          <span>•</span>
          <Link href="/termos" className="hover:underline">Termos de Uso</Link>
          <span>•</span>
          <Link href="/contato" className="hover:underline">Fale Conosco</Link>
        </div>
      </div>
    </main>
  );
}