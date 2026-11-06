import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function TermosPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#faf7f5] text-stone-800 dark:bg-[#140a0f] dark:text-stone-200 font-sans">
      <Navbar />

      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-12 sm:py-16 space-y-8 leading-relaxed text-sm sm:text-base">
        <div className="border-b border-stone-200 dark:border-white/10 pb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 block mb-2">
            Documento Legal • Conformidade e Transparência
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-white">
            Termos e Condições de Uso
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
            Última atualização: Novembro de 2026
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
            1. Aceitação dos Termos
          </h2>
          <p className="text-stone-600 dark:text-stone-300">
            Ao acessar, cadastrar-se ou utilizar a plataforma <strong>LilithLove</strong>, você concorda integralmente com estes Termos de Uso. Caso não concorde com qualquer disposição aqui presente, recomendamos que interrompa imediatamente o uso dos nossos serviços. A plataforma é destinada exclusivamente a maiores de 18 (dezoito) anos.
          </p>
        </section>

        <section className="p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 space-y-3">
          <h2 className="text-xl font-serif font-bold text-amber-950 dark:text-amber-300">
            2. Natureza do Serviço (Inteligência Artificial) e Isenção de Garantia de Resultados
          </h2>
          <p className="text-amber-900/90 dark:text-amber-200/90">
            A <strong>LilithLove</strong> utiliza modelos avançados de Inteligência Artificial generativa para oferecer análises comportamentais, sugestões de comunicação, entretenimento astrológico/simbólico e conteúdos educativos sobre dinâmicas de relacionamento.
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-amber-900/90 dark:text-amber-200/90">
            <li>
              <strong>Ausência de Garantia de Resultado (100%):</strong> Relacionamentos humanos envolvem o livre-arbítrio, emoções e circunstâncias externas de terceiros. Portanto, a LilithLove <strong>não garante</strong> que o uso das estratégias, mensagens ou protocolos resultará na reconquista de ex-parceiros(as), início de namoro ou sucesso amoroso específico.
            </li>
            <li>
              <strong>Não Substituição de Apoio Profissional:</strong> As respostas geradas pela IA têm caráter informativo, estratégico e de entretenimento, <strong>não substituindo</strong> atendimento psicológico, psiquiátrico, médico ou jurídico profissional.
            </li>
            <li>
              <strong>Responsabilidade pelas Ações:</strong> O usuário é o único e exclusivo responsável pelas mensagens que decidir enviar, pelas atitudes tomadas em sua vida pessoal e pelas consequências de suas interações com terceiros.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
            3. Planos, Pagamentos e Cancelamento
          </h2>
          <p className="text-stone-600 dark:text-stone-300">
            A plataforma oferece acesso gratuito limitado (com possibilidade de visualização de anúncios patrocinados) e o plano de assinatura <strong>VIP Premium</strong>, processado de forma segura pela plataforma parceira <strong>Cakto</strong>. O assinante pode solicitar o cancelamento da renovação de sua assinatura a qualquer momento, respeitando os prazos legais do Código de Defesa do Consumidor.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
            4. Conduta do Usuário e Uso Aceitável
          </h2>
          <p className="text-stone-600 dark:text-stone-300">
            É estritamente proibido utilizar a plataforma para planejar, incentivar ou praticar atos de assédio, perseguição (<em>stalking</em>), violência física ou psicológica, difamação, chantagem ou qualquer atividade ilícita. O descumprimento destas regras acarretará o bloqueio imediato da conta sem direito a reembolso.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
            5. Propriedade Intelectual
          </h2>
          <p className="text-stone-600 dark:text-stone-300">
            Todo o design, logomarca, textos das trilhas de desenvolvimento, estrutura de prompts e códigos da LilithLove são protegidos por direitos autorais, sendo proibida a cópia, redistribuição ou comercialização não autorizada.
          </p>
        </section>

        <div className="pt-6 border-t border-stone-200 dark:border-white/10 flex flex-wrap gap-4 text-xs font-semibold text-rose-700 dark:text-rose-400">
          <Link href="/" className="hover:underline">← Voltar ao Início</Link>
          <span>•</span>
          <Link href="/privacidade" className="hover:underline">Política de Privacidade</Link>
          <span>•</span>
          <Link href="/contato" className="hover:underline">Fale Conosco</Link>
        </div>
      </div>
    </main>
  );
}